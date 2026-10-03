'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { money, type Product } from '@/lib/products';
import { sitePath } from '@/lib/site-path';

export default function CheckoutRecommendations({ items }: { items: Product[] }) {
  const carousel = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(items.length / 2);

  useEffect(() => {
    const track = carousel.current;
    if (!track) return;
    const updatePage = () => {
      const range = track.scrollWidth - track.clientWidth;
      const progress = range > 0 ? Math.max(0, Math.min(1, track.scrollLeft / range)) : 0;
      setPage(Math.round(progress * (pageCount - 1)));
    };
    const observer = new ResizeObserver(updatePage);
    observer.observe(track);
    track.addEventListener('scroll', updatePage, { passive: true });
    updatePage();
    return () => {
      observer.disconnect();
      track.removeEventListener('scroll', updatePage);
    };
  }, [pageCount]);

  if (!items.length) return null;

  return (
    <section className="mobile-checkout-recommendations" aria-label="Ürün önerileri">
      <header>
        <h2>Bunları da sevebilirsin.</h2>
        <p>
          Yana kaydır <ArrowRight size={13} aria-hidden="true" />
        </p>
      </header>
      <div ref={carousel} className="checkout-recommendation-track">
        {items.map((product) => (
          <a
            key={product.id}
            href={sitePath(`/?urun=${encodeURIComponent(product.id)}`)}
            aria-label={`${product.name} ürününü incele`}
          >
            <div className="checkout-recommendation-image">
              <img src={sitePath(product.image)} alt={product.name} loading="lazy" />
            </div>
            <div className="checkout-recommendation-info">
              <span>{product.name}</span>
              <strong>{money(product.price)}</strong>
            </div>
          </a>
        ))}
      </div>
      {pageCount > 1 && (
        <nav className="checkout-recommendation-pages" aria-label="Önerilen ürünler sayfaları">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Önerilerin ${index + 1}. sayfası`}
              aria-pressed={page === index}
              onClick={() => {
                const track = carousel.current;
                if (!track) return;
                track.scrollTo({
                  left: ((track.scrollWidth - track.clientWidth) * index) / (pageCount - 1),
                  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'instant'
                    : 'smooth',
                });
              }}
            >
              <span />
            </button>
          ))}
        </nav>
      )}
    </section>
  );
}
