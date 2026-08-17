const Notification = require("../models/Notification");
const { createNotification } = require("../utils/notifications");

// @desc    List notifications (paged, filterable)
// @route   GET /api/admin/notifications?page=&limit=&read=&type=&search=
const getNotifications = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.read === "true" || req.query.read === "false") {
      filter.read = req.query.read === "true";
    }
    if (req.query.type && req.query.type !== "all") {
      filter.type = req.query.type;
    }
    if (req.query.search) {
      const search = new RegExp(req.query.search.trim(), "i");
      filter.$or = [{ title: search }, { message: search }];
    }

    const [data, total, unread] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ read: false }),
    ]);

    res.json({
      data,
      total,
      unread,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      limit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread notification count
// @route   GET /api/admin/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/admin/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/admin/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { read: false },
      { $set: { read: true } },
    );
    res.json({ updated: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a single notification
// @route   DELETE /api/admin/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    await notification.deleteOne();
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete multiple notifications
// @route   DELETE /api/admin/notifications (body: { ids: [...] })
const deleteNotifications = async (req, res) => {
  try {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No notification ids provided" });
    }
    const result = await Notification.deleteMany({ _id: { $in: ids } });
    res.json({ deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a notification (admin-triggered, e.g. a note to the team)
// @route   POST /api/admin/notifications
const createNotificationForAdmin = async (req, res) => {
  try {
    const { type, title, message, priority, targetType, targetId, actionUrl } =
      req.body;

    if (!type || !title) {
      return res
        .status(400)
        .json({ message: "Type and title are required" });
    }

    const notification = await createNotification({
      type,
      title,
      message,
      priority,
      targetType,
      targetId,
      actionUrl,
    });

    if (!notification) {
      return res.status(400).json({ message: "Invalid notification payload" });
    }
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteNotifications,
  createNotificationForAdmin,
};