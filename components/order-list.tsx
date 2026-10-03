'use client';
import { useEffect, useState } from 'react';
import {
  Package,
  ArrowRight,
  ArrowLeft,
  Download,
  FileText,
  Truck,
  CreditCard,
  MessageCircle,
  MapPin,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { products, money } from '@/lib/products';
import { previewTotals } from '@/lib/checkout-pricing.mjs';
import { sitePath } from '@/lib/site-path';
import {
  addressText,
  refreshExampleOrder,
  type DemoOrder,
  type OrderRow,
  type ReturnRequest,
  type ReturnSelection,
} from '@/lib/demo-orders';
import {
  canCancelOrder,
  canRequestReturn,
  orderLabel,
  returnReasons,
  availableOrderRows,
  getReturnRequests,
  validateOrderItems,
} from '@/lib/order-lifecycle.mjs';
import { cartRowKey } from '@/lib/cart.mjs';
import OrderProducts from './order-products';
import OrderItemSelection from './order-item-selection';
import OrderProgress from './order-progress';
import OrderReturnStatus from './order-return-status';
import OrderActionConfirmation, { type OrderAction } from './order-action-confirmation';
import './order-tracking.css';

function downloadSummary(order: DemoOrder) {
  const totals = previewTotals(order.rows, products, order.coupon);
  const requests: ReturnRequest[] = getReturnRequests(order);
  const escape = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
    );
  const rows = order.rows
    .map((row) => {
      const p = products.find((p) => p.id === row.id)!;
      const cancelled =
        order.cancelledRows?.find((item) => cartRowKey(item) === cartRowKey(row))?.quantity || 0;
      const requested = requests
        .filter((request) => request.status !== 'rejected')
        .flatMap((request) => request.items)
        .filter((item) => cartRowKey(item) === cartRowKey(row))
        .reduce((sum, item) => sum + item.quantity, 0);
      return `<tr><td>${escape(p.name)}${cancelled ? `<br>${cancelled} adet iptal edildi` : ''}${requested ? `<br>${requested} adet için iade kaydı` : ''}</td><td>${escape(row.color || p.colors[0].name)}</td><td>${escape(row.size)}</td><td>${row.quantity}</td><td>${escape(money(p.price))}</td><td>${escape(money(p.price * row.quantity))}</td></tr>`;
    })
    .join('');
  const html = `<!doctype html><html lang="tr"><meta charset="utf-8"><title>${escape(order.id)} · mos’so sipariş belgesi</title><style>body{font:15px Arial,sans-serif;color:#28212d;max-width:960px;margin:50px auto;padding:24px}h1{color:#792b87;font-size:42px}table{width:100%;border-collapse:collapse;margin:32px 0}th,td{text-align:left;padding:12px;border-bottom:1px solid #ddd}aside{padding:16px;background:#f5eff7;line-height:1.7}small{color:#666}@media print{body{margin:0}aside{border:1px solid #aaa}}</style><h1>mos’so</h1><p>Modern Original Style ' Stand Out</p><h2>Sipariş özeti</h2><p>Sipariş: ${escape(order.id)}<br>Tarih: ${escape(new Date(order.date).toLocaleString('tr-TR'))}<br>Durum: ${escape(orderLabel(order.status))}</p><table><thead><tr><th>Ürün</th><th>Renk</th><th>Beden</th><th>Adet</th><th>Birim fiyat</th><th>Satır toplamı</th></tr></thead><tbody>${rows}</tbody></table><p>Ürünler toplamı: <strong>${escape(money(totals.originalTotal))}</strong><br>Ürün indirimi: ${escape(money(totals.productDiscount))}<br>Kupon indirimi: ${escape(money(totals.discount))}<br>KDV hariç tutar: ${escape(money(totals.netTotal))}<br>KDV (%${totals.vatRate}): ${escape(money(totals.vat))}<br>Genel toplam (KDV dahil): <strong>${escape(money(totals.total))}</strong><br>Ödeme yöntemi: ${escape(order.paymentMethod || 'Kredi Kartı')}<br>Kargo: 0 TL</p><small>Bu belgeyi PDF olarak kaydedebilirsin.</small></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${order.id}-siparis-ozeti.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function OrderList({
  orders,
  onCancel,
  onReturn,
  onExamples,
  onShop,
}: {
  orders: DemoOrder[];
  onCancel: (id: string, items: OrderRow[]) => void;
  onReturn: (id: string, selection: ReturnSelection) => void;
  onExamples: () => void;
  onShop: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<'cancel' | 'return' | null>(null);
  const [selectedItems, setSelectedItems] = useState<OrderRow[]>([]);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [returnCategory, setReturnCategory] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [newReturnId, setNewReturnId] = useState<string | null>(null);
  const [newReturnCount, setNewReturnCount] = useState(0);
  const [confirmation, setConfirmation] = useState<OrderAction | null>(null);
  useEffect(() => {
    const sync = () => setSelected(new URLSearchParams(location.search).get('siparis'));
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  useEffect(() => {
    setActionMode(null);
    setSelectedItems([]);
    setReturnCategory('');
    setReturnDescription('');
    setNewReturnId(null);
    setNewReturnCount(0);
    setConfirmation(null);
    setTrackingOpen(false);
  }, [selected]);
  const selectedOrder = orders.find((o) => o.id === selected);
  const detail = selectedOrder ? refreshExampleOrder(selectedOrder) : undefined;
  const detailTotals = detail ? previewTotals(detail.rows, products, detail.coupon) : null;
  const returnRequests: ReturnRequest[] = detail ? getReturnRequests(detail) : [];
  const availableRows: OrderRow[] = detail ? availableOrderRows(detail) : [];
  const cancelledCount = detail?.cancelledRows?.reduce((sum, row) => sum + row.quantity, 0) || 0;
  const remainingRows =
    detail?.rows
      .map((row) => ({
        ...row,
        quantity:
          row.quantity -
          (detail.cancelledRows?.find((item) => cartRowKey(item) === cartRowKey(row))?.quantity ||
            0),
      }))
      .filter((row) => row.quantity > 0) || [];
  const remainingTotal = detail ? previewTotals(remainingRows, products, detail.coupon).total : 0;
  if (selected && !detail)
    return (
      <div className="account-empty">
        <Package size={40} />
        <h3>Sipariş bulunamadı.</h3>
        <p>Sipariş kayıtları yalnızca oluşturuldukları tarayıcı oturumunda tutulur.</p>
        <a className="text-link" href={sitePath('/siparislerim/')}>
          Sipariş listesine dön
        </a>
      </div>
    );
  if (detail)
    return (
      <div className="order-detail">
        <a className="text-link order-back" href={sitePath('/siparislerim/')}>
          <ArrowLeft size={16} /> Tüm siparişler
        </a>
        <header className="order-detail-heading">
          <div>
            <p className="eyebrow">SİPARİŞ DETAYI</p>
            <h2>{detail.id}</h2>
            <p>
              {new Date(detail.date).toLocaleString('tr-TR')} ·{' '}
              {detail.rows.reduce((n, r) => n + r.quantity, 0)} ürün
            </p>
          </div>
          <div className="order-heading-status">
            <span className="order-status">{orderLabel(detail.status)}</span>
            <p>
              {
                {
                  pending: 'Siparişini kontrol ediyoruz.',
                  received: 'Seçimlerin bize ulaştı, sırada özenle hazırlamak var.',
                  preparing: 'Seçimlerin senin için özenle hazırlanıyor.',
                  shipped: 'Siparişin yola çıktı, yeni favorilerin sana geliyor.',
                  delivered: 'Güle güle kullan, yeni favorilerinle güzel günlere!',
                  cancelled: 'Siparişin iptal edildi.',
                }[detail.status]
              }
            </p>
          </div>
        </header>
        <OrderProgress status={detail.status} />
        {cancelledCount > 0 && (
          <p className="order-partial-status">
            {cancelledCount} adet iptal edildi
            {detail.status !== 'cancelled' && ' · Diğer ürünlerinin sipariş süreci devam ediyor.'}
          </p>
        )}
        <div className="order-detail-layout">
          <section>
            <h3>Siparişindeki parçalar</h3>
            <OrderProducts rows={detail.rows} order={detail} />
            <div className="order-product-actions">
              <div className="order-action-buttons">
                <button
                  className="order-secondary-action"
                  disabled={!canCancelOrder(detail)}
                  onClick={() => {
                    setSelectedItems([]);
                    setActionMode(actionMode === 'cancel' ? null : 'cancel');
                  }}
                  aria-expanded={actionMode === 'cancel'}
                  aria-controls="order-action-form"
                >
                  Ürün iptal et
                </button>
                <button
                  className="order-secondary-action"
                  disabled={!canRequestReturn(detail)}
                  onClick={() => {
                    setSelectedItems([]);
                    setActionMode(actionMode === 'return' ? null : 'return');
                  }}
                  aria-expanded={actionMode === 'return'}
                  aria-controls="order-action-form"
                >
                  <RotateCcw size={14} /> İade talebi oluştur
                </button>
              </div>
              <p>
                {detail.status === 'cancelled'
                  ? 'Bu sipariş iptal edildi.'
                  : !availableRows.length && returnRequests.length
                    ? 'İade talebini aşağıdaki iade sürecinden takip edebilirsin.'
                    : canCancelOrder(detail)
                      ? 'Hazırlık başlamadan seçtiğin ürünleri iptal edebilirsin.'
                      : 'Hazırlık aşamasından itibaren iptal kapalıdır.'}
              </p>
            </div>
            {actionMode &&
              (actionMode === 'cancel' ? canCancelOrder(detail) : canRequestReturn(detail)) && (
                <form
                  id="order-action-form"
                  className="order-return-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const items = validateOrderItems(detail, selectedItems);
                    if (!items.length) return;
                    setConfirmation(
                      actionMode === 'cancel'
                        ? { kind: 'cancel', id: detail.id, items }
                        : {
                            kind: 'return',
                            id: detail.id,
                            selection: {
                              category: returnCategory,
                              description: returnDescription,
                              items,
                            },
                          },
                    );
                  }}
                >
                  <OrderItemSelection
                    rows={availableRows}
                    selected={selectedItems}
                    onChange={setSelectedItems}
                  />
                  {actionMode === 'return' && (
                    <>
                      <label htmlFor="return-category">
                        İade nedeni
                        <select
                          id="return-category"
                          aria-label="İade nedeni"
                          required
                          value={returnCategory}
                          onChange={(event) => setReturnCategory(event.target.value)}
                        >
                          <option value="" disabled>
                            Bir neden seç
                          </option>
                          {returnReasons.map((reason) => (
                            <option value={reason.key} key={reason.key}>
                              {reason.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label htmlFor="return-description">
                        Ek açıklama <span className="return-optional">İsteğe bağlı</span>
                        <textarea
                          id="return-description"
                          maxLength={1000}
                          rows={3}
                          value={returnDescription}
                          onChange={(event) => setReturnDescription(event.target.value)}
                          aria-describedby="return-description-count"
                          placeholder="İstersen ürünle ilgili ayrıntıları burada paylaşabilirsin."
                        />
                      </label>
                      <small id="return-description-count" className="return-description-count">
                        {returnDescription.length} / 1000 karakter
                      </small>
                      <p>
                        Bu talep iadenin tamamlandığı anlamına gelmez. Ürün mağazaya ulaşıp
                        incelendikten ve onaylandıktan sonra ödeme iadesi aşamasına geçer.
                      </p>
                    </>
                  )}
                  <button
                    className="primary"
                    type="submit"
                    disabled={!selectedItems.length || (actionMode === 'return' && !returnCategory)}
                  >
                    {actionMode === 'return' ? 'İade talebini gönder' : 'Seçilen ürünleri iptal et'}
                  </button>
                </form>
              )}
            <div className="order-info-grid">
              <section className="order-shipment">
                <h3>
                  <Truck size={20} /> Kargo bilgileri
                </h3>
                <dl>
                  <div>
                    <dt>Kargo firması</dt>
                    <dd>{detail.shipment?.carrier || 'Henüz atanmadı'}</dd>
                  </div>
                  <div>
                    <dt>Takip numarası</dt>
                    <dd>{detail.shipment?.trackingNumber || 'Henüz oluşmadı'}</dd>
                  </div>
                </dl>
                <button
                  className="text-link"
                  disabled={!detail.shipment?.trackingNumber || detail.status === 'cancelled'}
                  onClick={() => setTrackingOpen(!trackingOpen)}
                  aria-expanded={trackingOpen}
                >
                  Kargom nerede? <ExternalLink size={16} />
                </button>
                {trackingOpen && (
                  <p className="shipment-preview" role="status">
                    {detail.status === 'delivered'
                      ? 'Ürün teslim edildi.'
                      : 'Ürün teslimat yolunda.'}
                  </p>
                )}
                {!detail.shipment?.trackingNumber && detail.status !== 'cancelled' && (
                  <small>Kargoya verildiğinde takip numarası burada görünecek.</small>
                )}
              </section>
              <section>
                <h3>
                  <MapPin size={19} /> Teslimat adresi
                </h3>
                <address className="order-address">
                  {addressText(detail.deliveryAddress) || 'Teslimat adresi bulunmuyor.'}
                </address>
                {detail.deliveryAddress?.phone && <p>{detail.deliveryAddress.phone}</p>}
                <small>Sipariş oluşturulurken seçilen adres.</small>
              </section>
              <section>
                <h3>
                  <FileText size={19} /> Fatura adresi
                </h3>
                <address className="order-address">
                  {detail.billingAddress || 'Fatura adresi bulunmuyor.'}
                </address>
              </section>
            </div>
          </section>
          <aside className="order-detail-side">
            <section className="order-total-panel">
              <h3>Tutar özeti</h3>
              <div className="checkout-totals">
                <p>
                  <span>Ürünler</span>
                  <strong>{money(detailTotals?.originalTotal ?? 0)}</strong>
                </p>
                <p className="checkout-discount">
                  <span>Ürün indirimi</span>
                  <strong>
                    {detailTotals?.productDiscount
                      ? `−${money(detailTotals.productDiscount)}`
                      : money(0)}
                  </strong>
                </p>
                <p className="checkout-discount">
                  <span>Kupon indirimi {detailTotals?.coupon}</span>
                  <strong>
                    {detailTotals?.discount ? `−${money(detailTotals.discount)}` : money(0)}
                  </strong>
                </p>
                <p className="checkout-tax">
                  <span>KDV hariç tutar</span>
                  <span>{money(detailTotals?.netTotal ?? 0)}</span>
                </p>
                <p className="checkout-tax">
                  <span>KDV (%{detailTotals?.vatRate})</span>
                  <span>{money(detailTotals?.vat ?? 0)}</span>
                </p>
                <p>
                  <span>Kargo</span>
                  <span>0 TL</span>
                </p>
                <p>
                  <strong>
                    Toplam <small>KDV dahil</small>
                  </strong>
                  <strong>{money(detailTotals?.total ?? 0)}</strong>
                </p>
                {cancelledCount > 0 && (
                  <>
                    <p className="checkout-discount">
                      <span>İptal edilen ürünler</span>
                      <strong>−{money((detailTotals?.total || 0) - remainingTotal)}</strong>
                    </p>
                    <p>
                      <strong>İptal sonrası tutar</strong>
                      <strong>{money(remainingTotal)}</strong>
                    </p>
                  </>
                )}
              </div>
              <div className="order-payment-info">
                <p>
                  <span>
                    <CreditCard size={16} /> Ödeme yöntemi
                  </span>
                  <strong>{detail.paymentMethod || 'Kredi Kartı'}</strong>
                </p>
              </div>
            </section>
            <section className="order-documents">
              <h3>
                <FileText size={19} /> Fatura & belgeler
              </h3>
              <button disabled className="document-disabled">
                Fatura henüz mevcut değil
              </button>
              <button className="text-link" onClick={() => downloadSummary(detail)}>
                <Download size={16} /> Sipariş belgesini indir
              </button>
              <small>Belgeyi PDF olarak kaydedebilirsin.</small>
            </section>
          </aside>
        </div>
        {confirmation && (
          <OrderActionConfirmation
            action={confirmation}
            onDismiss={() => setConfirmation(null)}
            onConfirm={() => {
              const order = orders.find((order) => order.id === confirmation.id);
              setConfirmation(null);
              if (!order || order.id !== selected) return;
              if (confirmation.kind === 'cancel') {
                if (!canCancelOrder(order) || !validateOrderItems(order, confirmation.items).length)
                  return;
                onCancel(order.id, confirmation.items);
              } else if (
                canRequestReturn(order) &&
                validateOrderItems(order, confirmation.selection.items).length
              ) {
                setNewReturnId(order.id);
                setNewReturnCount(getReturnRequests(order).length + 1);
                onReturn(order.id, confirmation.selection);
                setReturnCategory('');
                setReturnDescription('');
              } else return;
              setActionMode(null);
              setSelectedItems([]);
            }}
          />
        )}
        {returnRequests.map((request, index) => (
          <OrderReturnStatus
            key={request.id || `${request.requestedAt}-${index}`}
            request={request}
            headingId={`return-title-${index}`}
            reveal={newReturnId === detail.id && index === newReturnCount - 1}
          />
        ))}
        <div className="order-help">
          <div>
            <MessageCircle size={22} />
            <h3>Bir konuda yardımcı olalım mı?</h3>
            <p>Ürün ve mağaza soruların için bize ulaşabilirsin.</p>
            <a
              href="https://wa.me/905327904880"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              WhatsApp’tan yaz <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    );
  if (!orders.length)
    return (
      <div className="account-empty">
        <Package size={40} />
        <h3>İlk seçiminle başlayacak.</h3>
        <p>Henüz siparişin yok. Alışverişini tamamladığında ürünlerini burada görebilirsin.</p>
        <div className="order-empty-actions">
          <button className="primary" onClick={onShop}>
            Alışverişe dön <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  return (
    <div className="order-list">
      <p className="checkout-note">{orders.length} sipariş</p>
      {orders.map((order) => (
        <a
          className="order-entry order-entry-link"
          href={sitePath(`/siparislerim/?siparis=${encodeURIComponent(order.id)}`)}
          key={order.id}
          aria-label={`${order.id} sipariş detayını aç`}
        >
          <header>
            <div>
              <small>{new Date(order.date).toLocaleDateString('tr-TR')}</small>
              <h3>{order.id}</h3>
            </div>
            <span className="order-status">{orderLabel(order.status)}</span>
            <strong>{money(previewTotals(order.rows, products, order.coupon).total)}</strong>
          </header>
          <OrderProducts rows={order.rows} order={order} />
          <footer>
            <span>{order.rows.reduce((n, r) => n + r.quantity, 0)} ürün · Ödeme simülasyonu</span>
            <span>
              Sipariş detayı & belgeler <ArrowRight size={17} />
            </span>
          </footer>
        </a>
      ))}
    </div>
  );
}
