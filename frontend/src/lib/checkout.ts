export type CheckoutConfig = {
  paymentMethod: 'cod';
};

export type PlaceOrderResponse = {
  ok: boolean;
  orderId?: string;
  url?: string;
  paymentMethod?: 'cod';
  amount?: number;
};

export type OrderVerifyResponse = {
  ok: boolean;
  confirmed: boolean;
  paymentMethod: 'cod';
  order: {
    sessionId: string;
    total: number;
    status: string;
    items: Array<{ name: string; price: number; quantity: number }>;
    customerEmail?: string;
    customerName?: string;
    customerPhone?: string;
    shippingAddress?: string;
  };
};
