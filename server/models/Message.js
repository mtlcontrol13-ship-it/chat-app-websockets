import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderUsername: {
      type: String,
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["message", "status"],
      default: "message",
    },
    edited: {
      type: Boolean,
      default: false,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    seenAt: {
      type: Date,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for querying messages between two users
messageSchema.index({ senderId: 1, recipientId: 1, timestamp: 1 });
messageSchema.index({ recipientId: 1, timestamp: 1 });

export const Message = mongoose.model("Message", messageSchema);
