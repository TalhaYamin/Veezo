const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Collection = require('../models/Collection');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { requireAdmin, ADMIN_PASSWORD, ADMIN_TOKEN } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { toProductJSON, toCategoryJSON, toCollectionJSON } = require('../utils/serialize');
const { slugify } = require('../utils/slug');

const router = express.Router();

function parseSizes(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value).split(',').map((s) => s.trim()).filter(Boolean);
}

function buildImagesFromUpload(files = [], existing = [], bodyImages = []) {
  const uploaded = files.map((file, index) => ({
    url: `/uploads/${file.filename}`,
    alt: '',
    order: index,
    isPrimary: index === 0 && !existing.length,
  }));

  let parsedExisting = [];
  if (typeof bodyImages === 'string' && bodyImages) {
    try {
      parsedExisting = JSON.parse(bodyImages);
    } catch {
      parsedExisting = [];
    }
  } else if (Array.isArray(bodyImages)) {
    parsedExisting = bodyImages;
  }

  const merged = [...parsedExisting, ...uploaded].map((img, index) => ({
    url: img.url,
    alt: img.alt || '',
    order: img.order ?? index,
    isPrimary: Boolean(img.isPrimary),
  }));

  if (merged.length && !merged.some((img) => img.isPrimary)) {
    merged[0].isPrimary = true;
  }

  return merged;
}

router.post('/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    return res.json({ ok: true, token: ADMIN_TOKEN });
  }
  return res.status(401).json({ message: 'Invalid admin password.' });
});

