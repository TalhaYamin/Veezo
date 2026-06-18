const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { placeCodOrder } = require('../lib/orders');
const { getSiteSettings } = require('../lib/settings');
const { calculateDeliveryCharge, calculateOrderTotal } = require('../lib/delivery');

const router = express.Router();

router.get('/config', (_req, res) => {
  res.json({ paymentMethod: 'cod' });
});

router.post('/place-order', async (req, res) => {
  try {
    const {
      items = [],
      email = '',
      name = '',
      phone = '',
      address = '',
    } = req.body;

    if (!items.length) return res.status(400).json({ message: 'Cart is empty' });
    if (!name.trim()) return res.status(400).json({ message: 'Full name is required.' });
    if (!phone.trim()) return res.status(400).json({ message: 'Phone number is required.' });
    if (!address.trim()) return res.status(400).json({ message: 'Delivery address is required.' });

    for (const item of items) {
      if (!item.productId) continue;
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ message: `Product not found: ${item.name}` });
      const qty = Number(item.quantity || 1);
      if (product.stock < qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Only ${product.stock} left.` });
      }
    }

    const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
    const settings = await getSiteSettings();
    const deliveryCharge = calculateDeliveryCharge(subtotal, settings);
    const amount = calculateOrderTotal(subtotal, settings);
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const orderId = `cod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const order = await Order.create({
      sessionId: orderId,
      items,
      subtotal,
      deliveryCharge,
      total: amount,
      status: 'pending',
      paymentMethod: 'cod',
      customerEmail: email.trim(),
      customerName: name.trim(),
      customerPhone: phone.trim(),
      shippingAddress: address.trim(),
    });

    await placeCodOrder(order);

    return res.json({
      ok: true,
      orderId: order.sessionId,
      url: `${frontendUrl}/checkout/success?order_id=${order.sessionId}`,
      paymentMethod: 'cod',
      amount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Checkout failed' });
  }
});

router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ sessionId: orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const confirmed =
      order.status === 'pending' ||
      order.status === 'processing' ||
      order.status === 'shipped' ||
      order.status === 'delivered';

    return res.json({
      ok: true,
      confirmed,
      paymentMethod: order.paymentMethod || 'cod',
      order: {
        sessionId: order.sessionId,
        subtotal: order.subtotal ?? order.total,
        deliveryCharge: order.deliveryCharge ?? 0,
        total: order.total,
        status: order.status,
        items: order.items,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to verify order' });
  }
});

module.exports = router;
