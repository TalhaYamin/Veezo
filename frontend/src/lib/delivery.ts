export type DeliverySettings = {
  shippingCost: number;
  freeShippingThreshold: number;
};

export function calculateDeliveryCharge(subtotal: number, settings: DeliverySettings): number {
  const cost = Number(settings.shippingCost) || 0;
  const threshold = Number(settings.freeShippingThreshold) || 0;

  if (cost <= 0) return 0;
  if (threshold > 0 && subtotal >= threshold) return 0;

  return cost;
}

export function calculateOrderTotal(subtotal: number, settings: DeliverySettings): number {
  return subtotal + calculateDeliveryCharge(subtotal, settings);
}
