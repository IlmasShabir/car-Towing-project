const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    image: { type: String }, // uploaded by admin - stored as a base64 data URL
    name: { type: String, required: true },
    seoTitle: { type: String },
    shortDesc: { type: String, required: true },
    longDesc: { type: String, required: true },
    features: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);

