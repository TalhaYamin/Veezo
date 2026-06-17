export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  badge: string;
  description: string;
  sizes: string[];
  accent: string;
};

export const products: Product[] = [
  {
    id: 'atelier-coat',
    name: 'Atelier Coat',
    category: 'Outerwear',
    price: 420,
    oldPrice: 520,
    badge: 'New drop',
    description: 'Structured wool tailoring with a sharp lapel and a refined gold-toned finish.',
    sizes: ['XS', 'S', 'M', 'L'],
    accent: 'bg-[linear-gradient(135deg,#111827,#1f2937)]',
  },
  {
    id: 'signature-knit',
    name: 'Signature Knit',
    category: 'Knitwear',
    price: 180,
    badge: 'Best seller',
    description: 'A softly structured knit designed for evening layering and day-to-night polish.',
    sizes: ['S', 'M', 'L'],
    accent: 'bg-[linear-gradient(135deg,#1f2937,#111827)]',
  },
  {
    id: 'luna-bag',
    name: 'Luna Bag',
    category: 'Accessories',
    price: 260,
    oldPrice: 320,
    badge: 'Limited',
    description: 'Minimal silhouette, sculpted handles, and premium hardware for effortless luxury.',
    sizes: ['One size'],
    accent: 'bg-[linear-gradient(135deg,#171717,#111111)]',
  },
  {
    id: 'city-leather',
    name: 'City Leather',
    category: 'Footwear',
    price: 310,
    badge: 'Curated',
    description: 'Italian leather with a clean profile and weightless comfort for the modern wardrobe.',
    sizes: ['38', '39', '40', '41'],
    accent: 'bg-[linear-gradient(135deg,#27272a,#18181b)]',
  },
  {
    id: 'midnight-shirt',
    name: 'Midnight Shirt',
    category: 'Essentials',
    price: 145,
    badge: 'Premium',
    description: 'A crisp, fluid shirt in a midnight tone made for luxury layering.',
    sizes: ['S', 'M', 'L', 'XL'],
    accent: 'bg-[linear-gradient(135deg,#111827,#0f172a)]',
  },
  {
    id: 'velvet-jacket',
    name: 'Velvet Jacket',
    category: 'Statement',
    price: 385,
    badge: 'Editor pick',
    description: 'Soft, rich velvet with tailored structure and a dramatic, fashion-forward silouette.',
    sizes: ['XS', 'S', 'M'],
    accent: 'bg-[linear-gradient(135deg,#242424,#111111)]',
  },
];

export const collections = [
  {
    name: 'The Black Edit',
    description: 'Monochrome essentials, sharp tailoring, and polished evening dressing.',
  },
  {
    name: 'Golden Hour',
    description: 'Soft metallic accents, lightweight layers, and seasonal statement pieces.',
  },
  {
    name: 'Modern Heritage',
    description: 'Timeless silhouettes updated with a sleek, contemporary luxury feel.',
  },
];
