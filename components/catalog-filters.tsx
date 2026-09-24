'use client';
import { useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { catalogColors, catalogSizes } from '@/lib/products';
export type Filters = { size: string; color: string; min: string; max: string; sale: boolean };
export const emptyFilters: Filters = { size: 'Tümü', color: 'Tümü', min: '', max: '', sale: false };
export default function CatalogFilters({
  open,
  close,
  filters,
  update,
  count,
}: {
  open: boolean;
  close: () => void;
  filters: Filters;
  update: (filters: Filters) => void;
  count: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      dialog.current?.close();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  const invalid =
    filters.min !== '' && filters.max !== '' && Number(filters.min) > Number(filters.max);
  return (
    <dialog
      ref={dialog}
      className="filter-dialog"
      aria-labelledby="filter-title"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="filter-shell">
        <header>
          <div>
            <p className="eyebrow">TAM SANA GÖRE</p>
            <h2 id="filter-title">Filtrele</h2>
          </div>
          <button className="icon-button" aria-label="Filtreleri kapat" onClick={close}>
            <X />
          </button>
        </header>
        <div className="filter-content">
          <fieldset>
            <legend>Beden</legend>
            <select
              aria-label="Beden filtresi"
              value={filters.size}
              onChange={(e) => update({ ...filters, size: e.target.value })}
            >
              <option>Tümü</option>
              {catalogSizes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </fieldset>
          <fieldset>
            <legend>Renk</legend>
            <div className="filter-colors">
              {catalogColors.map((c) => (
                <button
                  key={c.name}
                  className={filters.color === c.name ? 'active' : ''}
                  aria-pressed={filters.color === c.name}
                  onClick={() =>
                    update({ ...filters, color: filters.color === c.name ? 'Tümü' : c.name })
                  }
                >
                  <span style={{ background: c.hex }}>
                    {filters.color === c.name && (
                      <Check
                        size={12}
                        color={
                          ['Ekru', 'Lila', 'Mavi', 'Pembe', 'Yeşil', 'Vizon'].includes(c.name)
                            ? '#29222f'
                            : 'white'
                        }
                      />
                    )}
                  </span>
                  {c.name}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Fiyat aralığı</legend>
            <div className="price-inputs">
              <label>
                En az ₺
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100000"
                  aria-label="En düşük fiyat"
                  placeholder="0"
                  value={filters.min}
                  onChange={(e) =>
                    update({ ...filters, min: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) })
                  }
                />
              </label>
              <span>—</span>
              <label>
                En çok ₺
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100000"
                  aria-label="En yüksek fiyat"
                  placeholder="Sınır yok"
                  value={filters.max}
                  onChange={(e) =>
                    update({ ...filters, max: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) })
                  }
                />
              </label>
            </div>
            {invalid && (
              <p role="alert" className="field-error">
                En yüksek fiyat, en düşük fiyattan az olamaz.
              </p>
            )}
            <div className="price-presets">
              {[
                ['500 ₺ altı', '', '500'],
                ['500–1.000 ₺', '500', '1000'],
                ['1.000 ₺ üzeri', '1000', ''],
              ].map(([label, min, max]) => (
                <button key={label} onClick={() => update({ ...filters, min, max })}>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="sale-checkbox">
            <input
              type="checkbox"
              checked={filters.sale}
              onChange={(e) => update({ ...filters, sale: e.target.checked })}
            />
            Sadece indirimli ürünler
          </label>
        </div>
        <div className="filter-footer">
          <button className="text-link" onClick={() => update(emptyFilters)}>
            Temizle
          </button>
          <button className="primary" disabled={invalid} onClick={close}>
            {count} ürünü göster
          </button>
        </div>
      </div>
    </dialog>
  );
}
