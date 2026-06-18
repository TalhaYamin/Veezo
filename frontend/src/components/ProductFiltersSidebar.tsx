import type { Category } from '../types';
import type { PriceFilter, ProductFiltersState } from '../lib/productFilters';

type Props = {
  categories: Category[];
  filters: ProductFiltersState;
  onChange: (filters: ProductFiltersState) => void;
  showCategories?: boolean;
};

const priceOptions: { value: PriceFilter; label: string }[] = [
  { value: 'all', label: 'All Prices' },
  { value: '0-100', label: 'Rs. 0 - Rs. 100' },
  { value: '100-300', label: 'Rs. 100 - Rs. 300' },
  { value: '300+', label: 'Rs. 300+' },
];

export default function ProductFiltersSidebar({ categories, filters, onChange, showCategories = true }: Props) {
  const toggleCategory = (value: string, checked: boolean) => {
    if (value === 'all') {
      onChange({ ...filters, categories: ['all'] });
      return;
    }

    let next = filters.categories.filter((c) => c !== 'all');
    if (checked) next = [...next, value];
    else next = next.filter((c) => c !== value);
    if (!next.length) next = ['all'];
    onChange({ ...filters, categories: next });
  };

  const clearFilters = () => {
    onChange({ categories: ['all'], price: 'all', sort: 'newest' });
  };

  return (
    <aside className="lg:w-64">
      <div className="sticky top-24 rounded-2xl border border-amber-400/20 bg-black/60 p-6">
        <h3 className="text-xl font-semibold text-amber-100">Filters</h3>

        {showCategories ? (
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">Category</h4>
            <div className="mt-3 space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={filters.categories.includes('all')}
                  onChange={(e) => toggleCategory('all', e.target.checked)}
                  className="accent-amber-400"
                />
                All Products
              </label>
              {categories.map((category) => (
                <label key={category.id} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.name)}
                    onChange={(e) => toggleCategory(category.name, e.target.checked)}
                    className="accent-amber-400"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">Price Range</h4>
          <div className="mt-3 space-y-2">
            {priceOptions.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="radio"
                  name="price"
                  checked={filters.price === option.value}
                  onChange={() => onChange({ ...filters, price: option.value })}
                  className="accent-amber-400"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="mt-6 w-full rounded-full border border-amber-400/40 py-2 text-sm font-medium text-amber-100"
        >
          Clear Filters
        </button>
      </div>
    </aside>
  );
}
