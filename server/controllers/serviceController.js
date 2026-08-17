const Service = require('../models/Service');
const path = require('path');
const fs = require('fs');

const cleanFeature = (value) =>
  String(value)
    .trim()
    .replace(/^"|"$/g, '')
    .replace(/^\[|\]$/g, '')
    .trim();

const parseFeatures = (value) => {
  if (Array.isArray(value)) {
    return value.map(cleanFeature).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parseFeatures(parsed);
    } catch {
      // Not valid JSON — split manually
    }
    return value
      .split(',')
      .map(cleanFeature)
      .filter(Boolean);
  }
  return [];
};

const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const { slug, name, shortDesc, longDesc, features } = req.body;

    if (!slug || !name || !shortDesc || !longDesc) {
      return res.status(400).json({ message: 'Slug, name, short and long description are required' });
    }

    const exists = await Service.findOne({ slug });
    if (exists) {
      if (req.processedImage) {
        const imagePath = path.join(__dirname, '..', req.processedImage);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }
      return res.status(400).json({ message: 'A service with this slug already exists' });
    }

    const image = req.processedImage || req.body.image || '';

    const service = await Service.create({
      slug,
      image,
      name,
      shortDesc,
      longDesc,
      features: parseFeatures(features),
    });
    res.status(201).json(service);
  } catch (error) {
    if (req.processedImage) {
      const imagePath = path.join(__dirname, '..', req.processedImage);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    res.status(500).json({ message: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      if (req.processedImage) {
        const imagePath = path.join(__dirname, '..', req.processedImage);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }
      return res.status(404).json({ message: 'Service not found' });
    }

    if (req.processedImage) {
      if (service.image) {
        const oldImagePath = path.join(__dirname, '..', service.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      service.image = req.processedImage;
    } else if (req.body.image !== undefined) {
      service.image = req.body.image;
    }

    Object.assign(service, req.body);
    if (req.body.features !== undefined) {
      service.features = parseFeatures(req.body.features);
    }
    await service.save();
    res.json(service);
  } catch (error) {
    if (req.processedImage) {
      const imagePath = path.join(__dirname, '..', req.processedImage);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (service.image) {
      const imagePath = path.join(__dirname, '..', service.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getServices, createService, updateService, deleteService };