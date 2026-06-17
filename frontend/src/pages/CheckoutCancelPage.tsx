import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function CheckoutCancelPage() {
  return (
    <Layout>
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Checkout cancelled</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Your order was not completed</h1>
          <p className="mt-4 text-zinc-300">No order was placed. Your cart items are still available.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/cart" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black">
              Return to cart
            </Link>
            <Link to="/shop" className="rounded-full border border-white/10 px-5 py-3 text-sm text-white">
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
