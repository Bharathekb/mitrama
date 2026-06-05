const mongoose = require("mongoose");

let Registeruser = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  confirmpassword: {
    type: String,
    select: false,
  },
});
module.exports = mongoose.model("Rigisteruser", Registeruser);
