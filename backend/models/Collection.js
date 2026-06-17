const mongoose = require('mongoose');
const { slugify } = require('../utils/slug');

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, index: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

collectionSchema.pre('validate', function setSlug() {
  if (!this.slug && this.name) this.slug = slugify(this.name);
});

collectionSchema.index({ categoryId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Collection', collectionSchema);
