require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Registeruser = require("./model");
const jwt = require("jsonwebtoken");
const middleware = require("./middleware");
const cors = require("cors");

const app = express();

// CONNECT MONGODB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB Error:", err));

// MIDDLEWARES
app.use(express.json());
app.use(
  cors({
    origin: "*", // or "https://your-frontend.netlify.app"
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-token"],
  })
);

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
      password,
      confirmpassword,
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

    let exist = await Registeruser.findOne({ email });
    if (!exist) return res.status(400).send("User not found");

    if (exist.password !== password)
      return res.status(400).send("Invalid credentials");

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
    let exist = await Registeruser.findById(req.user.id);
    if (!exist) return res.status(400).send("User not found");

    res.json(exist);
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

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
