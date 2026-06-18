import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductListingLayout from '../components/ProductListingLayout';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { apiRequest } from '../lib/api';
import { defaultFilters, filterAndSortProducts } from '../lib/productFilters';
import type { Category, Collection } from '../types';

export default function CollectionDetailPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    apiRequest<Category[]>('/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiRequest<Collection>(`/collections/${slug}`)
      .then(setCollection)
      .catch((err) => {
        setCollection(null);
        setError(err.message || 'Collection not found');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const products = collection?.products || [];
  const filteredProducts = useMemo(() => filterAndSortProducts(products, filters), [products, filters]);

  return (
    <Layout>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/collections" className="text-sm uppercase tracking-[0.35em] text-amber-200 hover:text-white">
          ← All collections
        </Link>

        {loading ? (
          <LoadingState />
        ) : error || !collection ? (
          <div className="mt-8">
            <EmptyState
              title="Collection not found"
              description={error || 'This collection may have been removed.'}
              actionLabel="Browse collections"
              actionTo="/collections"
            />
          </div>
        ) : (
          <>
            <header className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200">{collection.category?.name}</p>
              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{collection.name}</h1>
              <p className="mt-3 max-w-2xl text-zinc-300">{collection.description}</p>
            </header>

            <section className="mt-8">
              {products.length ? (
                <ProductListingLayout
                  title={collection.name}
                  subtitle={collection.description}
                  products={filteredProducts}
                  categories={categories}
                  filters={filters}
                  onFiltersChange={setFilters}
                  showCategories
                  emptyTitle="No products match your filters"
                  emptyDescription="Try adjusting the price range or sort order."
                  emptyActionLabel="Browse shop"
                  emptyActionTo="/shop"
                />
              ) : (
                <EmptyState
                  title="No products in this collection"
                  description="Products will appear here once added from the admin panel."
                  actionLabel="Browse shop"
                  actionTo="/shop"
                />
              )}
            </section>
          </>
        )}
      </main>
    </Layout>
  );
}
