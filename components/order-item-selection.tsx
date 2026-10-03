import type { OrderRow } from '@/lib/demo-orders';
import { cartRowKey } from '@/lib/cart.mjs';
import { products } from '@/lib/products';
import { sitePath } from '@/lib/site-path';

export default function OrderItemSelection({
  rows,
  selected,
  onChange,
}: {
  rows: OrderRow[];
  selected: OrderRow[];
  onChange: (items: OrderRow[]) => void;
}) {
  return (
    <fieldset className="order-item-selection">
      <legend>İşlem yapmak istediğin ürünleri seç</legend>
      <p>Yalnızca seçtiğin ürünler ve adetler işleme alınır.</p>
      {rows.map((row) => {
        const product = products.find((product) => product.id === row.id);
        if (!product) return null;
        const key = cartRowKey(row);
        const selection = selected.find((item) => cartRowKey(item) === key);
        const label = `${product.name}, ${row.color || product.colors[0].name}, ${row.size} beden`;
        return (
          <div className={`order-selectable-item${selection ? ' selected' : ''}`} key={key}>
            <label className="order-item-check">
              <input
                type="checkbox"
                checked={!!selection}
                aria-label={label}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...selected, { ...row, quantity: 1 }]
                      : selected.filter((item) => cartRowKey(item) !== key),
                  )
                }
              />
              <img src={sitePath(product.image)} alt="" loading="lazy" />
              <span>
                <strong>{product.name}</strong>
                <small>
                  {row.color || product.colors[0].name} · Beden: {row.size}
                </small>
                <small>{row.quantity} adet işlem yapılabilir</small>
              </span>
            </label>
            <label className="order-selected-quantity">
              Adet
              <select
                aria-label={`${label} işlem adedi`}
                disabled={!selection}
                value={selection?.quantity || 1}
                onChange={(event) =>
                  onChange(
                    selected.map((item) =>
                      cartRowKey(item) === key
                        ? { ...item, quantity: Number(event.target.value) }
                        : item,
                    ),
                  )
                }
              >
                {Array.from({ length: row.quantity }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}
