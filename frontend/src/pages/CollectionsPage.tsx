import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { apiRequest } from '../lib/api';
import type { Collection } from '../types';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Collection[]>('/collections')
      .then(setCollections)
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Collections</p>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Seasonal edits</h1>
          <p className="mt-3 max-w-2xl text-zinc-300">
            Explore curated collections within each category. Every drop is designed for effortless luxury.
          </p>
        </header>

        {loading ? (
          <LoadingState />
        ) : collections.length ? (
          <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                to={`/collections/${collection.slug}`}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6 transition hover:border-amber-400/30"
              >
                <p className="text-[11px] uppercase tracking-[0.35em] text-amber-200">
                  {collection.category?.name || 'Collection'}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{collection.name}</h2>
                <p className="mt-3 text-sm text-zinc-400">{collection.description || 'Shop the edit'}</p>
                <p className="mt-5 text-xs text-zinc-500">{collection.productCount || 0} products</p>
              </Link>
            ))}
          </section>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="No collections yet"
              description="Check back soon for new seasonal drops."
              actionLabel="Browse shop"
              actionTo="/shop"
            />
          </div>
        )}
      </main>
    </Layout>
  );
}
