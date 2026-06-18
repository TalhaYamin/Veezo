const MAX_IMAGE_BYTES = 300 * 1024;

function fileToDataUrl(file) {
  if (!file || !file.buffer) {
    throw new Error('Invalid image file.');
  }

  if (file.size > MAX_IMAGE_BYTES) {
    const sizeKb = Math.round(file.size / 1024);
    const name = file.originalname || 'image';
    throw new Error(`Image "${name}" is ${sizeKb}KB. Maximum allowed size is 300KB.`);
  }

  if (!file.mimetype || !/^image\//.test(file.mimetype)) {
    throw new Error('Only image uploads are allowed.');
  }

  const base64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64}`;
}

function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:image/');
}

module.exports = {
  MAX_IMAGE_BYTES,
  fileToDataUrl,
  isDataUrl,
};