router.get('/dashboard', requireAdmin, async (_req, res) => {
  try {
    const [totalProducts, categories, collections, orders, lowStock] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Collection.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments({ stock: { $lt: 10 } }),
    ]);
    const totalStockAgg = await Product.aggregate([{ $group: { _id: null, total: { $sum: '$stock' } } }]);
    const totalStock = totalStockAgg[0]?.total || 0;

    res.json({ totalProducts, totalStock, lowStock, categories, collections, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/categories', requireAdmin, async (_req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    const result = await Promise.all(
      categories.map(async (category) => {
        const collections = await Collection.find({ categoryId: category._id }).sort({ order: 1, name: 1 });
        const collectionsData = await Promise.all(
          collections.map(async (collection) => {
            const productCount = await Product.countDocuments({ collectionId: collection._id });
            return toCollectionJSON(collection, { productCount });
          })
        );
        return { ...toCategoryJSON(category), collections: collectionsData };
      })
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const description = String(req.body?.description || '').trim();
    if (!name) return res.status(400).json({ message: 'Category name is required.' });

    const existing = await Category.findOne({ slug: slugify(name) });
    if (existing) return res.status(409).json({ message: 'Category already exists.' });

    const category = await Category.create({ name, description });
    res.status(201).json(toCategoryJSON(category));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });

    const name = String(req.body?.name || category.name).trim();
    if (!name) return res.status(400).json({ message: 'Category name is required.' });

    category.name = name;
    category.slug = slugify(name);
    category.description = String(req.body?.description ?? category.description);
    if (req.body?.order !== undefined) category.order = Number(req.body.order);
    await category.save();

    res.json(toCategoryJSON(category));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });

    const collections = await Collection.find({ categoryId: category._id });
    const collectionIds = collections.map((c) => c._id);
    await Product.deleteMany({ $or: [{ categoryId: category._id }, { collectionId: { $in: collectionIds } }] });
    await Collection.deleteMany({ categoryId: category._id });
    await category.deleteOne();

    res.json({ message: 'Category and related collections/products deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/collections', requireAdmin, async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const categoryId = req.body?.categoryId;
    const description = String(req.body?.description || '').trim();
    if (!name) return res.status(400).json({ message: 'Collection name is required.' });
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Valid categoryId is required.' });
    }

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found.' });

    const existing = await Collection.findOne({ categoryId, slug: slugify(name) });
    if (existing) return res.status(409).json({ message: 'Collection already exists in this category.' });

    const collection = await Collection.create({ name, categoryId, description });
    await collection.populate('categoryId');
    res.status(201).json(toCollectionJSON(collection));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/collections/:id', requireAdmin, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id).populate('categoryId');
    if (!collection) return res.status(404).json({ message: 'Collection not found.' });

    const name = String(req.body?.name || collection.name).trim();
    if (!name) return res.status(400).json({ message: 'Collection name is required.' });

    if (req.body?.categoryId && mongoose.Types.ObjectId.isValid(req.body.categoryId)) {
      const category = await Category.findById(req.body.categoryId);
      if (!category) return res.status(404).json({ message: 'Category not found.' });
      collection.categoryId = category._id;
    }

    collection.name = name;
    collection.slug = slugify(name);
    collection.description = String(req.body?.description ?? collection.description);
    if (req.body?.order !== undefined) collection.order = Number(req.body.order);
    await collection.save();

    if (collection.categoryId) {
      await Product.updateMany({ collectionId: collection._id }, { categoryId: collection.categoryId });
    }

    await collection.populate('categoryId');
    res.json(toCollectionJSON(collection));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/collections/:id', requireAdmin, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Collection not found.' });

    await Product.deleteMany({ collectionId: collection._id });
    await collection.deleteOne();
    res.json({ message: 'Collection and related products deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/products', requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.collectionId && mongoose.Types.ObjectId.isValid(req.query.collectionId)) {
      filter.collectionId = req.query.collectionId;
    }
    if (req.query.categoryId && mongoose.Types.ObjectId.isValid(req.query.categoryId)) {
      filter.categoryId = req.query.categoryId;
    }

    const products = await Product.find(filter)
      .populate('categoryId')
      .populate('collectionId')
      .sort({ createdAt: -1 });
    res.json(products.map(toProductJSON));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/products', requireAdmin, upload.array('imageFiles', 10), async (req, res) => {
  try {
    const { name, description, price, collectionId, stock = 0, badge = 'New', status = 'Active' } = req.body;
    if (!name || !description || price === undefined) {
      return res.status(400).json({ message: 'Name, description and price are required.' });
    }
    if (!collectionId || !mongoose.Types.ObjectId.isValid(collectionId)) {
      return res.status(400).json({ message: 'Valid collectionId is required.' });
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) return res.status(404).json({ message: 'Collection not found.' });

    const images = buildImagesFromUpload(req.files, [], req.body.images);
    if (!images.length && req.body.image) {
      images.push({ url: req.body.image, alt: name, order: 0, isPrimary: true });
    }
    if (!images.length) {
      return res.status(400).json({ message: 'At least one product image is required.' });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      oldPrice: req.body.oldPrice ? Number(req.body.oldPrice) : undefined,
      stock: Number(stock),
      sizes: parseSizes(req.body.sizes),
      badge,
      status,
      featured: req.body.featured === 'true' || req.body.featured === true,
      images,
      categoryId: collection.categoryId,
      collectionId: collection._id,
    });

    await product.populate(['categoryId', 'collectionId']);
    res.status(201).json(toProductJSON(product));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/products/:id', requireAdmin, upload.array('imageFiles', 10), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    if (req.body.name) product.name = req.body.name;
    if (req.body.description) product.description = req.body.description;
    if (req.body.price !== undefined) product.price = Number(req.body.price);
    if (req.body.oldPrice !== undefined) product.oldPrice = req.body.oldPrice ? Number(req.body.oldPrice) : undefined;
    if (req.body.stock !== undefined) product.stock = Number(req.body.stock);
    if (req.body.badge) product.badge = req.body.badge;
    if (req.body.status) product.status = req.body.status;
    if (req.body.featured !== undefined) product.featured = req.body.featured === 'true' || req.body.featured === true;
    if (req.body.sizes !== undefined) product.sizes = parseSizes(req.body.sizes);

    if (req.body.collectionId && mongoose.Types.ObjectId.isValid(req.body.collectionId)) {
      const collection = await Collection.findById(req.body.collectionId);
      if (!collection) return res.status(404).json({ message: 'Collection not found.' });
      product.collectionId = collection._id;
      product.categoryId = collection.categoryId;
    }

    const newImages = buildImagesFromUpload(req.files, product.images, req.body.images);
    if (newImages.length) product.images = newImages;
    else if (req.body.image) {
      product.images = [{ url: req.body.image, alt: product.name, order: 0, isPrimary: true }];
    }

    await product.save();
    await product.populate(['categoryId', 'collectionId']);
    res.json(toProductJSON(product));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/products/:id/stock', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    product.stock = Math.max(0, Number(product.stock || 0) + Number(req.body.delta || 0));
    await product.save();
    await product.populate(['categoryId', 'collectionId']);
    res.json(toProductJSON(product));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/orders', requireAdmin, async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
