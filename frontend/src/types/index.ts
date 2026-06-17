export type CatalogRef = {
  id: string;
  name: string;
  slug: string;
};

export type ProductImage = {
  url: string;
  alt: string;
  order: number;
  isPrimary: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock: number;
  sizes: string[];
  badge: string;
  status: string;
  featured: boolean;
  images: ProductImage[];
  image: string;
  categoryId: string;
  collectionId: string;
  category?: CatalogRef | null;
  collection?: CatalogRef | null;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  order: number;
  categoryId: string;
  category?: CatalogRef | null;
  productCount?: number;
  products?: Product[];
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  order: number;
  collectionCount?: number;
  productCount?: number;
  collections?: Collection[];
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  stock: number;
};

export type DashboardStats = {
  totalProducts: number;
  totalStock: number;
  lowStock: number;
  categories: number;
  collections: number;
  orders: number;
};
