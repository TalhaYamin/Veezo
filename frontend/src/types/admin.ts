import type { Category, Product } from './index';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'inquiries'
  | 'footer'
  | 'settings';

export type InventoryStatus = {
  inStock: number;
  lowStock: number;
  soldOut: number;
  restocking: number;
  preorder: number;
  newArrival: number;
};

export type InventoryAlert = {
  name: string;
  stock: number;
  type: 'soldOut' | 'lowStock';
};

export type AdminOrder = {
  id: string;
  sessionId: string;
  subtotal?: number;
  deliveryCharge?: number;
  total: number;
  status: string;
  paymentMethod: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  items: Array<{ name: string; price: number; quantity: number; size?: string }>;
  createdAt: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  lastOrderAt: string;
};

export type AdminInquiry = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type QuickLink = {
  _id?: string;
  name: string;
  url: string;
  page: string;
};

export type SiteSettings = {
  storeName: string;
  shippingCost: number;
  freeShippingThreshold: number;
  whatsappNumber: string;
  footer: {
    companyDescription: string;
    contactInfo: { phone: string; email: string; address: string };
    socialLinks: { instagram: string; facebook: string; whatsapp: string; twitter: string };
    copyright: string;
    quickLinks: QuickLink[];
  };
};

export type DashboardData = {
  totalProducts: number;
  totalStock: number;
  lowStock: number;
  categories: number;
  collections: number;
  orders: number;
  totalRevenue: number;
  totalOrders: number;
  newsletterCount: number;
  inventoryStatus: InventoryStatus;
  inventoryAlerts: InventoryAlert[];
  recentOrders: AdminOrder[];
};

export type InventoryProduct = Product & { inventoryStatus: string };

export type AdminCatalog = {
  categories: Category[];
  products: Product[];
};
