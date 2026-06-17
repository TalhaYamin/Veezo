const mongoose = require('mongoose');
const { slugify } = require('../utils/slug');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sizes: { type: [String], default: [] },
    badge: { type: String, default: 'New' },
    status: { type: String, default: 'Active' },
    featured: { type: Boolean, default: false },
    images: { type: [imageSchema], default: [] },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', required: true, index: true },
  },
  { timestamps: true }
);

productSchema.pre('validate', function setSlug() {
  if (!this.slug && this.name) this.slug = slugify(this.name);
});

productSchema.index({ collectionId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
