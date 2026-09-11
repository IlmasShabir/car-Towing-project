const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: { type: String, required: true, trim: true, index: true },
    author: { type: String, required: true, trim: true, default: 'Usama Car Towing' },
    featuredImage: { type: String, default: '' },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date, default: null },
    metaTitle: { type: String, trim: true, default: '' },
    metaDescription: { type: String, trim: true, default: '' },
    focusKeyword: { type: String, trim: true, default: '' },
    seoKeywords: [{ type: String }],
    canonicalUrl: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

// Keep publishedAt in sync with the status. Publishing for the first time
// stamps the publish date; moving back to draft clears it so re-publishing
// creates a fresh publish date.
// Note: Mongoose 9 (Kareem 3) dropped callback-style `next` middleware —
// hooks are awaited directly, so no `next` parameter is used here.
blogSchema.pre('validate', function () {
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  if (this.status === 'draft') {
    this.publishedAt = null;
  }
});

blogSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);