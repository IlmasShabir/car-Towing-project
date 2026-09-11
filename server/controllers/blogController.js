const Blog = require('../models/Blog');
const { sanitizeHtml } = require('../utils/sanitizeHtml');
const path = require('path');
const fs = require('fs');

const parseStringArray = (value) => {
  if (Array.isArray(value)) return value.map(String).filter((s) => s && s.trim());
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter((s) => s && s.trim());
    } catch {
      // Not valid JSON
    }
    return value
      .split(',')
      .map((s) => String(s).trim())
      .filter(Boolean);
  }
  return [];
};

const cleanSlug = (slug) =>
  String(slug || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

const removeImageFile = (imagePath) => {
  if (!imagePath) return;
  if (/^\/uploads\//.test(imagePath)) {
    const filePath = path.join(__dirname, '..', imagePath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Failed to remove image file:', error.message);
      }
    }
  }
};

// @desc    Public list of published blogs (paginated, searchable, filterable)
// @route   GET /api/blogs
const getBlogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const filter = { status: 'published' };

    if (req.query.category) {
      filter.category = { $regex: new RegExp(`^${req.query.category.trim()}$`, 'i') };
    }

    if (req.query.exclude) {
      filter._id = { $ne: req.query.exclude };
    }

    if (req.query.search) {
      const search = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { title: search },
        { excerpt: search },
        { category: search },
        { author: search },
      ];
    }

    const sortable = ['publishedAt', 'createdAt', 'title'];
    const sortField = sortable.includes(req.query.sort) ? req.query.sort : 'publishedAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      Blog.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      Blog.countDocuments(filter),
    ]);

    // Distinct categories (published only) so the filter dropdown stays relevant.
    const categories = await Blog.distinct('category', { status: 'published' }).then((list) =>
      list.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    );

    res.json({
      data,
      categories,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      limit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Public list of published blog categories
// @route   GET /api/blogs/categories
const getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { status: 'published' }).then((list) =>
      list.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    );
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin list of all blogs (draft + published)
// @route   GET /api/blogs/admin/list
const getAdminBlogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      const search = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { title: search },
        { excerpt: search },
        { category: search },
        { author: search },
        { slug: search },
      ];
    }

    const sortable = ['publishedAt', 'createdAt', 'title', 'status'];
    const sortField = sortable.includes(req.query.sort) ? req.query.sort : 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      Blog.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      Blog.countDocuments(filter),
    ]);

    const categories = await Blog.distinct('category').then((list) =>
      list.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    );

    res.json({
      data,
      categories,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      limit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Public single blog by slug (published only)
// @route   GET /api/blogs/:slug
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a blog (admin)
// @route   POST /api/blogs
const createBlog = async (req, res) => {
  try {
    const {
      title, slug, category, author, excerpt, content,
      status, publishDate, metaTitle, metaDescription,
      focusKeyword, seoKeywords, canonicalUrl,
    } = req.body;

    if (!title || !slug || !category) {
      if (req.processedImage) removeImageFile(req.processedImage);
      return res.status(400).json({ message: 'Title, slug and category are required' });
    }

    const clean = cleanSlug(slug);
    if (!clean) {
      if (req.processedImage) removeImageFile(req.processedImage);
      return res.status(400).json({ message: 'Slug is invalid' });
    }

    const exists = await Blog.findOne({ slug: clean });
    if (exists) {
      if (req.processedImage) removeImageFile(req.processedImage);
      return res.status(400).json({ message: 'A blog with this slug already exists' });
    }

    const nextStatus = status === 'published' ? 'published' : 'draft';
    const blogData = {
      title: String(title).trim(),
      slug: clean,
      category: String(category).trim(),
      author: author?.trim() || 'Usama Car Towing',
      featuredImage: req.processedImage || req.body.featuredImage || '',
      excerpt: String(excerpt || '').trim(),
      content: sanitizeHtml(content),
      status: nextStatus,
      metaTitle: String(metaTitle || '').trim(),
      metaDescription: String(metaDescription || '').trim(),
      focusKeyword: String(focusKeyword || '').trim(),
      seoKeywords: parseStringArray(seoKeywords),
      canonicalUrl: String(canonicalUrl || '').trim(),
    };

    if (nextStatus === 'published' && publishDate) {
      const parsed = new Date(publishDate);
      if (!Number.isNaN(parsed.getTime())) blogData.publishedAt = parsed;
    }

    const blog = await Blog.create(blogData);
    res.status(201).json(blog);
  } catch (error) {
    if (req.processedImage) removeImageFile(req.processedImage);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a blog (admin)
// @route   PUT /api/blogs/:id
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      if (req.processedImage) removeImageFile(req.processedImage);
      return res.status(404).json({ message: 'Blog not found' });
    }

    const {
      title, slug, category, author, excerpt, content,
      status, publishDate, metaTitle, metaDescription,
      focusKeyword, seoKeywords, canonicalUrl,
    } = req.body;

    if ((title !== undefined && !String(title).trim()) ||
        (slug !== undefined && !String(slug).trim()) ||
        (category !== undefined && !String(category).trim())) {
      if (req.processedImage) removeImageFile(req.processedImage);
      return res.status(400).json({ message: 'Title, slug and category are required' });
    }

    if (slug !== undefined) {
      const clean = cleanSlug(slug);
      if (!clean) {
        if (req.processedImage) removeImageFile(req.processedImage);
        return res.status(400).json({ message: 'Slug is invalid' });
      }
      const dup = await Blog.findOne({ slug: clean, _id: { $ne: blog._id } });
      if (dup) {
        if (req.processedImage) removeImageFile(req.processedImage);
        return res.status(400).json({ message: 'A blog with this slug already exists' });
      }
      blog.slug = clean;
    }

    if (req.processedImage) {
      if (blog.featuredImage) removeImageFile(blog.featuredImage);
      blog.featuredImage = req.processedImage;
    }

    if (title !== undefined) blog.title = String(title).trim();
    if (category !== undefined) blog.category = String(category).trim();
    if (author !== undefined) blog.author = String(author).trim() || 'Usama Car Towing';
    if (excerpt !== undefined) blog.excerpt = String(excerpt).trim();
    if (content !== undefined) blog.content = sanitizeHtml(content);
    if (metaTitle !== undefined) blog.metaTitle = String(metaTitle).trim();
    if (metaDescription !== undefined) blog.metaDescription = String(metaDescription).trim();
    if (focusKeyword !== undefined) blog.focusKeyword = String(focusKeyword).trim();
    if (seoKeywords !== undefined) blog.seoKeywords = parseStringArray(seoKeywords);
    if (canonicalUrl !== undefined) blog.canonicalUrl = String(canonicalUrl).trim();

    if (status !== undefined) {
      blog.status = status === 'published' ? 'published' : 'draft';
    }

    if (blog.status === 'published') {
      if (!blog.publishedAt) blog.publishedAt = new Date();
      if (publishDate) {
        const parsed = new Date(publishDate);
        if (!Number.isNaN(parsed.getTime())) blog.publishedAt = parsed;
      }
    } else {
      blog.publishedAt = null;
    }

    await blog.save();
    res.json(blog);
  } catch (error) {
    if (req.processedImage) removeImageFile(req.processedImage);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish / unpublish a blog (admin)
// @route   PATCH /api/blogs/:id/status
const updateBlogStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const status = req.body.status === 'published' ? 'published' : 'draft';
    blog.status = status;
    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a blog (admin)
// @route   DELETE /api/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.featuredImage) removeImageFile(blog.featuredImage);
    await blog.deleteOne();
    res.json({ message: 'Blog removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload an inline image for the article body (admin)
// @route   POST /api/blogs/upload-image
const uploadInlineImage = (req, res) => {
  if (!req.processedImage) {
    return res.status(400).json({ message: 'No image uploaded' });
  }
  res.status(201).json({ url: req.processedImage });
};

module.exports = {
  getBlogs,
  getBlogCategories,
  getAdminBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  updateBlogStatus,
  deleteBlog,
  uploadInlineImage,
};