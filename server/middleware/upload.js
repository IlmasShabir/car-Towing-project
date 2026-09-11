const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'services');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Creates (or reuses) the directory for a given upload subfolder.
const ensureUploadDir = (subfolder) => {
  const dir = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Builds an image-processing middleware for a specific subfolder
// (e.g. 'blogs'). Keeps the original `processImage` behaviour intact.
const makeImageProcessor = (subfolder) => {
  const safeFolder = String(subfolder).replace(/[^a-z0-9-]/gi, '') || 'img';
  return async (req, res, next) => {
    if (!req.file) return next();

    try {
      const dir = ensureUploadDir(subfolder);
      const timestamp = Date.now();
      const rand = Math.random().toString(36).slice(2, 8);
      const filename = `${safeFolder}-${timestamp}-${rand}.webp`;
      const outputPath = path.join(dir, filename);

      await sharp(req.file.buffer)
        .webp({ quality: 80, effort: 6 })
        .resize(1600, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(outputPath);

      req.processedImage = `/uploads/${subfolder}/${filename}`;
      next();
    } catch (error) {
      console.error('Image processing error:', error);
      res.status(500).json({ message: 'Failed to process image' });
    }
  };
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const timestamp = Date.now();
    const filename = `service-${timestamp}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    await sharp(req.file.buffer)
      .webp({ quality: 80, effort: 6 })
      .resize(1200, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(outputPath);

    req.processedImage = `/uploads/services/${filename}`;
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ message: 'Failed to process image' });
  }
};

const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = {
  upload,
  processImage,
  handleUploadErrors,
  ensureUploadDir,
  makeImageProcessor,
  UPLOAD_DIR,
};