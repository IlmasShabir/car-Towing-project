const Service = require('../models/Service');

// @desc    Get all services (public - website reads this)
// @route   GET /api/services
const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new service (admin only)
// @route   POST /api/services
const createService = async (req, res) => {
  try {
    const { slug, image, name, shortDesc, longDesc, features } = req.body;

    if (!slug || !name || !shortDesc || !longDesc) {
      return res.status(400).json({ message: 'Slug, name, short and long description are required' });
    }

    const exists = await Service.findOne({ slug });
    if (exists) {
      return res.status(400).json({ message: 'A service with this slug already exists' });
    }

    const service = await Service.create({ slug, image, name, shortDesc, longDesc, features });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a service (admin only)
// @route   PUT /api/services/:id
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    Object.assign(service, req.body);
    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a service (admin only)
// @route   DELETE /api/services/:id
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getServices, createService, updateService, deleteService };

