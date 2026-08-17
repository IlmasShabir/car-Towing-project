const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getMe,
  updateProfile,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getDashboardStats,
} = require('../controllers/adminController');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteNotifications,
  createNotificationForAdmin,
} = require('../controllers/notificationController');
const { protectAdmin } = require('../middleware/adminAuth');

// Public
router.post('/login', adminLogin);

// Everything below requires an authenticated admin JWT
router.get('/me', protectAdmin, getMe);
router.put('/me', protectAdmin, updateProfile);

router.get('/stats', protectAdmin, getDashboardStats);

router.get('/admins', protectAdmin, getAdmins);
router.post('/admins', protectAdmin, createAdmin);
router.put('/admins/:id', protectAdmin, updateAdmin);
router.delete('/admins/:id', protectAdmin, deleteAdmin);

router.get('/notifications', protectAdmin, getNotifications);
router.get('/notifications/unread-count', protectAdmin, getUnreadCount);
router.post('/notifications', protectAdmin, createNotificationForAdmin);
router.patch('/notifications/read-all', protectAdmin, markAllAsRead);
router.patch('/notifications/:id/read', protectAdmin, markAsRead);
router.delete('/notifications/:id', protectAdmin, deleteNotification);
router.delete('/notifications', protectAdmin, deleteNotifications);

module.exports = router;