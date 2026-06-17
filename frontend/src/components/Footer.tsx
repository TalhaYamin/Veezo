import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.45em] text-amber-300">VEEZO</p>
          <p className="mt-2 text-sm text-zinc-400">Premium fashion for the modern wardrobe. Curated collections, crafted details.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Explore</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-300">
            <Link to="/shop" className="hover:text-amber-200">Shop</Link>
            <Link to="/collections" className="hover:text-amber-200">Collections</Link>
            <Link to="/about" className="hover:text-amber-200">About</Link>
            <Link to="/contact" className="hover:text-amber-200">Contact</Link>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Support</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-300">
            <a href="mailto:concierge@veezo.com" className="hover:text-amber-200">concierge@veezo.com</a>
            <Link to="/cart" className="hover:text-amber-200">Your cart</Link>
            <Link to="/checkout" className="hover:text-amber-200">Checkout</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} VEEZO. All rights reserved.
      </div>
    </footer>
  );
}
