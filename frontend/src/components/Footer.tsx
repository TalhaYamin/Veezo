import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { apiRequest } from '../lib/api';
import { DEFAULT_SOCIAL_LINKS } from '../lib/socialLinks';
import { contactInfoFromSettings } from '../lib/contactInfo';
import type { SiteSettings } from '../types/admin';

function SocialIcon({ type }: { type: 'instagram' | 'facebook' | 'whatsapp' }) {
  if (type === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }

  if (type === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    apiRequest<SiteSettings>('/settings')
      .then(setSettings)
      .catch(() => null);
  }, []);

  const footer = settings?.footer;
  const contact = contactInfoFromSettings(settings || undefined);
  const social = {
    instagram: footer?.socialLinks?.instagram || DEFAULT_SOCIAL_LINKS.instagram,
    facebook: footer?.socialLinks?.facebook || DEFAULT_SOCIAL_LINKS.facebook,
    whatsapp: footer?.socialLinks?.whatsapp || settings?.whatsappNumber || DEFAULT_SOCIAL_LINKS.whatsapp,
  };

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
          <Logo variant="footer" />
          <p className="mt-4 text-sm text-zinc-400">
            {footer?.companyDescription || 'Premium fashion for the modern wardrobe. Curated collections, crafted details.'}
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-black"
            >
              <SocialIcon type="instagram" />
            </a>
            <a
              href={social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-black"
            >
              <SocialIcon type="facebook" />
            </a>
            <a
              href={social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-black"
            >
              <SocialIcon type="whatsapp" />
            </a>
          </div>
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
            <a href={`mailto:${contact.email}`} className="hover:text-amber-200">{contact.email}</a>
            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:text-amber-200">{contact.phone}</a>
            <span>{contact.address}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-zinc-500">
        {footer?.copyright || `© ${new Date().getFullYear()} VEEZO. All rights reserved.`}
      </div>
    </footer>
  );
}
