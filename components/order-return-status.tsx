import { useEffect, useRef, useState } from 'react';
import { Package, RotateCcw } from 'lucide-react';
import type { ReturnRequest } from '@/lib/demo-orders';
import { returnReasons } from '@/lib/order-lifecycle.mjs';
import { products } from '@/lib/products';
import { cartRowKey } from '@/lib/cart.mjs';

const messages: Record<ReturnRequest['status'], { title: string; detail: string; step: number }> = {
  requested: { title: 'Talebin bize ulaştı', detail: 'Mağaza yanıtı bekleniyor.', step: 0 },
  in_transit: { title: 'Ürünün geri geliyor', detail: 'Kargo teslimatı bekleniyor.', step: 0 },
  inspection: { title: 'Ürünün kontrol ediliyor', detail: 'Mağaza incelemesi sürüyor.', step: 1 },
  approved: { title: 'İaden onaylandı', detail: 'Ödeme iadesi hazırlanıyor.', step: 2 },
  refund_pending: {
    title: 'Geri ödemen bekleniyor',
    detail: 'Ödeme işlemi devam ediyor.',
    step: 2,
  },
  completed: {
    title: 'İade sürecin tamamlandı',
    detail: 'İade sürecin tamamlandı.',
    step: 2,
  },
  rejected: {
    title: 'İade talebin onaylanmadı',
    detail: 'Ayrıntılar için bizimle iletişime geçebilirsin.',
    step: -1,
  },
};

export default function OrderReturnStatus({
  request,
  reveal = false,
  headingId = 'return-title',
}: {
  request: ReturnRequest;
  reveal?: boolean;
  headingId?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [highlighted, setHighlighted] = useState(false);
  useEffect(() => {
    if (!reveal) return;
    let timer: ReturnType<typeof setTimeout>;
    const frame = requestAnimationFrame(() => {
      const section = sectionRef.current;
      if (!section) return;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      section.focus({ preventScroll: true });
      section.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' });
      setHighlighted(true);
      timer = setTimeout(() => setHighlighted(false), 2200);
    });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [reveal, request.requestedAt]);
  const message = messages[request.status];
  const complete = request.status === 'completed';
  const reason =
    returnReasons.find((item) => item.key === request.category)?.label || request.reason;
  return (
    <section
      ref={sectionRef}
      tabIndex={-1}
      className={`order-return-status${highlighted ? ' return-highlighted' : ''}`}
      aria-labelledby={headingId}
    >
      <div className="return-status-banner">
        <span className="return-package-icon" aria-hidden="true">
          <Package size={34} strokeWidth={1.5} />
          <RotateCcw size={16} />
        </span>
        <div>
          <span className="return-status-caption">İade sürecin</span>
          <h3 id={headingId}>{message.title}</h3>
          <p>{message.detail}</p>
        </div>
      </div>
      <div className="return-status-details">
        {request.status !== 'rejected' && (
          <ol className="return-segments" aria-label="İade aşamaları">
            {['Talep', 'Kontrol', 'Geri ödeme'].map((label, index) => {
              const done = complete || index < message.step;
              const current = !complete && index === message.step;
              return (
                <li
                  key={label}
                  className={done ? 'done' : current ? 'current' : ''}
                  aria-current={current ? 'step' : undefined}
                  aria-label={`${label}: ${done ? 'Tamamlandı' : current ? 'Devam ediyor' : 'Bekleniyor'}`}
                >
                  <span className="return-segment-bar" aria-hidden="true" />
                  {label}
                </li>
              );
            })}
          </ol>
        )}
        <dl className="return-request-meta">
          <div className="return-meta-items">
            <dt>Bu talepteki ürünler</dt>
            <dd>
              {request.items.map((item) => (
                <span className="return-request-item" key={cartRowKey(item)}>
                  {products.find((product) => product.id === item.id)?.name} · {item.color} ·{' '}
                  {item.size} beden · {item.quantity} adet
                </span>
              ))}
            </dd>
          </div>
          <div className="return-meta-date">
            <dt>Talep tarihi</dt>
            <dd>
              {new Date(request.requestedAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
          <div className="return-meta-reason">
            <dt>İade nedeni</dt>
            <dd>{reason}</dd>
          </div>
          {request.description && (
            <div className="return-meta-description">
              <dt>Ek açıklama</dt>
              <dd>{request.description}</dd>
            </div>
          )}
        </dl>
        {!complete && request.status !== 'rejected' && (
          <p className="return-approval-note">
            İade, ürün kontrolü ve mağaza onayından sonra tamamlanır.
          </p>
        )}
      </div>
    </section>
  );
}
