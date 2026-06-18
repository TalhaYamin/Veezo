import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import EmptyState from '../components/EmptyState';
import { apiRequest } from '../lib/api';
import { formatPrice } from '../lib/currency';
import { calculateDeliveryCharge, calculateOrderTotal } from '../lib/delivery';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { type PlaceOrderResponse } from '../lib/checkout';
import { useCartStore } from '../store/cart';

const inputClass =
  'mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400/40';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.total());
  const clearCart = useCartStore((s) => s.clearCart);
  const { settings } = useStoreSettings();

  const deliveryCharge = calculateDeliveryCharge(subtotal, settings);
  const total = calculateOrderTotal(subtotal, settings);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const placeOrder = async () => {
    if (!items.length) return;

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Name, phone, and delivery address are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        items: items.map((item) => ({
          productId: item.productId,
          name: `${item.name} (${item.size})`,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          image: item.image,
        })),
      };

      const response = await apiRequest<PlaceOrderResponse>('/checkout/place-order', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.ok && response.orderId) {
        clearCart();
        navigate(`/checkout/success?order_id=${response.orderId}`);
        return;
      }

      setError('Unable to place order.');
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {items.length ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Checkout</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Complete your order</h1>

              <div className="mt-6 space-y-4">
                <label className="block text-sm text-zinc-400">
                  Full name (required)
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="John Doe"
                  />
                </label>

                <label className="block text-sm text-zinc-400">
                  Phone (required)
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+92 300 0000000"
                  />
                </label>

                <label className="block text-sm text-zinc-400">
                  Email (optional)
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </label>

                <label className="block text-sm text-zinc-400">
                  Delivery address (required)
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputClass}
                    placeholder="Street, city, postal code"
                  />
                </label>
              </div>

              <ul className="mt-6 space-y-3">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.size}`}
                    className="flex justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-200"
                  >
                    <span>
                      {item.name} · {item.size}
                    </span>
                    <span>
                      {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="h-fit rounded-[28px] border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">Payment</h2>

              <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                <span className="text-sm font-medium text-white">Cash on delivery</span>
                <p className="mt-2 text-xs text-zinc-400">
                  Pay with cash when your order is delivered. No online payment required.
                </p>
              </div>

              <div className="mt-5 space-y-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span>{deliveryCharge === 0 ? 'Free' : formatPrice(deliveryCharge)}</span>
                </div>
                {settings.freeShippingThreshold > 0 && subtotal < settings.freeShippingThreshold ? (
                  <p className="text-xs text-zinc-500">
                    Free delivery on orders over {formatPrice(settings.freeShippingThreshold)}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-lg text-amber-100">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <button
                type="button"
                onClick={placeOrder}
                disabled={loading}
                className="mt-6 w-full rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-60"
              >
                {loading ? 'Placing order...' : 'Place order (COD)'}
              </button>

              {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
              <Link to="/cart" className="mt-4 block text-center text-sm text-zinc-400 hover:text-white">
                ← Back to cart
              </Link>
            </aside>
          </div>
        ) : (
          <EmptyState
            title="Nothing to checkout"
            description="Add items to your cart before proceeding."
            actionLabel="Go to shop"
            actionTo="/shop"
          />
        )}
      </main>
    </Layout>
  );
}
