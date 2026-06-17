import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingState from '../components/LoadingState';
import { apiRequest } from '../lib/api';
import { type OrderVerifyResponse } from '../lib/checkout';
import { useCartStore } from '../store/cart';

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');
  const clearCart = useCartStore((s) => s.clearCart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OrderVerifyResponse | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Missing order reference.');
      setLoading(false);
      return;
    }

    apiRequest<OrderVerifyResponse>(`/checkout/order/${orderId}`)
      .then((data) => {
        if (!data.confirmed) {
          setError('Your order could not be confirmed. Please contact support.');
          return;
        }
        setResult(data);
        clearCart();
      })
      .catch((err) => setError(err.message || 'Unable to verify order'))
      .finally(() => setLoading(false));
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <Layout>
        <main className="mx-auto w-full max-w-3xl px-4 py-16">
          <LoadingState label="Confirming your order..." />
        </main>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-red-400/20 bg-red-400/5 p-8 text-center">
            <h1 className="text-2xl font-semibold text-white">Order verification issue</h1>
            <p className="mt-4 text-zinc-300">{error}</p>
            {orderId ? <p className="mt-3 text-xs text-zinc-500">Reference: {orderId}</p> : null}
            <Link to="/contact" className="mt-8 inline-block rounded-full border border-white/10 px-5 py-3 text-sm text-white">
              Contact support
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-emerald-400/20 bg-emerald-400/5 p-8 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Order confirmed</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Thank you for your order</h1>
          <p className="mt-4 text-zinc-300">
            Your order has been placed. Please keep cash ready — you will pay on delivery.
          </p>

          {result?.order ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-left">
              <div className="flex justify-between text-sm text-zinc-300">
                <span>Total due on delivery</span>
                <span className="font-semibold text-amber-100">${result.order.total.toFixed(2)}</span>
              </div>
              {result.order.customerName ? (
                <p className="mt-2 text-sm text-zinc-400">Deliver to: {result.order.customerName}</p>
              ) : null}
              {result.order.customerPhone ? (
                <p className="mt-1 text-sm text-zinc-400">Phone: {result.order.customerPhone}</p>
              ) : null}
              {result.order.shippingAddress ? (
                <p className="mt-1 text-sm text-zinc-400">Address: {result.order.shippingAddress}</p>
              ) : null}
              {result.order.customerEmail ? (
                <p className="mt-2 text-sm text-zinc-400">Email: {result.order.customerEmail}</p>
              ) : null}
              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm text-zinc-300">
                {result.order.items.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>
                      {item.quantity} × ${item.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {orderId ? <p className="mt-4 text-xs text-zinc-500">Reference: {orderId}</p> : null}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black">
              Continue shopping
            </Link>
            <Link to="/collections" className="rounded-full border border-white/10 px-5 py-3 text-sm text-white">
              View collections
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
