'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
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
import CheckoutRecommendations from './checkout-recommendations';
import PaymentMethods from './payment-methods';
import type { Address } from './account-panel';
import PhoneInput from './phone-input';
import LocationFields from './location-fields';
import AddressTypeSelector, { type AddressType } from './address-type-selector';
import { validAddress, phoneText } from '@/lib/contact-validation.mjs';
import './checkout-mobile.css';
import { sitePath } from '@/lib/site-path';
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
  onCompletionChange,
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
  onCompletionChange: (completed: boolean) => void;
}) {
  const [delivery, setDelivery] = useState({
    name: addresses[0]?.name ?? '',
    email: '',
    phone: addresses[0]?.phone ?? '',
    city: addresses[0]?.city ?? '',
    district: addresses[0]?.district ?? '',
    neighborhood: addresses[0] ? addresses[0].neighborhood : '',
    addressType: (addresses[0]?.addressType ?? 'individual') as AddressType,
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
    setDelivery((current) => ({
      ...current,
      ...address,
      neighborhood: address.neighborhood,
      addressType: address.addressType ?? 'individual',
    }));
    setEditingAddress(false);
    setError('');
  };
  const [sameBilling, setSameBilling] = useState(true);
  const [billingId, setBillingId] = useState<number | null>(null);
  const billingAddress = addresses.find((address) => address.id === billingId);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState('');
  useLayoutEffect(() => {
    onCompletionChange(Boolean(completed));
  }, [completed, onCompletionChange]);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [mobileStep, setMobileStep] = useState<'cart' | 'payment'>('cart');
  const goToMobileStep = (step: 'cart' | 'payment') => {
    setMobileStep(step);
    setSummaryOpen(false);
    setError('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const mobileSummaryToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!summaryOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSummaryOpen(false);
        mobileSummaryToggle.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [summaryOpen]);
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
  const completionHeading = useRef<HTMLHeadingElement>(null);
  const completionSection = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!completed) return;
    let restoringScroll = true;
    let frame = 0;
    const updateTop = () => {
      const section = completionSection.current;
      if (section)
        section.style.setProperty(
          '--checkout-complete-top',
          `${section.getBoundingClientRect().top + window.scrollY}px`,
        );
    };
    const alignCompletion = () => {
      updateTop();
      if (restoringScroll) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    const scheduleAlignment = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(alignCompletion);
    };
    const stopRestoring = () => {
      restoringScroll = false;
      window.removeEventListener('pointerdown', stopRestoring);
      window.removeEventListener('touchstart', stopRestoring);
      window.removeEventListener('wheel', stopRestoring);
      window.removeEventListener('keydown', stopRestoring);
    };
    // Allow the keyboard and restored header to settle without overriding customer scrolling.
    const timeout = window.setTimeout(stopRestoring, 2000);
    window.addEventListener('pointerdown', stopRestoring, { passive: true });
    window.addEventListener('touchstart', stopRestoring, { passive: true });
    window.addEventListener('wheel', stopRestoring, { passive: true });
    window.addEventListener('keydown', stopRestoring);
    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', scheduleAlignment);
    viewport?.addEventListener('scroll', scheduleAlignment);
    const header = document.querySelector('.header');
    const observer = new ResizeObserver(scheduleAlignment);
    if (header) observer.observe(header);
    window.addEventListener('resize', scheduleAlignment);
    completionHeading.current?.focus({ preventScroll: true });
    alignCompletion();
    scheduleAlignment();
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      stopRestoring();
      observer.disconnect();
      window.removeEventListener('resize', scheduleAlignment);
      viewport?.removeEventListener('resize', scheduleAlignment);
      viewport?.removeEventListener('scroll', scheduleAlignment);
    };
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
      setCouponMessage('Bu kupon kodu geçerli değil. Kodunu kontrol edip tekrar dene.');
      return;
    }
    setCoupon(applied);
    setCouponInput('');
    setCouponMessage('MOSSO10 uygulandı · %10 indirim.');
  };
  if (completed)
    return (
      <section ref={completionSection} className="wrap checkout-page checkout-complete">
        <Check size={42} />
        <p className="eyebrow">TEŞEKKÜR EDERİZ</p>
        <h1 ref={completionHeading} tabIndex={-1}>
          Siparişiniz alındı.
        </h1>
        <p>
          Sipariş numaran: <strong>{completed}</strong>
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
    <section className="wrap checkout-page" data-mobile-step={mobileStep}>
      <header className="mobile-checkout-header">
        <div className="mobile-checkout-progress" aria-hidden="true">
          <span style={{ width: mobileStep === 'cart' ? '50%' : '100%' }} />
        </div>
        <button
          type="button"
          aria-label={mobileStep === 'cart' ? 'Alışverişe dön' : 'Sepet özetine dön'}
          onClick={() => (mobileStep === 'cart' ? onBack() : goToMobileStep('cart'))}
        >
          <ArrowLeft size={19} />
        </button>
        <h2>
          {mobileStep === 'cart'
            ? `Sepet Özeti (${cart.reduce((n, r) => n + r.quantity, 0)})`
            : 'Teslimat ve ödeme'}
        </h2>
        <span className="mobile-checkout-brand">mos’so</span>
      </header>
      <p className="eyebrow">MOS’SO / ALIŞVERİŞ</p>
      <h1>Seçimlerini tamamla.</h1>
      {!signedIn ? (
        <div className="checkout-login">
          <h2>Önce hesabına geç.</h2>
          <p>Siparişlerini takip etmek ve kayıtlı adreslerini kullanmak için giriş yap.</p>
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
              neighborhood: delivery.neighborhood,
              addressType: delivery.addressType,
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
              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
              setCompleted(id);
              setDelivery({
                name: '',
                email: '',
                phone: '',
                city: '',
                district: '',
                neighborhood: '',
                addressType: 'individual',
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
            <section
              className="checkout-section checkout-cart-section"
              aria-labelledby="checkout-products-title"
            >
              <div className="checkout-products-heading">
                <h2 id="checkout-products-title">
                  Sepetindeki ürünler{' '}
                  <small>({cart.reduce((n, r) => n + r.quantity, 0)} ürün)</small>
                </h2>
              </div>
              <div id="checkout-products-list">
                <OrderProducts rows={cart} onChange={onCartChange} linkProducts />
              </div>
            </section>
            <section className="mobile-cart-extras" aria-label="Kupon ve öneriler">
              <div className="mobile-cart-coupon">
                <div id="mobile-cart-coupon-fields">
                  <label htmlFor="mobile-cart-coupon-code">
                    <TicketPercent size={15} aria-hidden="true" /> Kupon kodu
                  </label>
                  <div className="checkout-coupon-input">
                    <input
                      id="mobile-cart-coupon-code"
                      value={couponInput}
                      maxLength={30}
                      placeholder="Kupon kodunu gir"
                      onChange={(event) => setCouponInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          applyCoupon();
                        }
                      }}
                    />
                    <button type="button" onClick={applyCoupon}>
                      Uygula
                    </button>
                  </div>
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
              </div>
              <CheckoutRecommendations
                items={products
                  .filter((product) => !cart.some((row) => row.id === product.id))
                  .slice(0, 6)}
              />
            </section>
            <details className="checkout-delivery-products" aria-label="Sepetindeki ürünler">
              <summary>
                <span>Sepetindeki ürünler ({cart.reduce((n, r) => n + r.quantity, 0)})</span>
                <ChevronDown size={16} aria-hidden="true" />
              </summary>
              <div className="checkout-delivery-edit">
                <button type="button" onClick={() => goToMobileStep('cart')}>
                  Sepeti düzenle
                </button>
              </div>
              <ul>
                {cart.map((row, index) => {
                  const product = products.find((item) => item.id === row.id);
                  return product ? (
                    <li key={`${row.id}-${row.size}-${row.color}-${index}`}>
                      <img src={sitePath(product.image)} alt={product.name} />
                      <div>
                        <strong>{product.name}</strong>
                        <span>
                          {row.color || product.colors[0].name} · {row.size} · {row.quantity} adet
                        </span>
                      </div>
                      <strong>{money(product.price * row.quantity)}</strong>
                    </li>
                  ) : null;
                })}
              </ul>
            </details>
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
                        <strong>
                          {address.title} ·{' '}
                          {address.addressType === 'corporate' ? 'Kurumsal' : 'Bireysel'}
                        </strong>
                        <span>
                          {address.name} · {phoneText(address.phone)}
                        </span>
                        <span>
                          {[address.neighborhood, address.address].filter(Boolean).join(', ')}
                        </span>
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
                      neighborhood: '',
                      addressType: 'individual',
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
                  <AddressTypeSelector
                    value={delivery.addressType}
                    onChange={(addressType) => setDelivery({ ...delivery, addressType })}
                  />
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
                    neighborhood={delivery.neighborhood ?? ''}
                    onChange={(location) => setDelivery({ ...delivery, ...location })}
                  />
                  <label className="account-wide">
                    Açık adres
                    <textarea
                      required
                      rows={3}
                      autoComplete="street-address"
                      maxLength={500}
                      placeholder="Sokak, bina ve daire numarası"
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
                          neighborhood: delivery.neighborhood?.trim() ?? '',
                          addressType: delivery.addressType,
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
                  <strong>Standart teslimat</strong>
                  <p>Aras Kargo · Ücretsiz teslimat</p>
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
            </section>
            <section className="checkout-section checkout-payment" aria-labelledby="payment-title">
              <div className="checkout-section-title">
                <span>03</span>
                <div>
                  <h2 id="payment-title">Ödeme</h2>
                  <p>Ödeme yöntemini seç.</p>
                </div>
              </div>
              <PaymentMethods
                value={paymentMethod}
                onChange={(method) => {
                  setPaymentMethod(method);
                  setError('');
                }}
              />
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
                    <h3>Ön bilgilendirme formu</h3>
                    <p>
                      Seçtiğin ürünler, renk, beden ve adet bilgileri yukarıda; indirimler, KDV ve
                      teslimat ücreti sipariş özetinde yer alır. Mağazamız: Hacı Mütahir Mahallesi,
                      İnönü Caddesi, Ereğli / Konya. İletişim: 0532 790 48 80.
                    </p>
                  </div>
                </article>
                <article id="distance-contract">
                  <FileText size={20} />
                  <div>
                    <h3>Mesafeli satış sözleşmesi</h3>
                    <p>
                      Siparişindeki ürünleri, teslimat ve fatura adreslerini, ödeme yöntemini ve
                      toplam tutarı onaylamadan önce kontrol et. Sipariş ve iade taleplerini
                      hesabındaki Siparişlerim bölümünden görüntüleyebilirsin.
                    </p>
                  </div>
                </article>
                <article id="privacy-info">
                  <FileText size={20} />
                  <div>
                    <h3>Kişisel veriler</h3>
                    <p>
                      İletişim bilgilerini ve kayıtlı adreslerini Hesabım bölümünden
                      düzenleyebilirsin. Kart bilgileri kayıtlı adres defterine eklenmez.
                    </p>
                  </div>
                </article>
              </div>
            </section>
          </div>
          <aside className="checkout-summary">
            <div
              id="checkout-summary-details"
              className="checkout-summary-details"
              data-expanded={summaryOpen}
            >
              <div className="checkout-summary-heading">
                <h2>
                  Sipariş özeti <small>({cart.reduce((n, r) => n + r.quantity, 0)} ürün)</small>
                </h2>
                <button
                  className="checkout-summary-toggle"
                  type="button"
                  aria-expanded={summaryOpen}
                  aria-controls="checkout-summary-details"
                  aria-label="Sipariş özetini kapat"
                  onClick={() => setSummaryOpen(false)}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <div className="checkout-totals">
                <div id="checkout-price-breakdown">
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
                    <span>KDV (%{totals.vatRate})</span>
                    <span>{money(totals.vat)}</span>
                  </p>
                  <p>
                    <span>Kargo</span>
                    <span>{money(0)}</span>
                  </p>
                </div>
                <p className="checkout-grand-total">
                  <strong>
                    Ödenecek tutar <small>KDV dahil</small>
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
            </div>
            <div className="checkout-summary-actions">
              <div ref={submitPanel} className="checkout-submit-panel">
                <div className="checkout-dock-heading">
                  <span>
                    <LockKeyhole size={12} aria-hidden="true" /> Siparişini tamamla
                  </span>
                  <details className="checkout-dock-security">
                    <summary>
                      <ShieldCheck size={14} aria-hidden="true" /> Güvenli ödeme{' '}
                      <ChevronDown size={12} aria-hidden="true" />
                    </summary>
                    <p>
                      Kart bilgilerin kaydedilmez. Ödeme öncesinde adresini, seçtiğin ürünleri ve
                      toplam tutarı kontrol edebilirsin.
                    </p>
                  </details>
                </div>
                <div className="checkout-consent">
                  <input
                    id="checkout-agreement"
                    type="checkbox"
                    required
                    aria-labelledby="checkout-agreement-text"
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
                {error && (
                  <p role="alert" className="checkout-error">
                    {error}
                  </p>
                )}
                <div className="checkout-submit-row">
                  <button
                    type="button"
                    className="mobile-checkout-total"
                    ref={mobileSummaryToggle}
                    aria-expanded={summaryOpen}
                    aria-controls="checkout-summary-details"
                    aria-label={summaryOpen ? 'Sipariş özetini gizle' : 'Sipariş özetini göster'}
                    onClick={() => setSummaryOpen((open) => !open)}
                  >
                    <span>
                      Toplam <ChevronDown size={13} aria-hidden="true" />
                    </span>
                    {totals.originalTotal > totals.total && (
                      <del>{money(totals.originalTotal)}</del>
                    )}
                    <strong>{money(totals.total)}</strong>
                    <small>Sipariş özeti</small>
                  </button>
                  <button className="primary" type="submit">
                    Ödeme yap <LockKeyhole size={18} />
                  </button>
                  <button
                    className="primary checkout-mobile-continue"
                    type="button"
                    onClick={() => goToMobileStep('payment')}
                  >
                    Sepeti onayla <ArrowRight size={16} />
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
                    Kart bilgilerin kaydedilmez. Ödeme öncesinde adresini, seçtiğin ürünleri ve
                    toplam tutarı kontrol edebilirsin.
                  </p>
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
