const mongoose = require("mongoose");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const AdminUser = require("../models/AdminUser");

// Promotes the first admin account (or a username given as argv[2]) to
// superadmin so it can manage other admin accounts in the panel.
// Usage: node scripts/promoteSuperAdmin.js [username]
const promoteSuperAdmin = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/towing";
  const username = process.argv[2] || process.env.ADMIN_USERNAME || "admin";

  try {
    await mongoose.connect(uri);

    const admin = await AdminUser.findOne({ username });
    if (!admin) {
      console.error(`No admin account found with username '${username}'`);
      process.exit(1);
    }

    if (admin.role === "superadmin") {
      console.log(`'${username}' is already a superadmin.`);
    } else {
      admin.role = "superadmin";
      await admin.save();
      console.log(`'${username}' promoted to superadmin.`);
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

promoteSuperAdmin();