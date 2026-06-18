import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductListingLayout from '../components/ProductListingLayout';
import LoadingState from '../components/LoadingState';
import { apiRequest } from '../lib/api';
import { defaultFilters, filterAndSortProducts } from '../lib/productFilters';
import type { Category, Collection, Product } from '../types';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState(defaultFilters);

  const categorySlug = searchParams.get('category') || '';
  const collectionSlug = searchParams.get('collection') || '';

  useEffect(() => {
    apiRequest<Category[]>('/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    if (collectionSlug) params.set('collection', collectionSlug);
    if (search) params.set('search', search);

    setLoading(true);
    Promise.all([
      apiRequest<Product[]>(`/products?${params.toString()}`),
      apiRequest<Collection[]>(categorySlug ? `/collections?category=${categorySlug}` : '/collections'),
    ])
      .then(([items, cols]) => {
        setProducts(items);
        setCollections(cols);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [categorySlug, collectionSlug, search]);

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categories, categorySlug]
  );

  const filteredProducts = useMemo(() => filterAndSortProducts(products, filters), [products, filters]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === 'category') next.delete('collection');
    setSearchParams(next);
  };

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (search.trim()) next.set('search', search.trim());
    else next.delete('search');
    setSearchParams(next);
  };

  const collectionPills =
    collections.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateFilter('collection', '')}
          className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] ${!collectionSlug ? 'border border-amber-400 text-amber-200' : 'border border-white/10 text-zinc-400'}`}
        >
          All collections
        </button>
        {collections.map((collection) => (
          <button
            key={collection.id}
            type="button"
            onClick={() => updateFilter('collection', collection.slug)}
            className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] ${collectionSlug === collection.slug ? 'border border-amber-400 text-amber-200' : 'border border-white/10 text-zinc-400'}`}
          >
            {collection.name}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <Layout>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Shop</p>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            {activeCategory ? activeCategory.name : 'Shop Collection'}
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-300">
            Discover luxury essentials with premium fabrics, polished silhouettes, and limited seasonal drops.
          </p>
          <form onSubmit={onSearch} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 rounded-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/40"
            />
            <button type="submit" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black">
              Search
            </button>
          </form>
        </header>

        <section className="mt-8">
          {loading ? (
            <LoadingState />
          ) : (
            <ProductListingLayout
              title={activeCategory ? activeCategory.name : 'All Products'}
              subtitle={collectionPills ? undefined : 'Browse our full catalog'}
              products={filteredProducts}
              categories={categories}
              filters={filters}
              onFiltersChange={setFilters}
              headerExtra={collectionPills}
            />
          )}
        </section>
      </main>
    </Layout>
  );
}
