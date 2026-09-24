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
import { cartTotal, validateCart } from '@/lib/cart.mjs';
import { categoryPath, categoryNavigation, navigationCategories } from '@/lib/categories.mjs';
import { filterCatalog } from '@/lib/catalog.mjs';
import CatalogFilters, { emptyFilters, type Filters } from './catalog-filters';
import StoreFooter from './store-footer';
import ProfileMenu from './profile-menu';

type CartRow = { id: string; size: string; quantity: number };
type View = 'home' | 'collection' | 'favorites' | 'product';
const STORE_KEY = 'mosso-preview-v1';
const hero = '/images/mosso-editorial.webp';

export default function Storefront() {
  const [view, setView] = useState<View>('home');
  const [category, setCategory] = useState('Tümü');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [visibleCount, setVisibleCount] = useState(12);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [active, setActive] = useState<Product>(products[0]);
  const [size, setSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [cart, setCart] = useState<CartRow[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [checkout, setCheckout] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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
    setLoaded(true);
    const sync = () => {
      const params = new URLSearchParams(location.search);
      setQuery(params.get('q') || '');
      setFilters(emptyFilters);
      setVisibleCount(12);
      setSizeError(false);
      const item = products.find((p) => p.id === params.get('urun'));
      if (item) {
        setActive(item);
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
    setFiltersOpen(false);
    if (product) setActive(product);
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
    const existing = cart.find((row) => row.id === active.id && row.size === size);
    if (existing && existing.quantity >= 10) {
      setNotice('Önizlemede bir üründen en fazla 10 adet ekleyebilirsin.');
      return;
    }
    setCart((previous) =>
      existing
        ? previous.map((row) =>
            row.id === active.id && row.size === size
              ? { ...row, quantity: row.quantity + 1 }
              : row,
          )
        : [...previous, { id: active.id, size, quantity: 1 }],
    );
    setCheckout(false);
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
        <span>Her halinle, kendin gibi.</span>
        <span>
          Yeni sezonu keşfet <ArrowRight size={13} />
        </span>
      </div>
      <header className="header">
        <div className="header-main wrap">
          <button
            className="icon-button mobile-menu"
            aria-label="Menüyü aç"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
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
            aria-label="Mosso ana sayfa"
          >
            <img src={sitePath('/images/mosso-logo.webp')} alt="mosso" />
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
              aria-label="Aramayı aç"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search />
            </button>
            <ProfileMenu />
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
                setCheckout(false);
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
        <nav className={`navigation ${menuOpen ? 'open' : ''}`} aria-label="Ana menü">
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
            <span className="nav-note">Senin stilin. Senin Mosso’n.</span>
          </div>
        </nav>
      </header>
      <main id="main">
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
                  <p className="eyebrow">MOSSO / YENİ SEZON</p>
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
            </section>
            <section className="brand-story wrap">
              <span className="story-label">MOSSO’NUN DÜNYASI</span>
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
                <p className="eyebrow">MOSSO / {active.category.toLocaleUpperCase('tr')}</p>
                <h1>{active.name}</h1>
                <div className="detail-price">
                  {money(active.price)} {active.oldPrice && <del>{money(active.oldPrice)}</del>}
                </div>
                <p className="detail-description">{active.description}</p>
                <div className="color-line">
                  Renk: <strong>{active.colors[0].name}</strong>
                  <span className="color-choice" style={{ background: active.colors[0].hex }} />
                </div>
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
                .slice(0, 4)
                .map(card)}
            </div>
          </section>
        )}
      </main>
      <StoreFooter
        category={(cat) => navigate('collection', cat)}
        home={() => navigate('home')}
        favorites={() => navigate('favorites')}
        cart={() => {
          setCheckout(false);
          setCartOpen(true);
        }}
      />
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
                    <article className="cart-item" key={`${row.id}-${row.size}`}>
                      <img src={sitePath(product.image)} alt={product.name} />
                      <div>
                        <h3>{product.name}</h3>
                        <p>
                          {product.colors[0].name} / {row.size}
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
                {checkout ? (
                  <div className="checkout-notice" role="status">
                    <Check size={22} />
                    <div>
                      <strong>Alışveriş akışı burada tamamlanıyor.</strong>
                      <p>
                        Bu bir frontend önizlemesi. Sipariş oluşturulmadı ve ödeme alınmadı. Ödeme
                        bağlantısını backend aşamasında kuracağız.
                      </p>
                    </div>
                  </div>
                ) : (
                  <button className="primary" onClick={() => setCheckout(true)}>
                    Ödeme adımını önizle <ArrowRight size={18} />
                  </button>
                )}
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
