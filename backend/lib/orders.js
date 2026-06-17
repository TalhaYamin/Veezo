const Product = require('../models/Product');

async function placeCodOrder(order) {
  if (!order || order.status !== 'pending') return order;

  for (const item of order.items) {
    if (!item.productId) continue;
    const product = await Product.findById(item.productId);
    if (!product) continue;
    const qty = Number(item.quantity || 1);
    if (product.stock < qty) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  for (const item of order.items) {
    if (!item.productId) continue;
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -Number(item.quantity || 1) } });
  }

  return order;
}

module.exports = { placeCodOrder };
