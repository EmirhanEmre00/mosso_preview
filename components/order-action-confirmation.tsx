import { useEffect, useRef } from 'react';
import { RotateCcw, X } from 'lucide-react';
import type { OrderRow, ReturnSelection } from '@/lib/demo-orders';
import { returnReasons } from '@/lib/order-lifecycle.mjs';
import { products } from '@/lib/products';
import { cartRowKey } from '@/lib/cart.mjs';

export type OrderAction =
  | { kind: 'cancel'; id: string; items: OrderRow[] }
  | { kind: 'return'; id: string; selection: ReturnSelection };

export default function OrderActionConfirmation({
  action,
  onConfirm,
  onDismiss,
}: {
  action: OrderAction;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dismissRef = useRef<HTMLButtonElement>(null);
  const returning = action.kind === 'return';
  const items = returning ? action.selection.items : action.items;
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    dismissRef.current?.focus();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className="order-confirm-dialog"
      aria-labelledby="order-confirm-title"
      aria-describedby="order-confirm-description"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      <button
        className="order-confirm-close"
        type="button"
        onClick={onDismiss}
        aria-label="Onay penceresini kapat"
      >
        <X size={20} />
      </button>
      <span className="order-confirm-icon" aria-hidden="true">
        {returning ? <RotateCcw size={22} /> : <X size={22} />}
      </span>
      <h3 id="order-confirm-title">
        {returning ? 'İade talebini gönderelim mi?' : 'Seçilen ürünleri iptal etmek istiyor musun?'}
      </h3>
      <p id="order-confirm-description">
        {returning
          ? 'Onayladığında iade talebin oluşturulacak. İade, ürün kontrolü ve mağaza onayından sonra tamamlanır.'
          : 'Yalnızca aşağıda seçtiğin ürünler ve adetler iptal edilecek. Devam etmek istediğine emin misin?'}
      </p>
      <div className="order-confirm-summary">
        <span>Sipariş</span>
        <strong>{action.id}</strong>
        <ul className="order-confirm-items">
          {items.map((item) => (
            <li key={cartRowKey(item)}>
              <strong>{products.find((product) => product.id === item.id)?.name}</strong>
              <span>
                {item.color} · Beden: {item.size} · {item.quantity} adet
              </span>
            </li>
          ))}
        </ul>
        {returning && (
          <p>
            İade nedeni:{' '}
            <strong>
              {returnReasons.find((reason) => reason.key === action.selection.category)?.label}
            </strong>
          </p>
        )}
      </div>
      <div className="order-confirm-buttons">
        <button
          ref={dismissRef}
          type="button"
          className="order-confirm-dismiss"
          onClick={onDismiss}
        >
          Geri dön
        </button>
        <button type="button" className="primary" onClick={onConfirm}>
          {returning ? 'Evet, talebi gönder' : 'Evet, ürünleri iptal et'}
        </button>
      </div>
    </dialog>
  );
}
