function refField(ref) {
  if (!ref) return null;
  if (typeof ref === 'object' && ref._id) {
    return { id: ref._id.toString(), name: ref.name, slug: ref.slug };
  }
  return { id: ref.toString() };
}

function primaryImage(images = []) {
  const sorted = [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return sorted.find((img) => img.isPrimary) || sorted[0] || null;
}

function toProductJSON(doc) {
  const obj = doc.toObject ? doc.toObject({ virtuals: true }) : doc;
  const images = (obj.images || []).map((img, index) => ({
    url: img.url,
    alt: img.alt || obj.name || '',
    order: img.order ?? index,
    isPrimary: Boolean(img.isPrimary),
  }));
  const primary = primaryImage(images);

  return {
    id: obj._id.toString(),
    slug: obj.slug,
    name: obj.name,
    description: obj.description,
    price: obj.price,
    oldPrice: obj.oldPrice,
    stock: obj.stock,
    sizes: obj.sizes || [],
    badge: obj.badge,
    status: obj.status,
    featured: Boolean(obj.featured),
    images,
    image: primary?.url || '',
    categoryId: obj.categoryId?._id?.toString() || obj.categoryId?.toString() || '',
    collectionId: obj.collectionId?._id?.toString() || obj.collectionId?.toString() || '',
    category: refField(obj.categoryId),
    collection: refField(obj.collectionId),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

function toCategoryJSON(doc, extras = {}) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id.toString(),
    slug: obj.slug,
    name: obj.name,
    description: obj.description || '',
    image: obj.image || '',
    order: obj.order ?? 0,
    ...extras,
  };
}

function toCollectionJSON(doc, extras = {}) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id.toString(),
    slug: obj.slug,
    name: obj.name,
    description: obj.description || '',
    image: obj.image || '',
    order: obj.order ?? 0,
    categoryId: obj.categoryId?._id?.toString() || obj.categoryId?.toString() || '',
    category: refField(obj.categoryId),
    ...extras,
  };
}

module.exports = { toProductJSON, toCategoryJSON, toCollectionJSON, primaryImage };
