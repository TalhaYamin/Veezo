function calculateDeliveryCharge(subtotal, settings) {
  const cost = Number(settings?.shippingCost) || 0;
  const threshold = Number(settings?.freeShippingThreshold) || 0;

  if (cost <= 0) return 0;
  if (threshold > 0 && subtotal >= threshold) return 0;

  return cost;
}

function calculateOrderTotal(subtotal, settings) {
  return subtotal + calculateDeliveryCharge(subtotal, settings);
}

module.exports = { calculateDeliveryCharge, calculateOrderTotal };
