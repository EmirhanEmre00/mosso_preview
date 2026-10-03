'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  ShoppingBag,
  Truck,
  FileText,
  TicketPercent,
  ShieldCheck,
  ChevronDown,
  LockKeyhole,
  X,
} from 'lucide-react';
import { products, money } from '@/lib/products';
import { previewTotals } from '@/lib/checkout-pricing.mjs';
import { addressText, type OrderRow, type CheckoutSelection } from '@/lib/demo-orders';
import OrderProducts from './order-products';
import PaymentMethods from './payment-methods';
import type { Address } from './account-panel';
import PhoneInput from './phone-input';
import LocationFields from './location-fields';
import { validAddress } from '@/lib/contact-validation.mjs';
import './checkout-mobile.css';
export default function CheckoutPage({
  cart,
  signedIn,
  onLogin,
  onBack,
  onComplete,
  onOrders,
  addresses,
  setAddresses,
  onCartChange,
}: {
  cart: OrderRow[];
  signedIn: boolean;
  onLogin: () => void;
  onBack: () => void;
  onComplete: (selection: CheckoutSelection) => string;
  onOrders: () => void;
  addresses: Address[];
  setAddresses: (addresses: Address[]) => void;
  onCartChange: (cart: OrderRow[]) => void;
}) {
  const [delivery, setDelivery] = useState({
    name: addresses[0]?.name ?? '',
    email: '',
    phone: addresses[0]?.phone ?? '',
    city: addresses[0]?.city ?? '',
    district: addresses[0]?.district ?? '',
    address: addresses[0]?.address ?? '',
    note: '',
  });
  const [selectedAddress, setSelectedAddress] = useState<number | null>(addresses[0]?.id ?? null);
  const [editingAddress, setEditingAddress] = useState(addresses.length === 0);
  const [addressTitle, setAddressTitle] = useState(addresses[0]?.title ?? '');
  const addressEditor = useRef<HTMLDivElement>(null);
  const chooseAddress = (address: Address) => {
    setSelectedAddress(address.id);
    setAddressTitle(address.title);
    setDelivery((current) => ({ ...current, ...address }));
    setEditingAddress(false);
    setError('');
  };
  const [sameBilling, setSameBilling] = useState(true);
  const [billingId, setBillingId] = useState<number | null>(null);
  const billingAddress = addresses.find((address) => address.id === billingId);
  const [scenario, setScenario] = useState('success');
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState('');
  const [productsOpen, setProductsOpen] = useState(false);
  const submitPanel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const panel = submitPanel.current;
    if (!panel) return;
    const updateHeight = () => {
      document.documentElement.style.setProperty(
        '--checkout-dock-height',
        `${panel.getBoundingClientRect().height}px`,
      );
    };
    const observer = new ResizeObserver(updateHeight);
    observer.observe(panel);
    updateHeight();
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--checkout-dock-height');
    };
  }, [signedIn, completed, cart.length]);
  const completionSection = useRef<HTMLElement>(null);
  const completionHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!completed) return;
    const frame = requestAnimationFrame(() => {
      completionSection.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
      completionHeading.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [completed]);
  const [paymentMethod, setPaymentMethod] = useState('Kredi Kartı');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [couponError, setCouponError] = useState(false);
  const submitting = useRef(false);
  const totals = previewTotals(cart, products, coupon);
  const applyCoupon = () => {
    const applied = previewTotals(cart, products, couponInput).coupon;
    setCouponError(!applied);
    if (!applied) {
      setCouponMessage('Bu kod önizlemede geçerli değil. MOSSO10 kodunu deneyebilirsin.');
      return;
    }
    setCoupon(applied);
    setCouponInput('');
    setCouponMessage('MOSSO10 uygulandı · %10 örnek indirim.');
  };
  if (completed)
    return (
      <section ref={completionSection} className="wrap checkout-page checkout-complete">
        <Check size={42} />
        <p className="eyebrow">ÖNİZLEME TAMAMLANDI</p>
        <h1 ref={completionHeading} tabIndex={-1}>
          Siparişiniz alındı.
        </h1>
        <p>
          Deneme siparişin: <strong>{completed}</strong>
        </p>
        <p>
          Ödeme alınmadı; ürünler gönderilmeyecek. Sipariş yalnızca bu tarayıcı oturumunda tutulur.
        </p>
        <button className="primary" onClick={onOrders}>
          Siparişlerime git <ArrowRight size={18} />
        </button>
      </section>
    );
  if (!cart.length)
    return (
      <section className="wrap checkout-page checkout-complete">
        <ShoppingBag size={40} />
        <h1>Sepetin henüz boş.</h1>
        <button className="primary" onClick={onBack}>
          Koleksiyona dön
        </button>
      </section>
    );
  return (
    <section className="wrap checkout-page">
      <p className="eyebrow">MOS’SO / ALIŞVERİŞ</p>
      <h1>Seçimlerini tamamla.</h1>
      <p className="checkout-note">
        Deneme alışverişi · Gerçek ödeme alınmaz. Sipariş adresleri yalnızca bu tarayıcı oturumunda
        saklanır, sunucuya gönderilmez.
      </p>
      {!signedIn ? (
        <div className="checkout-login">
          <h2>Önce hesabına geç.</h2>
          <p>Siparişini aynı önizleme oturumunda takip edebilmek için giriş yap.</p>
          <button className="primary" onClick={onLogin}>
            Giriş yap ve devam et <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <form
          className="checkout-layout checkout-continuous"
          onSubmit={(e) => {
            e.preventDefault();
            if (submitting.current) return;
            if (editingAddress || selectedAddress === null) {
              setError('Devam etmek için teslimat adresini kaydet veya kayıtlı bir adres seç.');
              addressEditor.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              return;
            }
            if (scenario === 'failure') {
              setError(
                'Deneme ödemesi başarısız. Sipariş oluşturulmadı ve sepetin korundu. Ödeme bölümünden başarılı senaryoyu seçerek tekrar deneyebilirsin.',
              );
              return;
            }
            if (!validAddress({ ...delivery, title: addressTitle })) {
              setError('Teslimat adresini düzenleyerek telefonunu ve il/ilçe seçimini kontrol et.');
              return;
            }
            if (!sameBilling && (!billingAddress || !validAddress(billingAddress))) {
              setError('Fatura için kayıtlı ve geçerli bir adres seç.');
              return;
            }
            submitting.current = true;
            const deliveryAddress = {
              name: delivery.name,
              phone: delivery.phone,
              city: delivery.city,
              district: delivery.district,
              address: delivery.address,
            };
            const id = onComplete({
              coupon: totals.coupon,
              paymentMethod,
              deliveryAddress,
              billingAddress: sameBilling
                ? addressText(deliveryAddress)
                : addressText(billingAddress!),
            });
            if (id) {
              setCompleted(id);
              setDelivery({
                name: '',
                email: '',
                phone: '',
                city: '',
                district: '',
                address: '',
                note: '',
              });
              setBillingId(null);
            } else {
              submitting.current = false;
              setError('Sepetin boş veya geçersiz. Sepetini yeniden kontrol et.');
            }
          }}
        >
          <div className="checkout-main">
            <section className="checkout-section" aria-labelledby="checkout-products-title">
              <div className="checkout-products-heading">
                <h2 id="checkout-products-title">
                  Sepetindeki ürünler{' '}
                  <small>({cart.reduce((n, r) => n + r.quantity, 0)} ürün)</small>
                </h2>
                <button
                  type="button"
                  className="checkout-products-toggle"
                  aria-label={
                    productsOpen ? 'Sepetteki ürünleri gizle' : 'Sepetteki ürünleri göster'
                  }
                  aria-expanded={productsOpen}
                  aria-controls="checkout-products-list"
                  onClick={() => setProductsOpen((open) => !open)}
                >
                  <ChevronDown size={18} />
                </button>
              </div>
              <div id="checkout-products-list" data-expanded={productsOpen}>
                <OrderProducts rows={cart} onChange={onCartChange} />
              </div>
            </section>
            <section className="checkout-section" aria-labelledby="delivery-title">
              <div className="checkout-section-title">
                <span>01</span>
                <div>
                  <h2 id="delivery-title">İletişim & teslimat</h2>
                  <p>Ürünlerin sana ulaşacağı adres.</p>
                </div>
              </div>
              <div
                className="checkout-address-options"
                role="group"
                aria-label="Teslimat adresi seç"
              >
                {addresses.map((address) => (
                  <div
                    className="checkout-address-option"
                    key={address.id}
                    data-selected={selectedAddress === address.id && !editingAddress}
                  >
                    <label>
                      <input
                        type="radio"
                        name="delivery-address"
                        checked={selectedAddress === address.id && !editingAddress}
                        onChange={() => chooseAddress(address)}
                      />
                      <span>
                        <strong>{address.title}</strong>
                        <span>
                          {address.name} · {address.phone}
                        </span>
                        <span>{address.address}</span>
                        <span>
                          {address.district} / {address.city}
                        </span>
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => {
                        chooseAddress(address);
                        setEditingAddress(true);
                      }}
                    >
                      Düzenle
                    </button>
                  </div>
                ))}
              </div>
              {!editingAddress && (
                <button
                  type="button"
                  className="text-link checkout-new-address"
                  onClick={() => {
                    setSelectedAddress(null);
                    setAddressTitle('');
                    setDelivery({
                      name: '',
                      email: '',
                      phone: '',
                      city: '',
                      district: '',
                      address: '',
                      note: '',
                    });
                    setEditingAddress(true);
                  }}
                >
                  + Yeni adres ekle
                </button>
              )}
              {editingAddress && (
                <div ref={addressEditor} className="account-form account-form-grid">
                  <label className="account-wide">
                    Adres başlığı
                    <input
                      required
                      maxLength={100}
                      value={addressTitle}
                      placeholder="Ev / İş"
                      onChange={(e) => setAddressTitle(e.target.value)}
                    />
                  </label>
                  {([{ key: 'name', label: 'Ad soyad', auto: 'name' }] as const).map(
                    ({ key, label, auto }) => (
                      <label key={key}>
                        {label}
                        <input
                          required
                          type="text"
                          autoComplete={auto}
                          maxLength={120}
                          value={delivery[key]}
                          onChange={(e) => setDelivery({ ...delivery, [key]: e.target.value })}
                        />
                      </label>
                    ),
                  )}
                  <label>
                    Telefon
                    <PhoneInput
                      required
                      value={delivery.phone}
                      onValueChange={(phone) => setDelivery({ ...delivery, phone })}
                    />
                  </label>
                  <LocationFields
                    city={delivery.city}
                    district={delivery.district}
                    onChange={(location) => setDelivery({ ...delivery, ...location })}
                  />
                  <label className="account-wide">
                    Açık adres
                    <textarea
                      required
                      rows={3}
                      autoComplete="street-address"
                      maxLength={500}
                      placeholder="Mahalle, sokak, bina ve daire numarası"
                      value={delivery.address}
                      onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                    />
                  </label>
                  <label className="account-wide">
                    Teslimat notu <small>(isteğe bağlı)</small>
                    <textarea
                      rows={2}
                      maxLength={300}
                      placeholder="Teslimat için eklemek istediğin bir bilgi"
                      value={delivery.note}
                      onChange={(e) => setDelivery({ ...delivery, note: e.target.value })}
                    />
                  </label>
                  <div className="account-wide account-form-actions">
                    <button
                      type="button"
                      className="primary"
                      onClick={() => {
                        const fields = addressEditor.current?.querySelectorAll<
                          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                        >('input, textarea, select');
                        if (!fields || Array.from(fields).some((field) => !field.reportValidity()))
                          return;
                        const entry: Address = {
                          id: selectedAddress ?? Date.now(),
                          title: addressTitle.trim(),
                          name: delivery.name.trim(),
                          phone: delivery.phone.trim(),
                          city: delivery.city.trim(),
                          district: delivery.district.trim(),
                          address: delivery.address.trim(),
                        };
                        if (!validAddress(entry)) {
                          setError('Adresini, telefon numaranı ve il/ilçe seçimini kontrol et.');
                          return;
                        }
                        setAddresses(
                          selectedAddress === null
                            ? [...addresses, entry]
                            : addresses.map((a) => (a.id === selectedAddress ? entry : a)),
                        );
                        chooseAddress(entry);
                      }}
                    >
                      Adresi kaydet ve seç
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          chooseAddress(
                            addresses.find((a) => a.id === selectedAddress) ?? addresses[0],
                          )
                        }
                      >
                        Vazgeç
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="checkout-service">
                <Truck size={22} />
                <div>
                  <strong>Standart teslimat · Önizleme</strong>
                  <p>
                    Kargo: 0 TL (örnek). Canlı kargo ücreti ve teslimat süresi henüz belirlenmedi.
                  </p>
                </div>
              </div>
            </section>
            <section className="checkout-section" aria-labelledby="billing-title">
              <div className="checkout-section-title">
                <span>02</span>
                <div>
                  <h2 id="billing-title">Fatura bilgileri</h2>
                  <p>Bireysel fatura adresi.</p>
                </div>
              </div>
              <label className="checkout-consent">
                <input
                  type="checkbox"
                  checked={sameBilling}
                  onChange={(e) => setSameBilling(e.target.checked)}
                />{' '}
                Fatura adresim teslimat adresimle aynı.
              </label>
              {!sameBilling && (
                <div className="account-form">
                  <label>
                    Fatura adresi
                    <select
                      aria-label="Fatura adresi"
                      required
                      value={billingId ?? ''}
                      onChange={(e) => setBillingId(Number(e.target.value))}
                    >
                      <option value="" disabled>
                        Kayıtlı adres seç
                      </option>
                      {addresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.title} · {address.district} / {address.city}
                        </option>
                      ))}
                    </select>
                  </label>
                  {billingAddress && (
                    <p className="checkout-billing-address">{addressText(billingAddress)}</p>
                  )}
                  <small>
                    Yeni bir adres için yukarıdaki teslimat bölümünden adres ekleyebilirsin.
                  </small>
                </div>
              )}
              <p className="checkout-note">
                Bu denemede resmi fatura düzenlenmez. Kimlik veya vergi numarası istenmez.
              </p>
            </section>
            <section className="checkout-section checkout-payment" aria-labelledby="payment-title">
              <div className="checkout-section-title">
                <span>03</span>
                <div>
                  <h2 id="payment-title">Ödeme</h2>
                  <p>Toplamı kontrol et, denemeyi tamamla.</p>
                </div>
              </div>
              <PaymentMethods
                value={paymentMethod}
                onChange={(method) => {
                  setPaymentMethod(method);
                  setError('');
                }}
              />
              <fieldset>
                <legend>Önizleme senaryosu</legend>
                <label>
                  <input
                    type="radio"
                    name="payment-scenario"
                    checked={scenario === 'success'}
                    onChange={() => {
                      setScenario('success');
                      setError('');
                    }}
                  />{' '}
                  Başarılı ödeme senaryosu
                </label>
                <label>
                  <input
                    type="radio"
                    name="payment-scenario"
                    checked={scenario === 'failure'}
                    onChange={() => setScenario('failure')}
                  />{' '}
                  Başarısız ödeme senaryosu
                </label>
              </fieldset>
            </section>
            <section
              className="checkout-section checkout-contracts"
              aria-labelledby="contracts-title"
            >
              <div className="checkout-section-title">
                <span>04</span>
                <div>
                  <h2 id="contracts-title">Bilgilendirme & onaylar</h2>
                  <p>Son kontrolden önce okuyabileceğin belgeler.</p>
                </div>
              </div>
              <div className="contract-documents">
                <article id="pre-info">
                  <FileText size={20} />
                  <div>
                    <h3>Ön bilgilendirme — önizleme</h3>
                    <p>
                      Ürün, renk, beden, adet ve örnek toplam sipariş özetinde gösterilir. Bu
                      denemede tahsilat veya teslimat yapılmaz. Satıcı bilgileri, gerçek kargo
                      ücretleri ve teslimat koşulları canlı satıştan önce tamamlanacak.
                    </p>
                  </div>
                </article>
                <article id="distance-contract">
                  <FileText size={20} />
                  <div>
                    <h3>Mesafeli satış sözleşmesi — taslak alanı</h3>
                    <p>
                      Henüz gerçek bir sözleşme sunulmuyor. Satıcı ve alıcı bilgilerini, ödeme,
                      teslimat, cayma ve iade koşullarını içeren nihai metin satış başlamadan önce
                      eklenecek. Bu alan yalnızca onay akışını gösterir.
                    </p>
                  </div>
                </article>
                <article id="privacy-info">
                  <FileText size={20} />
                  <div>
                    <h3>Kişisel veriler — önizleme açıklaması</h3>
                    <p>
                      Bu formdaki iletişim ve adres bilgileri sunucuya gönderilmez. Deneme
                      siparişinin ürünleri, adresleri, tarih ve numarası bu sekmenin oturumunda
                      tutulur. Kart bilgileri saklanmaz. Canlı sistemin aydınlatma metni ayrıca
                      hazırlanacak.
                    </p>
                  </div>
                </article>
              </div>
            </section>
          </div>
          <aside className="checkout-summary">
            <h2>
              Sipariş özeti <small>({cart.reduce((n, r) => n + r.quantity, 0)} ürün)</small>
            </h2>
            <div className="checkout-totals">
              <p>
                <span>Ürünler toplamı</span>
                <strong>{money(totals.originalTotal)}</strong>
              </p>
              <p className="checkout-discount">
                <span>Ürün indirimi</span>
                <strong>
                  {totals.productDiscount ? `−${money(totals.productDiscount)}` : money(0)}
                </strong>
              </p>
              <p className="checkout-discount">
                <span>Kupon indirimi {coupon && `(%10)`}</span>
                <strong>{totals.discount ? `−${money(totals.discount)}` : money(0)}</strong>
              </p>
              <p className="checkout-tax">
                <span>KDV hariç tutar</span>
                <span>{money(totals.netTotal)}</span>
              </p>
              <p className="checkout-tax">
                <span>KDV (%{totals.vatRate} · örnek)</span>
                <span>{money(totals.vat)}</span>
              </p>
              <p>
                <span>Kargo (önizleme)</span>
                <span>{money(0)}</span>
              </p>
              <p className="checkout-grand-total">
                <strong>
                  Ödenecek tutar <small>KDV dahil · önizleme</small>
                </strong>
                <strong>{money(totals.total)}</strong>
              </p>
            </div>
            <div className="checkout-coupon">
              <label htmlFor="checkout-coupon-code">
                <TicketPercent size={18} aria-hidden="true" /> Kupon kodun var mı?
              </label>
              <div className="checkout-coupon-input">
                <input
                  id="checkout-coupon-code"
                  value={couponInput}
                  maxLength={30}
                  placeholder="Kupon kodunu gir"
                  autoComplete="off"
                  aria-describedby="checkout-coupon-help"
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyCoupon();
                    }
                  }}
                />
                <button type="button" onClick={applyCoupon}>
                  Uygula
                </button>
              </div>
              <small id="checkout-coupon-help">
                Deneme kodu: <strong>MOSSO10</strong> · %10 indirim
              </small>
              {couponMessage && (couponError || !coupon) && (
                <p
                  className={couponError ? 'coupon-feedback coupon-invalid' : 'coupon-feedback'}
                  role="status"
                >
                  {couponMessage}
                </p>
              )}
              {coupon && (
                <div className="applied-coupon">
                  <span>
                    <Check size={14} /> {coupon} · %10 indirim uygulandı
                  </span>
                  <button
                    type="button"
                    aria-label="Kuponu kaldır"
                    onClick={() => {
                      setCoupon('');
                      setCouponMessage('Kupon kaldırıldı.');
                      setCouponError(false);
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>
            <div className="checkout-summary-method">
              <span>Ödeme yöntemi</span>
              <strong>{paymentMethod}</strong>
            </div>
            <div className="checkout-summary-actions">
              <div ref={submitPanel} className="checkout-submit-panel">
                <div className="checkout-consent">
                  <input
                    id="checkout-agreement"
                    type="checkbox"
                    required
                    aria-labelledby="checkout-agreement-text"
                    aria-describedby="checkout-agreement-preview"
                  />
                  <div id="checkout-agreement-text">
                    <a href="#pre-info">
                      <strong>Ön bilgilendirme formu</strong>
                    </a>{' '}
                    ve{' '}
                    <a href="#distance-contract">
                      <strong>mesafeli satış sözleşmesi</strong>
                    </a>
                    <label htmlFor="checkout-agreement">’ni okudum, onaylıyorum.</label>
                  </div>
                </div>
                <p id="checkout-agreement-preview" className="checkout-note">
                  Önizleme · Belgeler taslaktır, gerçek tahsilat 0 TL.
                </p>
                {error && (
                  <p role="alert" className="checkout-error">
                    {error}
                  </p>
                )}
                <div className="checkout-submit-row">
                  <div className="mobile-checkout-total">
                    <span>Ödenecek tutar</span>
                    <strong>{money(totals.total)}</strong>
                    <small>KDV dahil</small>
                  </div>
                  <button className="primary" type="submit">
                    Ödeme yap <LockKeyhole size={18} />
                  </button>
                </div>
              </div>
              <details className="checkout-security">
                <summary>
                  <ShieldCheck size={19} aria-hidden="true" />
                  <span>Güvenli ödeme</span>
                  <ChevronDown size={16} aria-hidden="true" />
                </summary>
                <div>
                  <p>
                    Bu önizlemede gerçek ödeme alınmaz; kart alanları gönderilmez veya saklanmaz.
                  </p>
                  <p>
                    Canlı sürümde ödeme, seçtiğin sağlayıcının güvenli ödeme formuyla yapılacak.
                    Kart bilgilerinin mağaza veritabanına kaydedilmesi planlanmıyor.
                  </p>
                  <small>Canlı ödeme ve güvenlik bağlantıları henüz aktif değil.</small>
                </div>
              </details>
              <button type="button" className="text-link" onClick={onBack}>
                Alışverişe dön
              </button>
            </div>
          </aside>
        </form>
      )}
    </section>
  );
}
