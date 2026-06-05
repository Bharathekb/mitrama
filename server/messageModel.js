const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rigisteruser",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rigisteruser",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "audio", "image", "video", "file"],
      default: "text",
    },
    text: {
      type: String,
      trim: true,
    },
    audioData: {
      type: String,
    },
    audioMimeType: {
      type: String,
    },
    mediaData: {
      type: String,
    },
    mediaMimeType: {
      type: String,
    },
    mediaName: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
