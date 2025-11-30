const express = require("express");
const mongoose = require("mongoose");
const Registeruser = require("./model");
const jwt = require("jsonwebtoken");
const middleware = require("./middleware");
const cors = require("cors");
const app = express();

mongoose
  .connect(
    "mongodb+srv://bharath7672_db_user:on2eDIbYI7YrSyfG@mitrama.v9yzerd.mongodb.net/"
  )
  .then(() => console.log("DB connected"));

app.use(express.json());
app.use(cors({ origin: "*" }));

app.post("/register", async (req, res) => {
  try {
    const { username, email, password, confirmpassword } = req.body;
    let exist = await Registeruser.findOne({ email });

    if (exist) {
      return res.status(400).send("User already exist");
    }
    if (password !== confirmpassword) {
      return res.status(400).send("Password do not match");
    }
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

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let exist = await Registeruser.findOne({ email });
    if (!exist) {
      return res.status(400).send("User not found");
    }
    if (exist.password !== password) {
      return res.status(400).send("Invalid credentials");
    }
    let payload = {
      user: {
        id: exist.id,
      },
    };
    jwt.sign(payload, "jwtSecret", { expiresIn: 3600000 }, (err, token) => {
      if (err) throw err;
      return res.json({ token });
    });
  } catch {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

app.get("/main", middleware, async (req, res) => {
  try {
    let exist = await Registeruser.findById(req.user.id);
    if (!exist) {
      return res.status(400).send("user not found");
    }
    res.json(exist);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});
app.listen(5000, () => {
  console.log("Server is runnng");
});
