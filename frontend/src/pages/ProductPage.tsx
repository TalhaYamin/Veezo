import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ImageGallery from '../components/ImageGallery';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { apiRequest } from '../lib/api';
import { useCartStore } from '../store/cart';
import type { Product } from '../types';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiRequest<Product>(`/products/${id}`)
      .then((item) => {
        setProduct(item);
        setSize(item.sizes[0] || 'One size');
      })
      .catch((err) => {
        setProduct(null);
        setError(err.message || 'Product not found');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock <= 0) {
      setMessage('This item is currently sold out.');
      return;
    }
    addItem(product, size, quantity);
    setMessage('Added to cart.');
  };

  return (
    <Layout>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/shop" className="text-sm uppercase tracking-[0.35em] text-amber-200 hover:text-white">
          ← Back to shop
        </Link>

        {loading ? (
          <LoadingState />
        ) : error || !product ? (
          <div className="mt-8">
            <EmptyState title="Product not found" description={error} actionLabel="Continue shopping" actionTo="/shop" />
          </div>
        ) : (
          <section className="mt-6 grid gap-8 rounded-[32px] border border-white/10 bg-white/5 p-6 md:grid-cols-2 md:p-8">
            <ImageGallery images={product.images} name={product.name} />
            <article className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-amber-200">
                  {product.collection?.name} · {product.category?.name}
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{product.name}</h1>
              </div>
              <p className="text-zinc-300">{product.description}</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-semibold text-amber-100">${product.price}</span>
                {product.oldPrice ? <span className="text-sm text-zinc-500 line-through">${product.oldPrice}</span> : null}
              </div>
              <p className="text-sm text-zinc-400">{product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}</p>

              {product.sizes.length > 0 ? (
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Size</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.sizes.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSize(item)}
                        className={`rounded-full px-4 py-2 text-sm ${size === item ? 'bg-amber-400 text-black' : 'border border-white/10 text-zinc-200'}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Quantity</p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="rounded-full border border-white/10 px-3 py-2"
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="rounded-full border border-white/10 px-3 py-2"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {product.stock > 0 ? 'Add to cart' : 'Sold out'}
                </button>
                <Link to="/cart" className="rounded-full border border-white/10 px-5 py-3 text-sm text-white hover:border-amber-400/40">
                  View cart
                </Link>
              </div>
              {message ? <p className="text-sm text-amber-200">{message}</p> : null}
            </article>
          </section>
        )}
      </main>
    </Layout>
  );
}
