const multer = require('multer');
const { MAX_IMAGE_BYTES } = require('../lib/imageStorage');

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype || !/^image\//.test(file.mimetype)) {
    return cb(new Error('Only image uploads are allowed.'));
  }
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter,
});

function uploadErrorMessage(error) {
  if (error?.code === 'LIMIT_FILE_SIZE') {
    return 'Image must be smaller than 300KB.';
  }
  return error?.message || 'Image upload failed.';
}

module.exports = { upload, uploadErrorMessage };
