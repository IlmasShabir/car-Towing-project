const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, default: "" },
    role: {
      type: String,
      enum: ["superadmin", "admin"],
      default: "admin",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

adminUserSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    name: this.name,
    role: this.role,
    status: this.status,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("AdminUser", adminUserSchema);