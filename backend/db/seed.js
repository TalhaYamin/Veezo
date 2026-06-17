const fs = require('fs');
const path = require('path');
const Category = require('../models/Category');
const Collection = require('../models/Collection');
const Product = require('../models/Product');
const { slugify } = require('../utils/slug');

const DATA_DIR = path.join(__dirname, '..', 'data');

function readJson(file, fallback) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

const sampleProducts = [
  {
    name: 'Atelier Coat',
    category: 'Outerwear',
    collection: 'New Arrivals',
    price: 420,
    oldPrice: 520,
    stock: 12,
    status: 'New Arrival',
    badge: 'New drop',
    description: 'Structured wool tailoring with a sharp lapel and refined gold-toned accents.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    sizes: ['XS', 'S', 'M', 'L'],
    featured: true,
  },
  {
    name: 'Signature Knit',
    category: 'Knitwear',
    collection: 'Best Sellers',
    price: 180,
    stock: 28,
    status: 'Best Seller',
    badge: 'Best seller',
    description: 'A softly structured knit designed for evening layering and day-to-night polish.',
    image: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=900&q=80',
    sizes: ['S', 'M', 'L'],
    featured: true,
  },
  {
    name: 'Luna Bag',
    category: 'Accessories',
    collection: 'Limited Edition',
    price: 260,
    oldPrice: 320,
    stock: 7,
    status: 'Limited',
    badge: 'Limited',
    description: 'Minimal silhouette, sculpted handles, and premium hardware for effortless luxury.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    sizes: ['One size'],
    featured: false,
  },
  {
    name: 'Heritage Blazer',
    category: 'Outerwear',
    collection: 'Best Sellers',
    price: 340,
    stock: 15,
    status: 'Active',
    badge: 'Essential',
    description: 'Tailored blazer with satin lapels and a sculpted waist for evening polish.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    featured: true,
  },
  {
    name: 'Silk Evening Dress',
    category: 'Statement',
    collection: 'Limited Edition',
    price: 580,
    stock: 4,
    status: 'Limited',
    badge: 'Exclusive',
    description: 'Fluid silk drape with hand-finished seams and a subtle gold sheen.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80',
    sizes: ['XS', 'S', 'M'],
    featured: true,
  },
  {
    name: 'Monarch Loafers',
    category: 'Footwear',
    collection: 'New Arrivals',
    price: 295,
    stock: 18,
    status: 'Active',
    badge: 'New',
    description: 'Italian leather loafers with brushed gold hardware and cushioned insole.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
    sizes: ['39', '40', '41', '42', '43'],
    featured: false,
  },
];

const defaultCategories = [
  { name: 'Outerwear', description: 'Coats, blazers, and layered essentials.' },
  { name: 'Knitwear', description: 'Refined knits for every season.' },
  { name: 'Accessories', description: 'Bags, belts, and finishing touches.' },
  { name: 'Footwear', description: 'Crafted shoes for day and evening.' },
  { name: 'Essentials', description: 'Wardrobe foundations with elevated detail.' },
  { name: 'Statement', description: 'Bold silhouettes for special occasions.' },
];

const defaultCollections = [
  { name: 'New Arrivals', description: 'The latest pieces from our atelier.' },
  { name: 'Best Sellers', description: 'Customer favorites, season after season.' },
  { name: 'Limited Edition', description: 'Small-batch drops with exclusive finishes.' },
];

async function ensureCategory(name, description = '') {
  let category = await Category.findOne({ slug: slugify(name) });
  if (!category) {
    category = await Category.create({ name, description });
  }
  return category;
}

async function ensureCollection(name, categoryId, description = '') {
  let collection = await Collection.findOne({ categoryId, slug: slugify(name) });
  if (!collection) {
    collection = await Collection.create({ name, categoryId, description });
  }
  return collection;
}

function toImages(image, name) {
  if (!image) return [];
  return [{ url: image, alt: name, order: 0, isPrimary: true }];
}

async function seedDatabase() {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database...');

  const legacyProducts = readJson('products.json', []);
  const legacyCategories = readJson('categories.json', []);
  const legacyCollections = readJson('collections.json', []);

  const categoryNames = new Set([
    ...defaultCategories.map((c) => c.name),
    ...legacyCategories,
    ...legacyProducts.map((p) => p.category).filter(Boolean),
    ...sampleProducts.map((p) => p.category),
  ]);

  const collectionNames = new Set([
    ...defaultCollections.map((c) => c.name),
    ...legacyCollections,
    ...sampleProducts.map((p) => p.collection).filter(Boolean),
  ]);

  const categoryMap = new Map();
  for (const name of categoryNames) {
    const meta = defaultCategories.find((c) => c.name === name);
    const category = await ensureCategory(name, meta?.description || '');
    categoryMap.set(name, category);
  }

  const collectionMap = new Map();
  for (const name of collectionNames) {
    const meta = defaultCollections.find((c) => c.name === name);
    const defaultCategory = categoryMap.get('Essentials') || [...categoryMap.values()][0];
    const collection = await ensureCollection(name, defaultCategory._id, meta?.description || '');
    collectionMap.set(name, collection);
  }

  const productsToSeed = legacyProducts.length ? legacyProducts : sampleProducts;

  for (const item of productsToSeed) {
    const category = categoryMap.get(item.category) || [...categoryMap.values()][0];
    const collectionName = item.collection || 'New Arrivals';
    let collection = collectionMap.get(collectionName);
    if (!collection) {
      collection = await ensureCollection(collectionName, category._id);
      collectionMap.set(collectionName, collection);
    }

    const images = item.images?.length
      ? item.images.map((img, index) => ({
          url: img.url || img,
          alt: img.alt || item.name,
          order: img.order ?? index,
          isPrimary: img.isPrimary ?? index === 0,
        }))
      : toImages(item.image, item.name);

    await Product.create({
      name: item.name,
      slug: item.id ? slugify(item.id) : undefined,
      description: item.description || item.name,
      price: Number(item.price) || 0,
      oldPrice: item.oldPrice ? Number(item.oldPrice) : undefined,
      stock: Number(item.stock) || 0,
      sizes: item.sizes || [],
      badge: item.badge || 'New',
      status: item.status || 'Active',
      featured: Boolean(item.featured),
      images,
      categoryId: category._id,
      collectionId: collection._id,
    });
  }

  console.log(`Seeded ${productsToSeed.length} products`);
}

module.exports = { seedDatabase };
