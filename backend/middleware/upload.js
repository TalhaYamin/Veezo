const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase() || '.png';
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype || !/^image\//.test(file.mimetype)) {
    return cb(new Error('Only image uploads are allowed.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = { upload, UPLOADS_DIR };
