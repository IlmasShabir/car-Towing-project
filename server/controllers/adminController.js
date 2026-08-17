const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const AdminUser = require("../models/AdminUser");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Service = require("../models/Service");
const Notification = require("../models/Notification");

// @desc    Admin login - authenticates against the MongoDB Database
// @route   POST /api/admin/login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Find admin by username
    const admin = await AdminUser.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check if account status is approved
    if (admin.status !== "approved") {
      return res
        .status(403)
        .json({ message: "Your account is pending or rejected" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
        username: admin.username,
        isSuperAdmin: admin.role === "superadmin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    admin.lastLoginAt = new Date();
    await admin.save().catch(() => {});

    res.json({
      token,
      user: admin.toSafeJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Get the current admin's profile
// @route   GET /api/admin/me
const getMe = async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.admin.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" });
    }
    res.json(admin.toSafeJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update the current admin's profile (name, email, password)
// @route   PUT /api/admin/me
const updateProfile = async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    const { name, email, currentPassword, newPassword } = req.body;

    if (name !== undefined) admin.name = String(name).trim();
    if (email !== undefined) {
      const cleanEmail = String(email).trim();
      const existing = await AdminUser.findOne({ email: cleanEmail });
      if (existing && existing._id.toString() !== admin._id.toString()) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      admin.email = cleanEmail;
    }

    if (newPassword) {
      if (!currentPassword || !(await bcrypt.compare(currentPassword, admin.password))) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      if (String(newPassword).length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(String(newPassword), salt);
    }

    await admin.save();
    res.json(admin.toSafeJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List admin accounts (paged)
// @route   GET /api/admin/admins?page=&limit=&search=
const getAdmins = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      const search = new RegExp(req.query.search.trim(), "i");
      filter.$or = [{ username: search }, { email: search }, { name: search }];
    }
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    const [admins, total] = await Promise.all([
      AdminUser.find(filter)
        .select("-password")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      AdminUser.countDocuments(filter),
    ]);

    res.json({
      data: admins.map((a) => a.toSafeJSON()),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      limit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new admin account (superadmin only)
// @route   POST /api/admin/admins
const createAdmin = async (req, res) => {
  try {
    if (!req.admin.isSuperAdmin) {
      return res
        .status(403)
        .json({ message: "Only the owner (superadmin) can create admin accounts" });
    }

    const { username, email, password, name, status, role } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email and password are required" });
    }
    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const exists = await AdminUser.findOne({
      $or: [{ username }, { email }],
    });
    if (exists) {
      return res
        .status(400)
        .json({ message: "A admin account with this username or email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const admin = await AdminUser.create({
      username: String(username).trim(),
      email: String(email).trim(),
      password: await bcrypt.hash(String(password), salt),
      name: name ? String(name).trim() : "",
      status: status === "rejected" || status === "pending" ? status : "approved",
      role: role === "superadmin" ? "superadmin" : "admin",
    });

    res.status(201).json(admin.toSafeJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an admin account (status/name/email/role) - superadmin only
// @route   PUT /api/admin/admins/:id
const updateAdmin = async (req, res) => {
  try {
    if (!req.admin.isSuperAdmin) {
      return res
        .status(403)
        .json({ message: "Only the owner (superadmin) can manage admin accounts" });
    }

    const admin = await AdminUser.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    const { status, name, email, role, password } = req.body;

    if (status !== undefined && ["pending", "approved", "rejected"].includes(status)) {
      admin.status = status;
    }
    if (name !== undefined) admin.name = String(name).trim();
    if (email !== undefined) {
      const cleanEmail = String(email).trim();
      const existing = await AdminUser.findOne({ email: cleanEmail });
      if (existing && existing._id.toString() !== admin._id.toString()) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      admin.email = cleanEmail;
    }
    if (role !== undefined && ["superadmin", "admin"].includes(role)) {
      admin.role = role;
    }
    if (password) {
      if (String(password).length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(String(password), salt);
    }

    await admin.save();
    res.json(admin.toSafeJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an admin account (superadmin only, cannot delete self)
// @route   DELETE /api/admin/admins/:id
const deleteAdmin = async (req, res) => {
  try {
    if (!req.admin.isSuperAdmin) {
      return res
        .status(403)
        .json({ message: "Only the owner (superadmin) can delete admin accounts" });
    }

    if (req.params.id === String(req.admin.id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const admin = await AdminUser.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    if (admin.role === "superadmin") {
      const superAdminCount = await AdminUser.countDocuments({ role: "superadmin" });
      if (superAdminCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot delete the last superadmin account" });
      }
    }

    await admin.deleteOne();
    res.json({ message: "Admin account deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dashboard analytics - aggregated from real database data
// @route   GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    // ---- Totals -----------------------------------------------------------
    const [bookingStatusCounts, servicesCount, reviewsCount, adminsCount, unreadCount] =
      await Promise.all([
        Booking.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Service.countDocuments(),
        Review.countDocuments(),
        AdminUser.countDocuments(),
        Notification.countDocuments({ read: false }),
      ]);

    const statusMap = { pending: 0, "in-progress": 0, completed: 0, cancelled: 0 };
    bookingStatusCounts.forEach((s) => {
      if (statusMap[s._id] !== undefined) statusMap[s._id] = s.count;
    });

    const bookingsTotal = Object.values(statusMap).reduce((a, b) => a + b, 0);

    // ---- Bookings trend (last 14 days) ------------------------------------
    // The business operates in Dubai (UTC+4) — group by local day so the
    // chart lines up with how the owner thinks about "today".
    const days = 14;
    const timezone = "+04:00";
    const nowLocal = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" }));
    const startOfToday = new Date(nowLocal);
    startOfToday.setHours(0, 0, 0, 0);
    const startDay = new Date(startOfToday);
    startDay.setDate(startDay.getDate() - (days - 1));

    const trendAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDay } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone,
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);
    const trendMap = {};
    trendAgg.forEach((t) => {
      trendMap[t._id] = t.count;
    });

    const bookingsTrend = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDay);
      d.setDate(startDay.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      bookingsTrend.push({
        date: key,
        label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        count: trendMap[key] || 0,
      });
    }

    // ---- Rating distribution ------------------------------------------------
    const ratingAgg = await Review.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    let ratingCount = 0;
    ratingAgg.forEach((r) => {
      if (ratingDistribution[r._id] !== undefined) {
        ratingDistribution[r._id] = r.count;
      }
      ratingSum += r._id * r.count;
      ratingCount += r.count;
    });

    // ---- Recent activity -----------------------------------------------------
    const [recentBookings, recentReviews, recentNotifications] = await Promise.all([
      Booking.find().sort({ createdAt: -1 }).limit(8),
      Review.find().sort({ createdAt: -1 }).limit(5),
      Notification.find().sort({ createdAt: -1 }).limit(6),
    ]);

    res.json({
      totals: {
        bookings: bookingsTotal,
        services: servicesCount,
        reviews: reviewsCount,
        admins: adminsCount,
        unreadNotifications: unreadCount,
      },
      bookingStatus: statusMap,
      bookingsTrend,
      ratingDistribution,
      averageRating: ratingCount ? +(ratingSum / ratingCount).toFixed(2) : 0,
      recentBookings,
      recentReviews,
      recentNotifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  adminLogin,
  getMe,
  updateProfile,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getDashboardStats,
};