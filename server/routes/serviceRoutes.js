const express = require('express');
const router = express.Router();
const {
  getServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protectAdmin } = require('../middleware/adminAuth');

router.get('/', getServices);
router.post('/', protectAdmin, createService);
router.put('/:id', protectAdmin, updateService);
router.delete('/:id', protectAdmin, deleteService);

module.exports = router;
