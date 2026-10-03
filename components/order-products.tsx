'use client';
import { products, money } from '@/lib/products';
import { sitePath } from '@/lib/site-path';
import type { DemoOrder, OrderRow, ReturnRequest } from '@/lib/demo-orders';
import { cartRowKey } from '@/lib/cart.mjs';
import { getReturnRequests } from '@/lib/order-lifecycle.mjs';
import ColorSelector from './color-selector';
import { Minus, Plus, Trash2 } from 'lucide-react';
export default function OrderProducts({
  rows,
  onChange,
  order,
}: {
  rows: OrderRow[];
  onChange?: (rows: OrderRow[]) => void;
  order?: DemoOrder;
}) {
  const requests: ReturnRequest[] = order ? getReturnRequests(order) : [];
  return (
    <div className="order-product-list">
      {rows.map((row) => {
        const p = products.find((p) => p.id === row.id);
        if (!p) return null;
        const color = p.colors.find((color) => color.name === row.color) || p.colors[0];
        const matchingRow = (size: string, colorName: string) =>
          rows.find(
            (other) =>
              other !== row &&
              other.id === row.id &&
              other.size === size &&
              (other.color || p.colors[0].name) === colorName,
          );
        const changeVariant = (size: string, colorName: string) => {
          if (!onChange || !p.sizes.includes(size) || !p.colors.some((c) => c.name === colorName))
            return;
          const existing = matchingRow(size, colorName);
          if (existing && existing.quantity + row.quantity > 10) return;
          onChange(
            existing
              ? rows
                  .filter((r) => r !== row)
                  .map((r) => (r === existing ? { ...r, quantity: r.quantity + row.quantity } : r))
              : rows.map((r) => (r === row ? { ...r, size, color: colorName } : r)),
          );
        };
        const cancelled =
          order?.cancelledRows?.find((item) => cartRowKey(item) === cartRowKey(row))?.quantity || 0;
        const requested = order
          ? requests
              .filter((request) => request.status !== 'rejected')
              .flatMap((request) => request.items)
              .filter((item) => cartRowKey(item) === cartRowKey(row))
              .reduce((sum, item) => sum + item.quantity, 0)
          : 0;
        return (
          <div className="order-product-row" key={cartRowKey(row)}>
            <img src={sitePath(p.image)} alt={p.name} loading="lazy" />
            <div className="order-product-copy">
              <small>{p.category}</small>
              <strong>{p.name}</strong>
              <div className="order-variant">
                <span>
                  <i style={{ background: color.hex }} aria-hidden="true" />
                  {color.name}
                </span>
                <span>Beden: {row.size}</span>
                <span>{row.quantity} adet</span>
              </div>
              <p>Birim fiyat: {money(p.price)}</p>
              <small>Ürün kodu: {p.id}</small>
              {(cancelled > 0 || requested > 0) && (
                <div className="order-item-status">
                  {cancelled > 0 && <span>{cancelled} adet iptal edildi</span>}
                  {requested > 0 && <span>{requested} adet için iade kaydı</span>}
                </div>
              )}
              {onChange && (
                <div className="checkout-color-selection">
                  <ColorSelector
                    colors={p.colors}
                    value={color.name}
                    onChange={(name) => changeVariant(row.size, name)}
                    disabled={(name) => {
                      const existing = matchingRow(row.size, name);
                      return !!existing && existing.quantity + row.quantity > 10;
                    }}
                  />
                  <small>Görsel: {p.colors[0].name} renk örneği.</small>
                </div>
              )}
              {onChange && (
                <div className="checkout-product-controls">
                  <label>
                    <span>Beden</span>
                    <select
                      aria-label={`${p.name} beden`}
                      value={row.size}
                      onChange={(e) => changeVariant(e.target.value, color.name)}
                    >
                      {p.sizes.map((size) => {
                        const existing = matchingRow(size, color.name);
                        return (
                          <option
                            key={size}
                            value={size}
                            disabled={!!existing && existing.quantity + row.quantity > 10}
                          >
                            {size}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <div className="quantity" role="group" aria-label={`${p.name} adet`}>
                    <button
                      type="button"
                      aria-label={`${p.name} adedini azalt`}
                      disabled={row.quantity <= 1}
                      onClick={() =>
                        onChange(
                          rows.map((r) => (r === row ? { ...r, quantity: r.quantity - 1 } : r)),
                        )
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <span aria-live="polite">{row.quantity}</span>
                    <button
                      type="button"
                      aria-label={`${p.name} adedini artır`}
                      disabled={row.quantity >= 10}
                      onClick={() =>
                        onChange(
                          rows.map((r) => (r === row ? { ...r, quantity: r.quantity + 1 } : r)),
                        )
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="checkout-remove-product"
                    aria-label={`${p.name} ${row.size} beden sepetten kaldır`}
                    onClick={() => onChange(rows.filter((r) => r !== row))}
                  >
                    <Trash2 size={16} /> Kaldır
                  </button>
                </div>
              )}
            </div>
            <strong className="order-line-price">{money(p.price * row.quantity)}</strong>
          </div>
        );
      })}
    </div>
  );
}
