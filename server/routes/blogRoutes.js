const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogCategories,
  getAdminBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  updateBlogStatus,
  deleteBlog,
  uploadInlineImage,
} = require('../controllers/blogController');
const { protectAdmin } = require('../middleware/adminAuth');
const { upload, makeImageProcessor, handleUploadErrors } = require('../middleware/upload');

const blogImageProcessor = makeImageProcessor('blogs');

// Admin routes first so they aren't shadowed by /:slug.
router.get('/admin/list', protectAdmin, getAdminBlogs);

// Public
router.get('/categories', getBlogCategories);
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// Admin-writable
router.post(
  '/',
  protectAdmin,
  upload.single('featuredImage'),
  blogImageProcessor,
  handleUploadErrors,
  createBlog,
);
router.post(
  '/upload-image',
  protectAdmin,
  upload.single('image'),
  blogImageProcessor,
  handleUploadErrors,
  uploadInlineImage,
);
router.put(
  '/:id',
  protectAdmin,
  upload.single('featuredImage'),
  blogImageProcessor,
  handleUploadErrors,
  updateBlog,
);
router.patch('/:id/status', protectAdmin, updateBlogStatus);
router.delete('/:id', protectAdmin, deleteBlog);

module.exports = router;