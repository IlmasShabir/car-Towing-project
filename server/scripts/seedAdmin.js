const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const AdminUser = require("../models/AdminUser");

const seedAdmin = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/towing";

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected successfully.");

    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const plainPassword = process.env.ADMIN_PASSWORD || "admin123";

    const existingAdmin = await AdminUser.findOne({ username: adminUsername });

    if (existingAdmin) {
      console.log(
        `Admin account '${adminUsername}' already exists. Skipping creation.`,
      );
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      await AdminUser.create({
        username: adminUsername,
        email: "admin@towing.com",
        password: hashedPassword,
        status: "approved",
      });

      console.log(
        `Success: Admin user '${adminUsername}' created successfully.`,
      );
    }
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

seedAdmin();
