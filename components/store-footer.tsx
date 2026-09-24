'use client';
import { sitePath } from '@/lib/site-path';

import { navigationCategories } from '@/lib/categories.mjs';
import { useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  Clock,
  Heart,
  ShoppingBag,
} from 'lucide-react';
export default function StoreFooter({
  category,
  home,
  favorites,
  cart,
}: {
  category: (name: string) => void;
  home: () => void;
  favorites: () => void;
  cart: () => void;
}) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggle = (key: string) =>
    setExpanded((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  return (
    <footer className="store-footer">
      <div className="footer-main wrap">
        <div className="footer-brand">
          <a
            className="footer-wordmark"
            href={sitePath('/')}
            onClick={(e) => {
              e.preventDefault();
              home();
            }}
          >
            mosso
          </a>
          <p className="footer-tagline">Her halinle, kendin gibi.</p>
          <p className="footer-intro">
            Ereğli’den gardırobuna. Günlük rahatlıktan özel günlere, kendi tarzını bulacağın
            parçalar Mosso’da.
          </p>
          <div className="footer-socials">
            <a
              className="footer-social"
              aria-label="Instagram: @mosso_moda"
              href="https://www.instagram.com/mosso_moda/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>{' '}
              <span className="footer-social-handle">@mosso_moda</span>
            </a>
            <a
              className="footer-social"
              href="https://www.tiktok.com/@mosso_moda?lang=tr-TR"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok: @mosso_moda"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M16.7 2h-3.3v13.5a3 3 0 1 1-2.6-3V9.1a6.4 6.4 0 1 0 5.9 6.4V8.6a8 8 0 0 0 4.6 1.5V6.8A4.7 4.7 0 0 1 16.7 2Z" />
              </svg>
              <span className="footer-social-handle">@mosso_moda</span>
            </a>
          </div>
          <div className="footer-shortcuts">
            <button onClick={favorites}>
              <Heart size={16} /> Favorilerim
            </button>
            <button onClick={cart}>
              <ShoppingBag size={16} /> Sepetim
            </button>
          </div>
        </div>
        <section className={`footer-group ${expanded.includes('discover') ? 'expanded' : ''}`}>
          <h3 className="footer-desktop-title">Koleksiyonu keşfet</h3>
          <button
            className="footer-toggle"
            aria-expanded={expanded.includes('discover')}
            aria-controls="footer-discover"
            onClick={() => toggle('discover')}
          >
            Koleksiyonu keşfet <ChevronDown size={17} />
          </button>
          <div className="footer-links" id="footer-discover">
            {navigationCategories.map((cat) => (
              <button key={cat} onClick={() => category(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </section>
        <section
          className={`footer-group footer-store-card ${expanded.includes('contact') ? 'expanded' : ''}`}
        >
          <h3 className="footer-desktop-title">Mağazamız & iletişim</h3>
          <button
            className="footer-toggle"
            aria-expanded={expanded.includes('contact')}
            aria-controls="footer-contact"
            onClick={() => toggle('contact')}
          >
            Mağazamız & iletişim <ChevronDown size={17} />
          </button>
          <div className="footer-links footer-contact" id="footer-contact">
            <address>
              <MapPin size={18} aria-hidden="true" />{' '}
              <div>
                Hacı Mütahir Mahallesi, İnönü Caddesi
                <br />
                42320 Ereğli / Konya
                <small>Tatlı Telaş Pastanesi yanı, Mis Pide Lokantası civarı.</small>
              </div>
            </address>
            <a
              className="footer-map-link"
              href="https://www.google.com/maps/search/?api=1&query=37.511965%2C34.049148"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mağazaya yol tarifi <ArrowUpRight size={15} />
            </a>
            <a className="footer-phone" href="tel:+905327904880">
              <Phone size={16} /> 0532 790 48 80
            </a>
            <a
              className="footer-whatsapp"
              href="https://wa.me/905327904880"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 11.5a9 9 0 0 1-13.4 7.9L3 21l1.5-4.7A9 9 0 1 1 21 11.5Z" />
                <path d="m8 7 1.4-.3 1.3 2.7-1 1.1a8 8 0 0 0 3.8 3.8l1.1-1 2.7 1.3-.3 1.4c-.2 1-1.4 1.4-2.3 1.1-4.1-1.2-6.6-3.7-7.8-7.8C6.6 8.4 7 7.2 8 7Z" />
              </svg>{' '}
              WhatsApp’tan yaz
            </a>
            <a className="footer-email" href="mailto:emrhnemre53@gmail.com">
              <Mail size={18} aria-hidden="true" /> emrhnemre53@gmail.com
            </a>
            <p>
              <Clock size={16} aria-hidden="true" /> Mağaza saatleri:{' '}
              <time dateTime="10:00">10.00</time>–<time dateTime="20:00">20.00</time>
            </p>
          </div>
        </section>
      </div>
      <div className="footer-note footer-preview wrap">
        <p>Tasarım önizlemesi. Ürün, görsel ve fiyatlar örnektir; gerçek satış yapılmaz.</p>
      </div>
      <div className="footer-bottom wrap">
        <span>© {new Date().getFullYear()} Mosso</span>
        <a href={sitePath('/ogrenme/')} target="_blank" rel="noreferrer">
          Proje rehberi <ArrowUpRight size={12} />
        </a>
        <span>Türkiye / Türkçe / TRY ₺</span>
      </div>
    </footer>
  );
}
