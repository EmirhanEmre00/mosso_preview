'use client';
import { sitePath } from '@/lib/site-path';

import { Fragment, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { categories, money, products, type Product } from '@/lib/products';
import { cartTotal, validateCart, cartRowKey } from '@/lib/cart.mjs';
import { previewTotals, paymentMethods } from '@/lib/checkout-pricing.mjs';
import { categoryPath, categoryNavigation, navigationCategories } from '@/lib/categories.mjs';
import { filterCatalog } from '@/lib/catalog.mjs';
import CatalogFilters, { emptyFilters, type Filters } from './catalog-filters';
import StoreFooter from './store-footer';
import ProfileMenu from './profile-menu';
import SupportWidget, { type SupportContact } from './support-widget';
import CheckoutPage from './checkout-page';
import ColorSelector from './color-selector';
import {
  readDemoOrders,
  ORDERS_KEY,
  snapshotAddress,
  exampleOrders,
  type CheckoutSelection,
  type DemoOrder,
} from '@/lib/demo-orders';
import { cancelOrder, requestOrderReturn } from '@/lib/order-lifecycle.mjs';
import AccountPanel, { type AccountSection, type Address } from './account-panel';
const accountRoutes: Record<AccountSection, string> = {
  'Giriş yap / Kayıt ol': '/giris/',
  Hesabım: '/hesabim/',
  Siparişlerim: '/siparislerim/',
  Adreslerim: '/adreslerim/',
};
const SESSION_KEY = 'mosso-demo-session';
const REMEMBER_KEY = 'mosso-demo-remember-until';

type CartRow = { id: string; size: string; color?: string; quantity: number };
type View = 'home' | 'collection' | 'favorites' | 'product' | 'account' | 'checkout';
const STORE_KEY = 'mosso-preview-v1';
const hero = '/images/mosso-editorial.webp';

export default function Storefront({
  initialAccount,
  initialCheckout = false,
}: {
  initialAccount?: AccountSection;
  initialCheckout?: boolean;
}) {
  const [signedIn, setSignedIn] = useState(false);
  const [accountSection, setAccountSection] = useState<AccountSection>(
    initialAccount || 'Giriş yap / Kayıt ol',
  );
  const [view, setView] = useState<View>(
    initialCheckout ? 'checkout' : initialAccount ? 'account' : 'home',
  );
  const [category, setCategory] = useState('Tümü');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [visibleCount, setVisibleCount] = useState(12);
  const [relatedCount, setRelatedCount] = useState(12);
  const relatedEnd = useRef<HTMLDivElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [active, setActive] = useState<Product>(products[0]);
  const [size, setSize] = useState('');
  const [color, setColor] = useState(products[0].colors[0].name);
  const [sizeError, setSizeError] = useState(false);
  const [cart, setCart] = useState<CartRow[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [supportContact, setSupportContact] = useState<SupportContact | null>(null);
  const pendingCheckout = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (
      view !== 'product' ||
      relatedCount >= products.length - 1 ||
      !relatedEnd.current ||
      !('IntersectionObserver' in window)
    )
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting)
          setRelatedCount((count) => Math.min(count + 8, products.length - 1));
      },
      { rootMargin: '300px' },
    );
    observer.observe(relatedEnd.current);
    return () => observer.disconnect();
  }, [view, active.id, relatedCount]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      setCart(validateCart(stored.cart, products));
      if (Array.isArray(stored.favorites))
        setFavorites(
          stored.favorites.filter(
            (id: unknown) => typeof id === 'string' && products.some((p) => p.id === id),
          ),
        );
    } catch {
      /* Broken or blocked browser storage must not prevent browsing. */
    }
    setOrders(readDemoOrders());
    setLoaded(true);
    const sync = () => {
      let authenticated = false;
      try {
        authenticated = sessionStorage.getItem(SESSION_KEY) === 'preview';
        const until = Number(localStorage.getItem(REMEMBER_KEY));
        if (Number.isFinite(until) && until > Date.now() && until <= Date.now() + 30 * 86400000)
          authenticated = true;
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {}
      setSignedIn(authenticated);
      if (location.pathname.replace(/\/$/, '') === sitePath('/odeme')) {
        setView('checkout');
        return;
      }
      const route = (Object.keys(accountRoutes) as AccountSection[]).find(
        (key) =>
          location.pathname.replace(/\/$/, '') === sitePath(accountRoutes[key]).replace(/\/$/, ''),
      );
      if (route) {
        const allowed = authenticated
          ? route === 'Giriş yap / Kayıt ol'
            ? 'Hesabım'
            : route
          : 'Giriş yap / Kayıt ol';
        setAccountSection(allowed);
        setView('account');
        if (allowed !== route) history.replaceState({}, '', sitePath(accountRoutes[allowed]));
        return;
      }
      const params = new URLSearchParams(location.search);
      setQuery(params.get('q') || '');
      setFilters(emptyFilters);
      setVisibleCount(12);
      setSizeError(false);
      const item = products.find((p) => p.id === params.get('urun'));
      if (item) {
        setRelatedCount(12);
        setActive(item);
        setColor(item.colors[0].name);
        setView('product');
        setSize('');
      } else if (params.has('favoriler')) setView('favorites');
      else if (params.has('kategori')) {
        setCategory(
          categories.includes(params.get('kategori') || '') ? params.get('kategori')! : 'Tümü',
        );
        setView('collection');
      } else setView('home');
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify({ cart, favorites }));
      } catch {
        /* private browsing remains usable */
      }
    }
  }, [cart, favorites, loaded]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(''), 3200);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  useEffect(() => {
    if (cartOpen) {
      dialogRef.current?.showModal();
      document.body.style.overflow = 'hidden';
      closeRef.current?.focus();
    } else {
      dialogRef.current?.close();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [cartOpen]);

  const navigateAccount = (section: AccountSection, authenticated = signedIn) => {
    const target = authenticated
      ? section === 'Giriş yap / Kayıt ol'
        ? 'Hesabım'
        : section
      : 'Giriş yap / Kayıt ol';
    setAccountSection(target);
    setView('account');
    setMenuOpen(false);
    setSearchOpen(false);
    history.pushState({}, '', sitePath(accountRoutes[target]));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const loginPreview = (remember = false) => {
    try {
      sessionStorage.setItem(SESSION_KEY, 'preview');
    } catch {}
    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, String(Date.now() + 30 * 86400000));
      else localStorage.removeItem(REMEMBER_KEY);
    } catch {}
    setSignedIn(true);
    if (pendingCheckout.current) {
      pendingCheckout.current = false;
      startCheckout();
    } else navigateAccount('Hesabım', true);
  };
  const logoutPreview = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
    try {
      localStorage.removeItem(REMEMBER_KEY);
    } catch {}
    setSignedIn(false);
    setSupportContact(null);
    setAddresses([]);
    navigateAccount('Giriş yap / Kayıt ol', false);
  };
  const startCheckout = () => {
    setCartOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
    setView('checkout');
    history.pushState({}, '', sitePath('/odeme/'));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const saveOrders = (next: DemoOrder[], successNotice?: string) => {
    setOrders(next);
    try {
      sessionStorage.setItem(ORDERS_KEY, JSON.stringify(next));
      if (successNotice) setNotice(successNotice);
    } catch {
      setNotice('Tarayıcı kaydı kapalı; deneme siparişin yalnızca bu sayfa açıkken korunur.');
    }
  };
  const completeOrder = (selection: CheckoutSelection) => {
    const rows = validateCart(cart, products);
    if (!rows.length) return '';
    const order: DemoOrder = {
      id: 'DEMO-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
      date: new Date().toISOString(),
      rows,
      status: 'received',
      deliveryAddress: snapshotAddress(selection.deliveryAddress),
      billingAddress: selection.billingAddress.slice(0, 800),
      coupon: previewTotals(rows, products, selection.coupon).coupon,
      paymentMethod: paymentMethods.includes(selection.paymentMethod)
        ? selection.paymentMethod
        : 'Kredi Kartı',
    };
    saveOrders([order, ...orders].slice(0, 50));
    setCart([]);
    return order.id;
  };
  const navigate = (next: View, cat = 'Tümü', product?: Product) => {
    setView(next);
    setCategory(cat);
    setMenuOpen(false);
    setQuery('');
    setSearchOpen(false);
    setSize('');
    setSizeError(false);
    setFilters(emptyFilters);
    setVisibleCount(12);
    setRelatedCount(12);
    setFiltersOpen(false);
    if (product) {
      setActive(product);
      setColor(product.colors[0].name);
    }
    const params = new URLSearchParams();
    if (next === 'collection') params.set('kategori', cat);
    if (next === 'product' && product) params.set('urun', product.id);
    if (next === 'favorites') params.set('favoriler', '1');
    history.pushState({}, '', sitePath(params.size ? `/?${params}` : '/'));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const toggleFavorite = (id: string) =>
    setFavorites((previous) =>
      previous.includes(id) ? previous.filter((x) => x !== id) : [...previous, id],
    );
  const searchProducts = (value: string) => {
    setQuery(value);
    setView('collection');
    setCategory('Tümü');
    setFilters(emptyFilters);
    setVisibleCount(12);
    const params = new URLSearchParams({ kategori: 'Tümü' });
    if (value) params.set('q', value);
    history.replaceState({}, '', sitePath(`/?${params}`));
  };
  const addToCart = () => {
    if (!size) {
      setSizeError(true);
      return;
    }
    const variant = { id: active.id, size, color };
    const existing = cart.find((row) => cartRowKey(row) === cartRowKey(variant));
    if (existing && existing.quantity >= 10) {
      setNotice('Önizlemede bir üründen en fazla 10 adet ekleyebilirsin.');
      return;
    }
    setCart((previous) =>
      existing
        ? previous.map((row) =>
            cartRowKey(row) === cartRowKey(variant) ? { ...row, quantity: row.quantity + 1 } : row,
          )
        : [...previous, { ...variant, quantity: 1 }],
    );

    setCartOpen(true);
  };
  let shown: Product[] = filterCatalog(
    products.filter((p) => view !== 'favorites' || favorites.includes(p.id)),
    { category, query, ...filters },
  );
  const filterCount =
    Number(filters.size !== 'Tümü') +
    Number(filters.color !== 'Tümü') +
    Number(!!filters.min || !!filters.max) +
    Number(filters.sale);
  if (sort === 'low') shown = [...shown].sort((a, b) => a.price - b.price);
  if (sort === 'high') shown = [...shown].sort((a, b) => b.price - a.price);
  if (sort === 'new')
    shown = [...shown].sort((a, b) => Number(b.tag === 'YENİ') - Number(a.tag === 'YENİ'));
  const total = cartTotal(cart, products);
  const count = cart.reduce((sum, row) => sum + row.quantity, 0);

  function card(product: Product, index: number) {
    return (
      <motion.article
        className="product-card"
        key={product.id}
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: (index % 4) * 0.045, duration: 0.3 }}
      >
        <div className="product-photo">
          <button
            className="photo-link"
            onClick={() => navigate('product', 'Tümü', product)}
            aria-label={`${product.name} ürününü incele`}
          >
            <img src={sitePath(product.image)} alt={product.name} loading="lazy" />
          </button>
          {product.tag && (
            <span className={`tag ${product.oldPrice ? 'sale' : ''}`}>{product.tag}</span>
          )}
          <button
            className={`favorite ${favorites.includes(product.id) ? 'selected' : ''}`}
            aria-label={`${product.name} ${favorites.includes(product.id) ? 'favorilerden çıkar' : 'favorilere ekle'}`}
            aria-pressed={favorites.includes(product.id)}
            onClick={() => toggleFavorite(product.id)}
          >
            <Heart size={19} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} />
          </button>
          <button className="quick-view" onClick={() => navigate('product', 'Tümü', product)}>
            Ürünü incele <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="product-meta">
          <span>{product.category}</span>
          <div className="swatches">
            {product.colors.map((c) => (
              <i key={c.name} title={c.name} style={{ backgroundColor: c.hex }} />
            ))}
          </div>
        </div>
        <button className="product-name" onClick={() => navigate('product', 'Tümü', product)}>
          {product.name}
        </button>
        <div className="price">
          {money(product.price)} {product.oldPrice && <del>{money(product.oldPrice)}</del>}
        </div>
      </motion.article>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        İçeriğe geç
      </a>
      <div className="announcement">
        <span>Modern Original Style ' Stand Out</span>
        <a
          href={sitePath(`/?kategori=${encodeURIComponent('Yeni Gelenler')}`)}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            navigate('collection', 'Yeni Gelenler');
          }}
        >
          Yeni sezonu keşfet <ArrowRight size={13} />
        </a>
      </div>
      <header className="header">
        <div className="header-main wrap">
          <button
            className="icon-button mobile-menu"
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={menuOpen}
            aria-controls="store-navigation"
            onClick={() => {
              setMenuOpen(!menuOpen);
              setSearchOpen(false);
            }}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          <a
            className="brand"
            href={sitePath('/')}
            onClick={(e) => {
              e.preventDefault();
              navigate('home');
            }}
            aria-label="mos’so ana sayfa"
          >
            <span className="brand-wordmark">mos’so</span>
            <span className="brand-tagline">Modern Original Style ' Stand Out</span>
          </a>
          <form
            className="search desktop-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              searchProducts(query);
            }}
          >
            <Search size={18} />
            <input
              aria-label="Ürün ara"
              placeholder="Bugün ne giymek istersin?"
              value={query}
              onChange={(e) => searchProducts(e.target.value)}
            />
            <span>Keşfet</span>
          </form>
          <div className="header-actions">
            <button
              className="icon-button mobile-search"
              aria-label={searchOpen ? 'Aramayı kapat' : 'Aramayı aç'}
              aria-expanded={searchOpen}
              aria-controls="mobile-product-search"
              onClick={() => {
                setSearchOpen(!searchOpen);
                setMenuOpen(false);
              }}
            >
              <Search />
            </button>
            <ProfileMenu
              signedIn={signedIn}
              onNavigate={navigateAccount}
              onLogout={logoutPreview}
            />
            <button
              className="icon-button"
              aria-label={`Favorilerim (${favorites.length})`}
              onClick={() => navigate('favorites')}
            >
              <Heart />
              <span className="action-label">Favorilerim</span>
              {favorites.length > 0 && <b className="count">{favorites.length}</b>}
            </button>
            <button
              className="icon-button"
              aria-label={`Sepetim (${count})`}
              onClick={() => {
                setCartOpen(true);
              }}
            >
              <ShoppingBag />
              <span className="action-label">Sepetim</span>
              <b className="count">{count}</b>
            </button>
          </div>
        </div>
        {searchOpen && (
          <form
            id="mobile-product-search"
            className="search mobile-search-form"
            onSubmit={(e) => {
              e.preventDefault();
              searchProducts(query);
              setSearchOpen(false);
            }}
          >
            <Search size={18} />
            <input
              autoFocus
              aria-label="Mobil ürün ara"
              placeholder="Ürün ara…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Ara</button>
          </form>
        )}
        <nav
          id="store-navigation"
          className={`navigation ${menuOpen ? 'open' : ''}`}
          aria-label="Ana menü"
        >
          <div className="wrap nav-inner">
            {navigationCategories.map((cat) => (
              <button
                key={cat}
                className={
                  (view === 'collection' && categoryPath(category).includes(cat)) ||
                  (view === 'product' && categoryPath(active.category).includes(cat))
                    ? 'active'
                    : ''
                }
                onClick={() => navigate('collection', cat)}
              >
                {cat}
                {cat === 'Yeni Gelenler' && <span className="nav-dot" />}
              </button>
            ))}
            <button onClick={() => navigate('collection')}>Tüm Koleksiyon</button>
            <span className="nav-note">Senin stilin. Senin mos’so’n.</span>
          </div>
        </nav>
      </header>
      <main id="main">
        {view === 'checkout' && (
          <CheckoutPage
            onCartChange={(rows) => setCart(validateCart(rows, products))}
            addresses={addresses}
            setAddresses={setAddresses}
            cart={cart}
            signedIn={signedIn}
            onLogin={() => {
              pendingCheckout.current = true;
              navigateAccount('Giriş yap / Kayıt ol');
            }}
            onBack={() => navigate('collection')}
            onComplete={completeOrder}
            onOrders={() => navigateAccount('Siparişlerim')}
          />
        )}
        {view === 'account' && (
          <AccountPanel
            onSaveContact={setSupportContact}
            addresses={addresses}
            setAddresses={setAddresses}
            key={signedIn ? 'signed-in' : 'guest'}
            orders={orders}
            onCancelOrder={(id, items) => {
              const order = orders.find((order) => order.id === id);
              if (!order) return;
              const updated = cancelOrder(order, items) as DemoOrder;
              if (updated === order) return;
              saveOrders(
                orders.map((order) => (order.id === id ? updated : order)),
                'Seçtiğin ürünler iptal edildi.',
              );
            }}
            onReturnOrder={(id, selection) => {
              const order = orders.find((order) => order.id === id);
              if (!order) return;
              const updated = requestOrderReturn(order, selection) as DemoOrder;
              if (updated === order) return;
              saveOrders(
                orders.map((order) => (order.id === id ? updated : order)),
                'İade talebin alındı.',
              );
            }}
            onExampleOrders={() =>
              saveOrders(
                [
                  ...orders,
                  ...exampleOrders().filter(
                    (sample) => !orders.some((order) => order.id === sample.id),
                  ),
                ].slice(0, 50),
              )
            }
            section={accountSection}
            signedIn={signedIn}
            onLogin={loginPreview}
            onSection={navigateAccount}
            onClose={() => navigate('home')}
          />
        )}
        {view === 'home' && (
          <>
            <section className="hero wrap">
              <img
                className="hero-photo"
                src={sitePath(hero)}
                alt="Lila tunik ve başörtülü kadın ile beyaz tişört ve jean giyen kadın"
                fetchPriority="high"
              />
              <div className="hero-copy">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65 }}
                >
                  <p className="eyebrow">MOS’SO / YENİ SEZON</p>
                  <h1>
                    Tarzın,
                    <br />
                    <em>seninle güzel.</em>
                  </h1>
                  <p className="hero-description">
                    Bazen sade, bazen iddialı.
                    <br />
                    Her zaman kendin gibi.
                  </p>
                  <button className="primary" onClick={() => navigate('collection')}>
                    Koleksiyonu keşfet <ArrowRight size={19} />
                  </button>
                </motion.div>
              </div>
              <span className="hero-caption">Birçok stil. Bir tek sen.</span>
              <span className="hero-index">
                01 <span>/ 01</span>
              </span>
            </section>
            <div className="brand-strip wrap">
              <span>
                <Sparkles size={17} /> Yeni sezon, yeni favoriler
              </span>
              <span>Günlükten özel günlere</span>
              <span>Her tarza bir yer var</span>
            </div>
            <section className="section wrap">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">KENDİ TARZINI BUL</p>
                  <h2>Bugün senin stilin hangisi?</h2>
                </div>
                <button className="text-link" onClick={() => navigate('collection')}>
                  Tümünü keşfet <ArrowUpRight size={18} />
                </button>
              </div>
              <div className="category-grid">
                {[
                  { name: 'Tesettür', image: '/images/tunik.webp', sub: 'Rahat, zarif, sen.' },
                  { name: 'Üst Giyim', image: '/images/crop.webp', sub: 'Günün ritmine uy.' },
                  { name: 'Elbise', image: '/images/elbise.webp', sub: 'Tek parça, çok sen.' },
                  { name: 'Alt Giyim', image: '/images/denim.webp', sub: 'Her kombinin favorisi.' },
                ].map((c) => (
                  <button
                    className="category-card"
                    key={c.name}
                    onClick={() => navigate('collection', c.name)}
                  >
                    <img src={sitePath(c.image)} alt={c.name} loading="lazy" />
                    <span className="category-copy">
                      <span>
                        <strong>{c.name}</strong>
                        <small>{c.sub}</small>
                      </span>
                      <span className="round-arrow">
                        <ArrowUpRight size={21} />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
            <div className="extra-categories wrap" aria-label="Diğer kategoriler">
              {['Crop', 'Askılı Üst', 'Bluz', 'Şort', 'Kot Ceket', 'Kaban', 'Şal & Eşarp'].map(
                (cat) => (
                  <button key={cat} onClick={() => navigate('collection', cat)}>
                    {cat}
                    <ArrowUpRight size={15} />
                  </button>
                ),
              )}
            </div>
            <section className="section wrap arrivals">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">GARDIROBUNA TAZE BİR DOKUNUŞ</p>
                  <h2>Yeni favorilerin burada.</h2>
                </div>
                <button className="text-link" onClick={() => navigate('collection')}>
                  Koleksiyonu gör <ArrowRight size={18} />
                </button>
              </div>
              <div className="product-grid">{products.slice(-16, -8).map(card)}</div>
              <div className="arrivals-collection-link">
                <button onClick={() => navigate('collection', 'Tümü')}>
                  Tüm koleksiyonu keşfet <ArrowRight size={18} />
                </button>
              </div>
            </section>
            <section className="brand-story wrap">
              <span className="story-label">MOS’SO’NUN DÜNYASI</span>
              <h2>
                Bir kalıba değil,
                <br />
                <em>kendine sığ.</em>
              </h2>
              <div>
                <p>
                  İster en sevdiğin jean, ister uçuşan bir elbise.
                  <br />
                  Seni iyi hissettiren neyse, stilin o.
                </p>
                <button className="text-link" onClick={() => navigate('collection')}>
                  Kendi kombinini keşfet <ArrowUpRight size={18} />
                </button>
              </div>
            </section>
          </>
        )}
        {(view === 'collection' || view === 'favorites') && (
          <section className="collection wrap">
            <div className="breadcrumb">
              <button onClick={() => navigate('home')}>Ana sayfa</button>
              {(view === 'favorites' ? ['Favorilerim'] : categoryPath(category)).map(
                (cat, index, path) => (
                  <Fragment key={cat}>
                    <ChevronRight size={13} />
                    {index < path.length - 1 ? (
                      <button onClick={() => navigate('collection', cat)}>{cat}</button>
                    ) : (
                      <span>{cat === 'Tümü' ? 'Koleksiyon' : cat}</span>
                    )}
                  </Fragment>
                ),
              )}
            </div>
            <div className="collection-title">
              <div>
                <p className="eyebrow">SENİN SEÇİMLERİN, SENİN TARZIN</p>
                <h1>
                  {view === 'favorites'
                    ? 'Favorilerim'
                    : query
                      ? 'Arama sonuçları'
                      : category === 'Tümü'
                        ? 'Tüm koleksiyon'
                        : category}
                </h1>
              </div>
              <span>{shown.length} ürün</span>
            </div>
            {view === 'collection' && !query && categoryNavigation(category).length > 0 && (
              <nav className="category-tabs" aria-label="Kategori seçenekleri">
                {categoryNavigation(category).map((cat) => (
                  <button
                    className={category === cat ? 'active' : ''}
                    key={cat}
                    onClick={() => navigate('collection', cat)}
                  >
                    {cat === categoryPath(category)[0] &&
                    category !== 'Tümü' &&
                    category !== 'Yeni Gelenler'
                      ? `Tüm ${cat}`
                      : cat}
                  </button>
                ))}
              </nav>
            )}
            <div className="collection-toolbar">
              <button
                className={filtersOpen ? 'filter-button active' : 'filter-button'}
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-expanded={filtersOpen}
              >
                <SlidersHorizontal size={16} /> Filtrele {filterCount > 0 && `(${filterCount})`}
              </button>
              <span className="query-label">{query && `“${query}” için`}</span>
              <label className="sort-label">
                Sırala:{' '}
                <select
                  value={sort}
                  aria-label="Ürünleri sırala"
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="featured">Önerilen</option>
                  <option value="new">En yeniler</option>
                  <option value="low">Fiyat: artan</option>
                  <option value="high">Fiyat: azalan</option>
                </select>
              </label>
            </div>
            {filterCount > 0 && (
              <div className="active-filters" aria-label="Seçili filtreler">
                {filters.size !== 'Tümü' && (
                  <button onClick={() => setFilters({ ...filters, size: 'Tümü' })}>
                    Beden: {filters.size} <X size={13} />
                  </button>
                )}
                {filters.color !== 'Tümü' && (
                  <button onClick={() => setFilters({ ...filters, color: 'Tümü' })}>
                    Renk: {filters.color} <X size={13} />
                  </button>
                )}
                {(filters.min || filters.max) && (
                  <button onClick={() => setFilters({ ...filters, min: '', max: '' })}>
                    {filters.min || '0'}–{filters.max || '∞'} ₺ <X size={13} />
                  </button>
                )}
                {filters.sale && (
                  <button onClick={() => setFilters({ ...filters, sale: false })}>
                    İndirimli <X size={13} />
                  </button>
                )}
                <button className="clear-filters" onClick={() => setFilters(emptyFilters)}>
                  Tümünü temizle
                </button>
              </div>
            )}
            {shown.length ? (
              <>
                <div className="product-grid">{shown.slice(0, visibleCount).map(card)}</div>
                {shown.length > visibleCount && (
                  <div className="load-more">
                    <p>
                      {shown.length} ürünün {visibleCount} tanesini görüyorsun.
                    </p>
                    <button
                      className="secondary"
                      onClick={() => setVisibleCount(visibleCount + 12)}
                    >
                      Daha fazla ürün göster <Plus size={17} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <Heart size={36} />
                <h2>
                  {view === 'favorites'
                    ? 'Favorilerin seni bekliyor.'
                    : 'Aradığın ürünü bulamadık.'}
                </h2>
                <p>
                  {view === 'favorites'
                    ? 'Beğendiğin ürünlerin kalbine dokun, burada bir araya gelsinler.'
                    : 'Başka bir kelime dene veya filtreleri temizle.'}
                </p>
                <button className="primary" onClick={() => navigate('collection')}>
                  Koleksiyonu keşfet <ArrowRight size={17} />
                </button>
              </div>
            )}
          </section>
        )}
        {view === 'product' && (
          <section className="detail wrap">
            <div className="breadcrumb">
              <button onClick={() => navigate('home')}>Ana sayfa</button>
              {categoryPath(active.category).map((cat) => (
                <Fragment key={cat}>
                  <ChevronRight size={13} />
                  <button onClick={() => navigate('collection', cat)}>{cat}</button>
                </Fragment>
              ))}
              <ChevronRight size={13} />
              <span>{active.name}</span>
            </div>
            <div className="detail-grid">
              <div className="detail-image">
                <img src={sitePath(active.image)} alt={active.name} />
                {active.tag && <span className="tag">{active.tag}</span>}
              </div>
              <div className="detail-info">
                <p className="eyebrow">MOS’SO / {active.category.toLocaleUpperCase('tr')}</p>
                <h1>{active.name}</h1>
                <div className="detail-price">
                  {money(active.price)} {active.oldPrice && <del>{money(active.oldPrice)}</del>}
                </div>
                <p className="detail-description">{active.description}</p>
                <ColorSelector colors={active.colors} value={color} onChange={setColor} />
                <p className="color-photo-note">
                  Ürün görseli {active.colors[0].name.toLocaleLowerCase('tr')} renk örneğidir.
                </p>
                <div className="size-heading">
                  <strong>Beden seç</strong>
                  <span>{size || 'Henüz seçilmedi'}</span>
                </div>
                <div className="sizes">
                  {active.sizes.map((s) => (
                    <button
                      className={size === s ? 'selected' : ''}
                      aria-pressed={size === s}
                      key={s}
                      onClick={() => {
                        setSize(s);
                        setSizeError(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <p className="field-error" role="alert">
                    Sepete eklemek için bir beden seçmelisin.
                  </p>
                )}
                <div className="buy-actions">
                  <button className="primary" onClick={addToCart}>
                    Sepete ekle <ShoppingBag size={19} />
                  </button>
                  <button
                    className={`favorite-detail ${favorites.includes(active.id) ? 'selected' : ''}`}
                    aria-label="Ürünü favorilere ekle veya çıkar"
                    aria-pressed={favorites.includes(active.id)}
                    onClick={() => toggleFavorite(active.id)}
                  >
                    <Heart
                      fill={favorites.includes(active.id) ? 'currentColor' : 'none'}
                      size={21}
                    />
                  </button>
                </div>
                <p className="preview-note">Önizleme ürünü · Görsel ve fiyat temsilidir.</p>
                <details>
                  <summary>
                    Ürün hakkında <Plus size={17} />
                  </summary>
                  <p>
                    {active.description} Gerçek ürünün kumaş, ölçü ve bakım bilgileri koleksiyon
                    eklenirken tamamlanacak.
                  </p>
                </details>
                <details>
                  <summary>
                    Teslimat ve iade <Plus size={17} />
                  </summary>
                  <p>
                    Bu sürümde sipariş ve ödeme alınmaz. Gerçek teslimat ve iade koşulları satışa
                    açılmadan önce burada yayınlanacak.
                  </p>
                </details>
              </div>
            </div>
            <div className="section-heading related-heading">
              <h2>Bunları da sevebilirsin.</h2>
              <button className="text-link" onClick={() => navigate('collection')}>
                Tüm ürünler <ArrowRight size={18} />
              </button>
            </div>
            <div className="product-grid related">
              {products
                .filter((p) => p.id !== active.id)
                .sort(
                  (a, b) =>
                    Number(b.category === active.category) - Number(a.category === active.category),
                )
                .slice(0, relatedCount)
                .map(card)}
            </div>
            <div className="related-more" ref={relatedEnd}>
              <p role="status">
                {Math.min(relatedCount, products.length - 1)} / {products.length - 1} ürün
                gösteriliyor
              </p>
              {relatedCount < products.length - 1 ? (
                <button
                  className="text-link"
                  onClick={() =>
                    setRelatedCount((count) => Math.min(count + 8, products.length - 1))
                  }
                >
                  Daha fazla ürün keşfet <Plus size={17} />
                </button>
              ) : (
                <span>Koleksiyondaki tüm parçaları gördün.</span>
              )}
            </div>
          </section>
        )}
      </main>
      <StoreFooter
        category={(cat) => navigate('collection', cat)}
        home={() => navigate('home')}
        favorites={() => navigate('favorites')}
        cart={() => {
          setCartOpen(true);
        }}
      />
      {!cartOpen && !menuOpen && !filtersOpen && !searchOpen && (
        <SupportWidget contact={signedIn ? supportContact : null} />
      )}
      <CatalogFilters
        open={filtersOpen}
        close={() => setFiltersOpen(false)}
        filters={filters}
        update={(next) => {
          setFilters(next);
          setVisibleCount(12);
        }}
        count={shown.length}
      />
      <dialog
        ref={dialogRef}
        className="cart-dialog"
        onCancel={() => setCartOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setCartOpen(false);
        }}
        aria-labelledby="cart-title"
      >
        <div className="cart-inner">
          <div className="cart-heading">
            <h2 id="cart-title">
              Sepetim <span>({count})</span>
            </h2>
            <button
              ref={closeRef}
              className="icon-button"
              aria-label="Sepeti kapat"
              onClick={() => setCartOpen(false)}
            >
              <X />
            </button>
          </div>
          {cart.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={42} />
              <h3>Güzel seçimlere yer var.</h3>
              <p>Beğendiğin parçaları sepetine ekle.</p>
              <button
                className="primary"
                onClick={() => {
                  setCartOpen(false);
                  navigate('collection');
                }}
              >
                Alışverişe başla <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((row) => {
                  const product = products.find((p) => p.id === row.id)!;
                  return (
                    <article className="cart-item" key={cartRowKey(row)}>
                      <img src={sitePath(product.image)} alt={product.name} />
                      <div>
                        <h3>{product.name}</h3>
                        <p>
                          {row.color || product.colors[0].name} / {row.size}
                        </p>
                        <strong>{money(product.price)}</strong>
                        <div className="quantity">
                          <button
                            aria-label={`${product.name} adedini azalt`}
                            disabled={row.quantity === 1}
                            onClick={() =>
                              setCart(
                                cart.map((r) =>
                                  r === row ? { ...r, quantity: r.quantity - 1 } : r,
                                ),
                              )
                            }
                          >
                            <Minus size={14} />
                          </button>
                          <span>{row.quantity}</span>
                          <button
                            aria-label={`${product.name} adedini artır`}
                            disabled={row.quantity >= 10}
                            onClick={() =>
                              setCart(
                                cart.map((r) =>
                                  r === row ? { ...r, quantity: r.quantity + 1 } : r,
                                ),
                              )
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <button
                        className="remove-item"
                        aria-label={`${product.name} sepetten kaldır`}
                        onClick={() => setCart(cart.filter((r) => r !== row))}
                      >
                        <Trash2 size={17} />
                      </button>
                    </article>
                  );
                })}
              </div>
              <div className="cart-summary">
                <div>
                  <span>Ara toplam</span>
                  <strong>{money(total)}</strong>
                </div>
                <p>Örnek fiyatlar · Kargo hesaplanmaz.</p>
                <button className="primary" onClick={startCheckout}>
                  Ödeme adımlarına geç <ArrowRight size={18} />
                </button>
                <button className="text-link continue-shopping" onClick={() => setCartOpen(false)}>
                  Alışverişe devam et
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
      <AnimatePresence>
        {notice && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Check size={18} />
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
