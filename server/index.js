require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Registeruser = require("./model");
const jwt = require("jsonwebtoken");
const middleware = require("./middleware");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./messageModel");
const Connection = require("./connectionModel");
const {
  hashPassword,
  verifyPassword,
  isHashedPassword,
} = require("./authUtils");
const {
  encryptMessagePayload,
  decryptMessagePayload,
} = require("./messageCrypto");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, "http://localhost:3000"]
  : "*";

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 12 * 1024 * 1024,
});

const onlineUsers = new Map();

const isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString());
};

const addOnlineUser = (userId) => {
  const key = userId.toString();
  onlineUsers.set(key, (onlineUsers.get(key) || 0) + 1);
};

const removeOnlineUser = (userId) => {
  const key = userId.toString();
  const connectionCount = onlineUsers.get(key) || 0;

  if (connectionCount <= 1) {
    onlineUsers.delete(key);
    return true;
  }

  onlineUsers.set(key, connectionCount - 1);
  return false;
};

const migratePlainTextPasswords = async () => {
  try {
    const users = await Registeruser.find({
      password: { $not: /^pbkdf2\$/ },
    }).select("+password +confirmpassword");

    await Promise.all(
      users.map((user) => {
        user.password = hashPassword(user.password);
        user.confirmpassword = undefined;
        return user.save();
      })
    );

    if (users.length > 0) {
      console.log(`Secured ${users.length} legacy password(s)`);
    }
  } catch (err) {
    console.log("Password migration error:", err);
  }
};

// CONNECT MONGODB
mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("DB connected");
    await migratePlainTextPasswords();
  })
  .catch((err) => console.log("DB Error:", err));

// MIDDLEWARES
app.use(express.json({ limit: "5mb" }));
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-token"],
  })
);

