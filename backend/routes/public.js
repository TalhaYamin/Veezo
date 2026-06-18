const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Collection = require('../models/Collection');
const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { toProductJSON, toCategoryJSON, toCollectionJSON } = require('../utils/serialize');
const { getSiteSettings, toPublicSettings } = require('../lib/settings');

const router = express.Router();

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'VEEZO API', timestamp: new Date().toISOString() });
});

router.get('/categories', async (_req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    const result = await Promise.all(
      categories.map(async (category) => {
        const collectionCount = await Collection.countDocuments({ categoryId: category._id });
        const productCount = await Product.countDocuments({ categoryId: category._id });
        return toCategoryJSON(category, { collectionCount, productCount });
      })
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/categories/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const collections = await Collection.find({ categoryId: category._id }).sort({ order: 1, name: 1 });
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const productCount = await Product.countDocuments({ collectionId: collection._id });
        return toCollectionJSON(collection, { productCount });
      })
    );

    res.json({ ...toCategoryJSON(category), collections: collectionsWithCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/collections', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      if (!category) return res.json([]);
      filter.categoryId = category._id;
    }

    const collections = await Collection.find(filter).populate('categoryId').sort({ order: 1, name: 1 });
    const result = await Promise.all(
      collections.map(async (collection) => {
        const productCount = await Product.countDocuments({ collectionId: collection._id });
        return toCollectionJSON(collection, { productCount });
      })
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/collections/:slug', async (req, res) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug }).populate('categoryId');
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    const products = await Product.find({ collectionId: collection._id })
      .populate('categoryId')
      .populate('collectionId')
      .sort({ createdAt: -1 });

    res.json({
      ...toCollectionJSON(collection),
      products: products.map(toProductJSON),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/products', async (req, res) => {
  try {
    const filter = {};
    if (req.query.featured === 'true') filter.featured = true;
    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      if (category) filter.categoryId = category._id;
    }
    if (req.query.collection) {
      const collection = await Collection.findOne({ slug: req.query.collection });
      if (collection) filter.collectionId = collection._id;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter)
      .populate('categoryId')
      .populate('collectionId')
      .sort({ featured: -1, createdAt: -1 });

    res.json(products.map(toProductJSON));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = isObjectId(id) ? { _id: id } : { $or: [{ slug: id }, { _id: id }] };
    const product = await Product.findOne(query).populate('categoryId').populate('collectionId');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(toProductJSON(product));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/settings', async (_req, res) => {
  try {
    const settings = await getSiteSettings();
    res.json(toPublicSettings(settings));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject = '', message } = req.body || {};
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }
    const inquiry = await Inquiry.create({
      name: name.trim(),
      email: email.trim(),
      subject: String(subject).trim(),
      message: message.trim(),
    });
    res.status(201).json({ ok: true, id: inquiry._id.toString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/newsletter', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email?.trim()) return res.status(400).json({ message: 'Email is required.' });
    const normalized = email.trim().toLowerCase();
    const existing = await NewsletterSubscriber.findOne({ email: normalized });
    if (existing) return res.json({ ok: true, message: 'Already subscribed.' });
    await NewsletterSubscriber.create({ email: normalized });
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
