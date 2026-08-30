const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    heading: { type: String },
    paragraphs: [{ type: String }],
    bullets: [{ type: String }],
    afterList: { type: String },
    steps: [{ type: String }],
  },
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    image: { type: String }, // uploaded by admin - stored as a base64 data URL
    name: { type: String, required: true },
    seoTitle: { type: String },
    shortDesc: { type: String, required: true },
    longDesc: { type: String },
    features: [{ type: String }],
    h1: { type: String },
    metaDescription: { type: String },
    intro: [{ type: String }],
    sections: [sectionSchema],
    primaryKeyword: { type: String },
    semanticKeywords: [{ type: String }],
    related: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);

