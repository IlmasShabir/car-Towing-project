const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["booking", "review", "service", "admin", "system"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, default: "" },
    read: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    targetType: { type: String, default: "" },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    actionUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

notificationSchema.index({ read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);