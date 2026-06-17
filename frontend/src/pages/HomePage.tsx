import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import LoadingState from '../components/LoadingState';
import { apiRequest } from '../lib/api';
import type { Category, Product } from '../types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<Product[]>('/products?featured=true'),
      apiRequest<Category[]>('/categories'),
    ])
      .then(([featured, cats]) => {
        setProducts(featured);
        setCategories(cats.slice(0, 3));
      })
      .catch(() => {
        setProducts([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid items-end gap-8 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(212,175,55,0.08))] p-8 shadow-2xl shadow-black/50 md:grid-cols-[1.1fr_0.9fr] md:p-12">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.45em] text-amber-200">New season drop</p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-[0.12em] text-white md:text-6xl">
              Luxury essentials with a modern edge.
            </h1>
            <p className="max-w-md text-zinc-300">
              VEEZO blends timeless tailoring, premium materials, and curated collections into a refined shopping experience.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black">
                Shop now
              </Link>
              <Link to="/collections" className="rounded-full border border-white/15 px-5 py-3 text-sm text-white hover:border-amber-400/40">
                View collections
              </Link>
            </div>
          </div>
          <article className="rounded-[28px] border border-white/10 bg-black/40 p-5">
            <div className="aspect-[4/3] rounded-[24px] border border-amber-400/20 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.2),transparent_35%),linear-gradient(145deg,#141414,#050505)]" />
            <div className="mt-4 flex items-center justify-between text-sm text-zinc-300">
              <span>Premium materials</span>
              <span className="text-amber-200">Crafted details</span>
            </div>
          </article>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Browse by category</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Curated departments</h2>
            </div>
            <Link to="/shop" className="text-sm text-amber-200 hover:text-white">View all</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-amber-400/30"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Category</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{category.name}</h3>
                <p className="mt-2 text-sm text-zinc-400">{category.description || 'Explore the edit'}</p>
                <p className="mt-4 text-xs text-zinc-500">{category.productCount || 0} products</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[32px] border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Featured edit</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Pieces for the season</h2>
            </div>
            <Link to="/shop" className="text-sm text-amber-200 hover:text-white">Browse all</Link>
          </div>
          {loading ? (
            <LoadingState />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
}
