const Notification = require("../models/Notification");

/**
 * Creates a notification for the admin panel.
 * Designed so new notification types can be added by simply calling this
 * helper with a `type` that matches the model enum (extend the enum in
 * models/Notification.js when adding a brand new category).
 *
 * @param {object} data
 * @param {'booking'|'review'|'service'|'admin'|'system'} data.type
 * @param {string} data.title
 * @param {string} [data.message]
 * @param {'low'|'medium'|'high'} [data.priority]
 * @param {string} [data.targetType]
 * @param {string} [data.targetId]
 * @param {string} [data.actionUrl]
 */
const createNotification = async (data) => {
  try {
    return await Notification.create(data);
  } catch (error) {
    // Notifications are best-effort — a failure here must never break the
    // primary request (e.g. a customer submitting a booking).
    console.error("Failed to create notification:", error.message);
    return null;
  }
};

module.exports = { createNotification };