import type { ReactNode } from 'react';
import type { Category, Product } from '../types';
import type { ProductFiltersState, SortOption } from '../lib/productFilters';
import ProductFiltersSidebar from './ProductFiltersSidebar';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

type Props = {
  title: string;
  subtitle?: string;
  products: Product[];
  categories?: Category[];
  filters: ProductFiltersState;
  onFiltersChange: (filters: ProductFiltersState) => void;
  showCategories?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionTo?: string;
  headerExtra?: ReactNode;
};

export default function ProductListingLayout({
  title,
  subtitle,
  products,
  categories = [],
  filters,
  onFiltersChange,
  showCategories = true,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your filters.',
  emptyActionLabel = 'View all products',
  emptyActionTo = '/shop',
  headerExtra,
}: Props) {
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <ProductFiltersSidebar
        categories={categories}
        filters={filters}
        onChange={onFiltersChange}
        showCategories={showCategories}
      />

      <div className="flex-1">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-white md:text-4xl">{title}</h2>
            {subtitle ? <p className="mt-2 text-zinc-400">{subtitle}</p> : null}
            <p className="mt-2 text-sm text-zinc-500">
              Showing {products.length} product{products.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {headerExtra}
            <select
              value={filters.sort}
              onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value as SortOption })}
              className="rounded-xl border border-amber-400/30 bg-black/40 px-4 py-3 text-sm text-white outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {products.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            actionTo={emptyActionTo}
          />
        )}
      </div>
    </div>
  );
}
