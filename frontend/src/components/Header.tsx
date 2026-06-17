import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCartStore } from '../store/cart';

const links = [
  { to: '/shop', label: 'Shop' },
  { to: '/collections', label: 'Collections' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const count = useCartStore((s) => s.count());

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group">
          <p className="text-[10px] uppercase tracking-[0.45em] text-amber-300">VEEZO</p>
          <p className="text-lg font-semibold tracking-[0.25em] text-white group-hover:text-amber-100">LUXURY FASHION</p>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm transition ${isActive ? 'text-amber-200' : 'text-zinc-300 hover:text-white'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/cart" className="relative rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:border-amber-400/40 hover:text-amber-100">
            Cart
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-black">
                {count}
              </span>
            ) : null}
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-200 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-white/10 text-amber-200' : 'text-zinc-300'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/cart" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm text-zinc-300">
              Cart {count > 0 ? `(${count})` : ''}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
