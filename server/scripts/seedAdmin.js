const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const AdminUser = require("../models/AdminUser");

const seedAdmin = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    const adminUsername = "usama1351";
    const plainPassword = "usama@17";

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
        email: "usama@admin.com",
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
    // Always close connection when script finishes
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

seedAdmin();
