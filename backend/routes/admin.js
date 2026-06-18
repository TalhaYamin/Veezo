const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Collection = require('../models/Collection');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Inquiry = require('../models/Inquiry');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { requireAdmin, ADMIN_PASSWORD, ADMIN_TOKEN } = require('../middleware/auth');
const { getSiteSettings, toPublicSettings } = require('../lib/settings');
const { upload, uploadErrorMessage } = require('../middleware/upload');
const { fileToDataUrl } = require('../lib/imageStorage');
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
    url: fileToDataUrl(file),
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

function imageFromUpload(file) {
  return file ? fileToDataUrl(file) : null;
}

router.post('/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    return res.json({ ok: true, token: ADMIN_TOKEN });
  }
  return res.status(401).json({ message: 'Invalid admin password.' });
});

function toOrderJSON(order) {
  return {
    id: order.sessionId,
    sessionId: order.sessionId,
    subtotal: order.subtotal ?? order.total,
    deliveryCharge: order.deliveryCharge ?? 0,
    total: order.total,
    status: order.status,
    paymentMethod: order.paymentMethod,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    items: order.items,
    createdAt: order.createdAt,
  };
}

function inventoryBucket(product) {
  if (product.stock === 0) return 'soldOut';
  if (product.stock < 10) return 'lowStock';
  if (product.status === 'New Arrival') return 'newArrival';
  if (product.status === 'Limited') return 'restocking';
  if (String(product.badge || '').toLowerCase().includes('pre')) return 'preorder';
  return 'inStock';
}

