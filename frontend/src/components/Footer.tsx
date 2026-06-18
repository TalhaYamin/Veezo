import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import type { SiteSettings } from '../types/admin';

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    apiRequest<SiteSettings>('/settings')
      .then(setSettings)
      .catch(() => null);
  }, []);

  const footer = settings?.footer;
  const quickLinks = footer?.quickLinks?.length
    ? footer.quickLinks
    : [
        { name: 'Shop', url: '/shop', page: 'shop' },
        { name: 'Collections', url: '/collections', page: 'custom' },
        { name: 'About', url: '/about', page: 'about' },
        { name: 'Contact', url: '/contact', page: 'contact' },
      ];

  return (
    <footer className="mt-16 border-t border-white/10 bg-black/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.45em] text-amber-300">{settings?.storeName || 'VEEZO'}</p>
          <p className="mt-2 text-sm text-zinc-400">
            {footer?.companyDescription || 'Premium fashion for the modern wardrobe. Curated collections, crafted details.'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Explore</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-300">
            {quickLinks.map((link) => (
              <Link key={`${link.name}-${link.url}`} to={link.page === 'custom' ? link.url : `/${link.page === 'home' ? '' : link.page}`} className="hover:text-amber-200">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Support</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-300">
            {footer?.contactInfo?.email ? (
              <a href={`mailto:${footer.contactInfo.email}`} className="hover:text-amber-200">{footer.contactInfo.email}</a>
            ) : null}
            {footer?.contactInfo?.phone ? <span>{footer.contactInfo.phone}</span> : null}
            {footer?.contactInfo?.address ? <span>{footer.contactInfo.address}</span> : null}
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-zinc-500">
        {footer?.copyright || `© ${new Date().getFullYear()} VEEZO. All rights reserved.`}
      </div>
    </footer>
  );
}
