import { useState } from 'react';
import type { ProductImage } from '../types';
import { imageUrl } from '../lib/images';

export default function ImageGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const sorted = [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const [active, setActive] = useState(0);
  const current = sorted[active];

  if (!sorted.length) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-[28px] border border-white/10 bg-zinc-900 text-sm text-zinc-500">
        No images available
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-900">
        <img
          src={imageUrl(current.url)}
          alt={current.alt || name}
          className="aspect-[4/5] w-full object-cover"
        />
      </div>
      {sorted.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {sorted.map((img, index) => (
            <button
              key={`${img.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`overflow-hidden rounded-xl border ${active === index ? 'border-amber-400' : 'border-white/10'}`}
            >
              <img src={imageUrl(img.url)} alt="" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