router.get('/dashboard', requireAdmin, async (_req, res) => {
  try {
    const [products, totalProducts, categories, collections, orders, newsletterCount, recentOrders] =
      await Promise.all([
        Product.find().select('name stock status badge'),
        Product.countDocuments(),
        Category.countDocuments(),
        Collection.countDocuments(),
        Order.countDocuments(),
        NewsletterSubscriber.countDocuments(),
        Order.find().sort({ createdAt: -1 }).limit(5),
      ]);

    const totalStockAgg = await Product.aggregate([{ $group: { _id: null, total: { $sum: '$stock' } } }]);
    const totalStock = totalStockAgg[0]?.total || 0;
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const inventoryStatus = {
      inStock: 0,
      lowStock: 0,
      soldOut: 0,
      restocking: 0,
      preorder: 0,
      newArrival: 0,
    };
    const inventoryAlerts = [];

    for (const product of products) {
      const bucket = inventoryBucket(product);
      inventoryStatus[bucket] += 1;
      if (product.stock === 0) {
        inventoryAlerts.push({ name: product.name, stock: product.stock, type: 'soldOut' });
      } else if (product.stock < 10) {
        inventoryAlerts.push({ name: product.name, stock: product.stock, type: 'lowStock' });
      }
    }

    res.json({
      totalProducts,
      totalStock,
      lowStock: inventoryStatus.lowStock,
      categories,
      collections,
      orders,
      totalRevenue,
      totalOrders: orders,
      newsletterCount,
      inventoryStatus,
      inventoryAlerts: inventoryAlerts.slice(0, 5),
      recentOrders: recentOrders.map(toOrderJSON),
    });
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

router.post('/collections', requireAdmin, upload.single('imageFile'), async (req, res) => {
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

    const image = imageFromUpload(req.file) || String(req.body?.image || '').trim();

    const collection = await Collection.create({ name, categoryId, description, image });
    await collection.populate('categoryId');
    res.status(201).json(toCollectionJSON(collection));
  } catch (error) {
    const message = uploadErrorMessage(error);
    const status = error?.code === 'LIMIT_FILE_SIZE' || message.includes('300KB') ? 400 : 500;
    res.status(status).json({ message });
  }
});

router.put('/collections/:id', requireAdmin, upload.single('imageFile'), async (req, res) => {
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
    if (req.file) collection.image = imageFromUpload(req.file);
    else if (req.body?.image !== undefined) collection.image = String(req.body.image || '').trim();
    if (req.body?.order !== undefined) collection.order = Number(req.body.order);
    await collection.save();

    if (collection.categoryId) {
      await Product.updateMany({ collectionId: collection._id }, { categoryId: collection.categoryId });
    }

    await collection.populate('categoryId');
    res.json(toCollectionJSON(collection));
  } catch (error) {
    const message = uploadErrorMessage(error);
    const status = error?.code === 'LIMIT_FILE_SIZE' || message.includes('300KB') ? 400 : 500;
    res.status(status).json({ message });
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
    const message = uploadErrorMessage(error);
    const status = error?.code === 'LIMIT_FILE_SIZE' || message.includes('300KB') || message.includes('image') ? 400 : 500;
    res.status(status).json({ message });
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

    const newImages = buildImagesFromUpload(req.files, [], req.body.images);
    if (req.body.images !== undefined || req.files?.length) {
      if (!newImages.length) {
        return res.status(400).json({ message: 'At least one product image is required.' });
      }
      product.images = newImages;
    } else if (req.body.image) {
      product.images = [{ url: req.body.image, alt: product.name, order: 0, isPrimary: true }];
    }

    await product.save();
    await product.populate(['categoryId', 'collectionId']);
    res.json(toProductJSON(product));
  } catch (error) {
    const message = uploadErrorMessage(error);
    const status = error?.code === 'LIMIT_FILE_SIZE' || message.includes('300KB') || message.includes('image') ? 400 : 500;
    res.status(status).json({ message });
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
    res.json(orders.map(toOrderJSON));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/orders/:orderId', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }
    const order = await Order.findOneAndUpdate(
      { sessionId: req.params.orderId },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(toOrderJSON(order));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/customers', requireAdmin, async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const map = new Map();

    for (const order of orders) {
      const key = order.customerEmail || order.customerPhone || order.customerName || order.sessionId;
      const existing = map.get(key) || {
        id: key,
        name: order.customerName || 'Guest',
        email: order.customerEmail || '',
        phone: order.customerPhone || '',
        orders: 0,
        totalSpent: 0,
        lastOrderAt: order.createdAt,
      };
      existing.orders += 1;
      if (order.status !== 'cancelled') existing.totalSpent += order.total;
      if (order.createdAt > existing.lastOrderAt) existing.lastOrderAt = order.createdAt;
      if (!existing.name && order.customerName) existing.name = order.customerName;
      map.set(key, existing);
    }

    res.json(Array.from(map.values()).sort((a, b) => new Date(b.lastOrderAt) - new Date(a.lastOrderAt)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/inventory', requireAdmin, async (_req, res) => {
  try {
    const products = await Product.find().populate('collectionId').populate('categoryId').sort({ stock: 1 });
    res.json(
      products.map((product) => ({
        ...toProductJSON(product),
        inventoryStatus: inventoryBucket(product),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/inquiries', requireAdmin, async (_req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(100);
    res.json(
      inquiries.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        email: item.email,
        subject: item.subject,
        message: item.message,
        createdAt: item.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/inquiries/:id', requireAdmin, async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/newsletter', requireAdmin, async (_req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 }).limit(200);
    res.json(subscribers.map((s) => ({ email: s.email, createdAt: s.createdAt })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/newsletter/:email', requireAdmin, async (req, res) => {
  try {
    await NewsletterSubscriber.findOneAndDelete({ email: req.params.email.toLowerCase() });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/settings', requireAdmin, async (_req, res) => {
  try {
    const settings = await getSiteSettings();
    res.json(toPublicSettings(settings));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/settings', requireAdmin, async (req, res) => {
  try {
    const settings = await getSiteSettings();
    const { storeName, shippingCost, freeShippingThreshold, whatsappNumber, footer } = req.body || {};
    if (storeName !== undefined) settings.storeName = storeName;
    if (shippingCost !== undefined) settings.shippingCost = Number(shippingCost);
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = Number(freeShippingThreshold);
    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
    if (footer) settings.footer = { ...settings.footer.toObject?.() || settings.footer, ...footer };
    await settings.save();
    res.json(toPublicSettings(settings));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/settings/password', requireAdmin, async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    res.json({
      ok: true,
      message: 'Update ADMIN_PASSWORD in your server environment variables and redeploy to apply.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.use((error, _req, res, _next) => {
  res.status(400).json({ message: uploadErrorMessage(error) });
});

module.exports = router;
