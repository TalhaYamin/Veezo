import type { Product } from '../types';

export type PriceFilter = 'all' | '0-100' | '100-300' | '300+';
export type SortOption = 'newest' | 'popular' | 'price-low' | 'price-high';

export type ProductFiltersState = {
  categories: string[];
  price: PriceFilter;
  sort: SortOption;
};

export const defaultFilters: ProductFiltersState = {
  categories: ['all'],
  price: 'all',
  sort: 'newest',
};

export function filterAndSortProducts(products: Product[], filters: ProductFiltersState) {
  let result = [...products];

  if (!filters.categories.includes('all') && filters.categories.length) {
    result = result.filter((p) => filters.categories.includes(p.category?.name || p.categoryId));
  }

  if (filters.price !== 'all') {
    if (filters.price === '300+') {
      result = result.filter((p) => p.price >= 300);
    } else {
      const [min, max] = filters.price.split('-').map(Number);
      result = result.filter((p) => p.price >= min && p.price <= max);
    }
  }

  switch (filters.sort) {
    case 'price-low':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'popular':
      result.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
    default:
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  return result;
}