app.get("/", (req, res) => {
  res.send("Mitrama backend is running");
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, confirmpassword } = req.body;

    let exist = await Registeruser.findOne({ email });
    if (exist) return res.status(400).send("User already exist");

    if (password !== confirmpassword)
      return res.status(400).send("Password do not match");

    let newUser = new Registeruser({
      username,
      email,
      password: hashPassword(password),
    });

    await newUser.save();
    res.status(200).send("Registered successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let exist = await Registeruser.findOne({ email }).select("+password");
    if (!exist) return res.status(400).send("User not found");

    if (!verifyPassword(password, exist.password))
      return res.status(400).send("Invalid credentials");

    if (!isHashedPassword(exist.password)) {
      exist.password = hashPassword(password);
      exist.confirmpassword = undefined;
      await exist.save();
    }

    let payload = { user: { id: exist.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

// MAIN
app.get("/main", middleware, async (req, res) => {
  try {
    let exist = await Registeruser.findById(req.user.id).select(
      "username email profileImage"
    );
    if (!exist) return res.status(400).send("User not found");

    res.json(exist);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

app.put("/profile-image", middleware, async (req, res) => {
  try {
    const { profileImage } = req.body;

    if (profileImage && !profileImage.startsWith("data:image/")) {
      return res.status(400).send("Only image files are allowed");
    }

    if (profileImage && profileImage.length > 2 * 1024 * 1024) {
      return res.status(400).send("Profile image must be under 2MB");
    }

    const updatedUser = await Registeruser.findByIdAndUpdate(
      req.user.id,
      { profileImage: profileImage || "" },
      { new: true, select: "username email profileImage" }
    );

    if (!updatedUser) return res.status(400).send("User not found");

    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

app.get("/users", middleware, async (req, res) => {
  try {
    const currentUserId = req.user.id.toString();
    const users = await Registeruser.find(
      { _id: { $ne: req.user.id } },
      "username email profileImage"
    ).lean();

    const connections = await Connection.find({
      $or: [{ requester: req.user.id }, { receiver: req.user.id }],
    }).lean();

    const usersWithStatus = users.map((user) => {
      const userId = user._id.toString();
      const connection = connections.find((item) => {
        const requesterId = item.requester.toString();
        const receiverId = item.receiver.toString();

        return (
          (requesterId === currentUserId && receiverId === userId) ||
          (requesterId === userId && receiverId === currentUserId)
        );
      });

      return {
        ...user,
        connectionStatus: connection?.status || null,
        connectionDirection: connection
          ? connection.requester.toString() === currentUserId
            ? "sent"
            : "received"
          : null,
      };
    });

    res.json(usersWithStatus);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

// FORGOT PASSWORD
app.post("/forgot-password", async (req, res) => {
  try {
    const { email, password, confirmpassword } = req.body;

    if (!email || !password || !confirmpassword) {
      return res.status(400).send("All fields are required");
    }

    if (password !== confirmpassword) {
      return res.status(400).send("Password do not match");
    }

    if (password.length < 6) {
      return res.status(400).send("Password must be at least 6 characters");
    }

    const user = await Registeruser.findOne({ email }).select(
      "+password +confirmpassword"
    );

    if (!user) return res.status(400).send("User not found");

    user.password = hashPassword(password);
    user.confirmpassword = undefined;
    await user.save();

    res.status(200).send("Password updated successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});
app.get("/chat-users", middleware, async (req, res) => {
  try {
    const connections = await Connection.find({
      status: "accepted",
      $or: [{ requester: req.user.id }, { receiver: req.user.id }],
    })
      .populate("requester", "username email profileImage")
      .populate("receiver", "username email profileImage");

    const users = connections.map((connection) => {
      return connection.requester._id.toString() === req.user.id.toString()
  ? connection.receiver
  : connection.requester;
    });

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(req.user.id),
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadCountMap = unreadCounts.reduce((result, item) => {
      result[item._id.toString()] = item.count;
      return result;
    }, {});

    const usersWithUnreadCounts = users.map((chatUser) => {
      const userObject = chatUser.toObject();

      return {
        ...userObject,
        unreadCount: unreadCountMap[chatUser._id.toString()] || 0,
        isOnline: isUserOnline(chatUser._id),
      };
    });

    res.json(usersWithUnreadCounts);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});
// DELETE ACCOUNT
app.delete("/delete-account", middleware, async (req, res) => {
  try {
    const userId = req.user.id;

    await Registeruser.findByIdAndDelete(userId);

    res.status(200).send("Account deleted successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});


app.get("/messages/:receiverId", middleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const receiverId = req.params.receiverId;
    const limit = Math.min(Number(req.query.limit) || 30, 60);
    const before = req.query.before ? new Date(req.query.before) : null;
    const hasBeforeDate = before instanceof Date && !Number.isNaN(before.getTime());

    const canChat = await Connection.findOne({
      status: "accepted",
      $or: [
        { requester: currentUserId, receiver: receiverId },
        { requester: receiverId, receiver: currentUserId },
      ],
    });

    if (!canChat) {
      return res.status(403).send("You can only chat with accepted connections");
    }

    if (!hasBeforeDate) {
      await Message.updateMany(
        { sender: receiverId, receiver: currentUserId, isRead: false },
        { $set: { isRead: true, isDelivered: true } }
      );

      io.to(receiverId).emit("chat:messages-read", {
        readerId: currentUserId,
      });
    }

    const messageQuery = {
      $or: [
        { sender: currentUserId, receiver: receiverId },
        { sender: receiverId, receiver: currentUserId },
      ],
    };

    if (hasBeforeDate) {
      messageQuery.createdAt = { $lt: before };
    }

    const messages = await Message.find(messageQuery)
      .populate("sender", "username email profileImage")
      .populate("receiver", "username email profileImage")
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    const pageMessages = messages.slice(0, limit).reverse();

    res.json({
      messages: pageMessages.map(decryptMessagePayload),
      hasMore,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

app.put("/messages/:senderId/read", middleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const senderId = req.params.senderId;

    const canChat = await Connection.findOne({
      status: "accepted",
      $or: [
        { requester: currentUserId, receiver: senderId },
        { requester: senderId, receiver: currentUserId },
      ],
    });

    if (!canChat) {
      return res.status(403).send("You can only update accepted chats");
    }

    await Message.updateMany(
      { sender: senderId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true, isDelivered: true } }
    );

    io.to(senderId).emit("chat:messages-read", {
      readerId: currentUserId,
    });

    res.send("Messages marked as read");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Token not found"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.user.id;

    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", async (socket) => {
  socket.join(socket.userId);
  const wasOffline = !isUserOnline(socket.userId);
  addOnlineUser(socket.userId);

  if (wasOffline) {
    socket.broadcast.emit("user:online", { userId: socket.userId });
  }

  const deliveredMessages = await Message.aggregate([
    {
      $match: {
        receiver: new mongoose.Types.ObjectId(socket.userId),
        isDelivered: false,
      },
    },
    {
      $group: {
        _id: "$sender",
        count: { $sum: 1 },
      },
    },
  ]);

  if (deliveredMessages.length > 0) {
    await Message.updateMany(
      { receiver: socket.userId, isDelivered: false },
      { $set: { isDelivered: true } }
    );

    deliveredMessages.forEach((item) => {
      io.to(item._id.toString()).emit("chat:messages-delivered", {
        receiverId: socket.userId,
      });
    });
  }

  console.log("Socket connected:", socket.id);

  socket.on("chat:send", async ({
    receiverId,
    text,
    audioData,
    audioMimeType,
    mediaData,
    mediaMimeType,
    mediaName,
  }) => {
  try {
    const cleanText = text?.trim();
    const hasAudio = Boolean(audioData && audioMimeType);
    const hasMedia = Boolean(mediaData && mediaMimeType);
    const isImage = mediaMimeType?.startsWith("image/");
    const isVideo = mediaMimeType?.startsWith("video/");

    if (!receiverId || (!cleanText && !hasAudio && !hasMedia)) return;

    if ((mediaData || audioData || "").length > 11 * 1024 * 1024) {
      return socket.emit("chat:error", "File is too large");
    }

    const canChat = await Connection.findOne({
      status: "accepted",
      $or: [
        { requester: socket.userId, receiver: receiverId },
        { requester: receiverId, receiver: socket.userId },
      ],
    });

    if (!canChat) {
      return socket.emit(
        "chat:error",
        "You can only chat with accepted connections"
      );
    }

    const message = await Message.create(encryptMessagePayload({
      sender: socket.userId,
      receiver: receiverId,
      type: hasAudio
        ? "audio"
        : hasMedia && isImage
        ? "image"
        : hasMedia && isVideo
        ? "video"
        : hasMedia
        ? "file"
        : "text",
      text: cleanText,
      audioData: hasAudio ? audioData : undefined,
      audioMimeType: hasAudio ? audioMimeType : undefined,
      mediaData: hasMedia ? mediaData : undefined,
      mediaMimeType: hasMedia ? mediaMimeType : undefined,
      mediaName: hasMedia ? mediaName : undefined,
      isDelivered: isUserOnline(receiverId),
    }));

    const populatedMessage = await message.populate([
      { path: "sender", select: "username email profileImage" },
      { path: "receiver", select: "username email profileImage" },
    ]);

    const decryptedMessage = decryptMessagePayload(populatedMessage);

    io.to(socket.userId).emit("chat:new-message", decryptedMessage);
    io.to(receiverId).emit("chat:new-message", decryptedMessage);
  } catch (err) {
    console.log("Message error:", err);
    socket.emit("chat:error", "Could not send message");
  }
});

app.put("/change-password", middleware, async (req, res) => {
  try {
    const { currentPassword, password, confirmpassword } = req.body;

    if (!currentPassword || !password || !confirmpassword) {
      return res.status(400).send("All fields are required");
    }

    if (password !== confirmpassword) {
      return res.status(400).send("Password do not match");
    }

    if (password.length < 6) {
      return res.status(400).send("Password must be at least 6 characters");
    }

    const user = await Registeruser.findById(req.user.id).select(
      "+password +confirmpassword"
    );

    if (!user) return res.status(400).send("User not found");

    if (!verifyPassword(currentPassword, user.password)) {
      return res.status(400).send("Current password is incorrect");
    }

    user.password = hashPassword(password);
    user.confirmpassword = undefined;
    await user.save();

    res.status(200).send("Password changed successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

  socket.on("chat:delete", async ({ messageId }) => {
    try {
      if (!messageId) return;

      const message = await Message.findById(messageId);
      if (!message) {
        return socket.emit("chat:error", "Message not found");
      }

      if (message.sender.toString() !== socket.userId) {
        return socket.emit("chat:error", "You can delete only your messages");
      }

      await Message.findByIdAndDelete(messageId);

      io.to(message.sender.toString()).emit("chat:message-deleted", {
        messageId,
      });
      io.to(message.receiver.toString()).emit("chat:message-deleted", {
        messageId,
      });
    } catch (err) {
      console.log("Delete message error:", err);
      socket.emit("chat:error", "Could not delete message");
    }
  });

  socket.on("chat:clear", async ({ receiverId }) => {
    try {
      if (!receiverId) return;

      const canChat = await Connection.findOne({
        status: "accepted",
        $or: [
          { requester: socket.userId, receiver: receiverId },
          { requester: receiverId, receiver: socket.userId },
        ],
      });

      if (!canChat) {
        return socket.emit(
          "chat:error",
          "You can only clear accepted chats"
        );
      }

      await Message.deleteMany({
        $or: [
          { sender: socket.userId, receiver: receiverId },
          { sender: receiverId, receiver: socket.userId },
        ],
      });

      io.to(socket.userId).emit("chat:cleared", { receiverId });
      io.to(receiverId).emit("chat:cleared", { receiverId: socket.userId });
    } catch (err) {
      console.log("Clear chat error:", err);
      socket.emit("chat:error", "Could not clear chat");
    }
  });

  socket.on("disconnect", () => {
    const isNowOffline = removeOnlineUser(socket.userId);

    if (isNowOffline) {
      socket.broadcast.emit("user:offline", { userId: socket.userId });
    }

    console.log("Socket disconnected:", socket.id);
  });
});
app.post("/connections/request/:receiverId", middleware, async (req, res) => {
  try {
    const requesterId = req.user.id;
    const receiverId = req.params.receiverId;

    if (requesterId === receiverId) {
      return res.status(400).send("You cannot follow yourself");
    }

    const receiverExists = await Registeruser.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).send("User not found");
    }

    const existingConnection = await Connection.findOne({
      $or: [
        { requester: requesterId, receiver: receiverId },
        { requester: receiverId, receiver: requesterId },
      ],
    });

    if (existingConnection) {
      return res.status(400).send("Request already exists");
    }

    await Connection.create({
      requester: requesterId,
      receiver: receiverId,
      status: "pending",
    });

    res.status(201).send("Request sent");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

app.get("/connections/pending", middleware, async (req, res) => {
  try {
    const requests = await Connection.find({
      receiver: req.user.id,
      status: "pending",
    }).populate("requester", "username email profileImage");

    res.json(requests);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

app.put("/connections/accept/:connectionId", middleware, async (req, res) => {
  try {
    const connection = await Connection.findOneAndUpdate(
      {
        _id: req.params.connectionId,
        receiver: req.user.id,
        status: "pending",
      },
      { status: "accepted" },
      { new: true }
    );

    if (!connection) {
      return res.status(404).send("Request not found");
    }

    res.json(connection);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

app.delete("/connections/request/:receiverId", middleware, async (req, res) => {
  try {
    const connection = await Connection.findOneAndDelete({
      requester: req.user.id,
      receiver: req.params.receiverId,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).send("Request not found");
    }

    res.send("Request cancelled");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

app.delete("/connections/:userId", middleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const userId = req.params.userId;

    const connection = await Connection.findOneAndDelete({
      status: "accepted",
      $or: [
        { requester: currentUserId, receiver: userId },
        { requester: userId, receiver: currentUserId },
      ],
    });

    if (!connection) {
      return res.status(404).send("Accepted connection not found");
    }

    res.send("Unfollowed successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

// START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
