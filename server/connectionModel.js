const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rigisteruser",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rigisteruser",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

ConnectionSchema.index({ requester: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model("Connection", ConnectionSchema);