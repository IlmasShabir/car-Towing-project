const express = require('express');
const router = express.Router();
const {
  getServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protectAdmin } = require('../middleware/adminAuth');
const { upload, processImage, handleUploadErrors } = require('../middleware/upload');

router.get('/', getServices);
router.post('/', protectAdmin, upload.single('image'), processImage, handleUploadErrors, createService);
router.put('/:id', protectAdmin, upload.single('image'), processImage, handleUploadErrors, updateService);
router.delete('/:id', protectAdmin, deleteService);

module.exports = router;