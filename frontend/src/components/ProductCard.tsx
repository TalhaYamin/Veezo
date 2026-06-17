import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { imageUrl } from '../lib/images';

export default function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;

  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-xl shadow-black/40 backdrop-blur-xl transition hover:border-amber-400/30">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
          {product.image ? (
            <img
              src={imageUrl(product.image)}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-900 to-black text-xs uppercase tracking-[0.35em] text-zinc-500">
              No image
            </div>
          )}
          {product.badge ? (
            <span className="absolute left-3 top-3 rounded-full border border-amber-400/30 bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-amber-100">
              {product.badge}
            </span>
          ) : null}
          {outOfStock ? (
            <span className="absolute right-3 top-3 rounded-full bg-red-500/90 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white">
              Sold out
            </span>
          ) : null}
        </div>
        <div className="p-4">
          <p className="text-[11px] uppercase tracking-[0.35em] text-amber-200">
            {product.collection?.name || product.category?.name || 'VEEZO'}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{product.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-end gap-2">
              <span className="text-lg font-semibold text-amber-100">${product.price}</span>
              {product.oldPrice ? <span className="text-sm text-zinc-500 line-through">${product.oldPrice}</span> : null}
            </div>
            <span className="text-xs text-zinc-500">{outOfStock ? 'Unavailable' : `${product.stock} in stock`}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
