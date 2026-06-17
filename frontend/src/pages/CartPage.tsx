import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import EmptyState from '../components/EmptyState';
import { useCartStore } from '../store/cart';
import { imageUrl } from '../lib/images';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.total());

  return (
    <Layout>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Cart</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Your selection</h1>
        </header>

        {items.length ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="space-y-4">
              {items.map((item) => (
                <article key={`${item.productId}-${item.size}`} className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
                  <img src={imageUrl(item.image)} alt={item.name} className="h-28 w-28 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white">{item.name}</h2>
                    <p className="mt-1 text-sm text-zinc-400">Size: {item.size}</p>
                    <p className="mt-2 text-amber-100">${item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} className="rounded-full border border-white/10 px-3 py-1">−</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} className="rounded-full border border-white/10 px-3 py-1">+</button>
                  </div>
                  <button type="button" onClick={() => removeItem(item.productId, item.size)} className="text-sm text-zinc-400 hover:text-red-300">
                    Remove
                  </button>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-[28px] border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">Order summary</h2>
              <div className="mt-4 flex items-center justify-between text-zinc-300">
                <span>Subtotal</span>
                <span className="text-amber-100">${total.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="mt-6 block rounded-full bg-amber-400 px-5 py-3 text-center text-sm font-semibold text-black">
                Proceed to checkout
              </Link>
            </aside>
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState title="Your cart is empty" description="Discover our latest collections and add pieces you love." actionLabel="Start shopping" actionTo="/shop" />
          </div>
        )}
      </main>
    </Layout>
  );
}
