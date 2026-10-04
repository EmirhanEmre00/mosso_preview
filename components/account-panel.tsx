'use client';

import { useEffect, useState, type FormEvent } from 'react';
import OrderList from './order-list';
import type { DemoOrder, OrderRow, ReturnSelection } from '@/lib/demo-orders';
import { ArrowRight, MapPin, Plus, Trash2 } from 'lucide-react';
import PasswordField from './password-field';
import AccountProfile, { type Profile, type Preferences } from './account-profile';
import SocialLoginButtons from './social-login-buttons';
import type { SupportContact } from './support-widget';
import PhoneInput from './phone-input';
import LocationFields from './location-fields';
import { validAddress, phoneText } from '@/lib/contact-validation.mjs';

const sections = ['Giriş yap / Kayıt ol', 'Hesabım', 'Siparişlerim', 'Adreslerim'] as const;
export type AccountSection = (typeof sections)[number];
export type Address = {
  id: number;
  title: string;
  name: string;
  phone: string;
  city: string;
  district: string;
  postalCode?: string;
  address: string;
};
const blankAddress = {
  title: '',
  name: '',
  phone: '',
  city: '',
  district: '',
  postalCode: '',
  address: '',
};

export default function AccountPanel({
  section,
  onClose,
  onSection,
  onLogin,
  signedIn,
  orders,
  onCancelOrder,
  onReturnOrder,
  onExampleOrders,
  addresses,
  setAddresses,
  onSaveContact,
  profile,
  preferences,
  onSaveProfile,
  onSavePreferences,
}: {
  section: AccountSection;
  signedIn: boolean;
  orders: DemoOrder[];
  onCancelOrder: (id: string, items: OrderRow[]) => void;
  onReturnOrder: (id: string, selection: ReturnSelection) => void;
  onExampleOrders: () => void;
  addresses: Address[];
  setAddresses: (addresses: Address[]) => void;
  onSaveContact: (contact: SupportContact) => void;
  profile: Profile;
  preferences: Preferences;
  onSaveProfile: (profile: Profile) => void;
  onSavePreferences: (preferences: Preferences) => void;
  onLogin: (remember?: boolean) => void;
  onClose: () => void;
  onSection: (section: AccountSection) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [draft, setDraft] = useState(blankAddress);

  useEffect(() => {
    setMessage('');
  }, [section]);

  const authSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const remember =
      (event.currentTarget.elements.namedItem('remember') as HTMLInputElement | null)?.checked ??
      false;
    if (mode !== 'reset') {
      const fields = new FormData(event.currentTarget);
      onSaveContact({
        name: String(fields.get('name') || ''),
        email: String(fields.get('email') || ''),
        phone: '',
      });
    }
    event.currentTarget.reset();
    if (mode !== 'reset') {
      onLogin(remember);
      return;
    }
    setMessage(
      mode === 'reset'
        ? 'Şifre yenileme şu anda kullanılamıyor. Yardım için mağazamızla iletişime geç.'
        : 'Bilgilerini kontrol edip tekrar dene.',
    );
  };

  return (
    <section className="account-page wrap" aria-labelledby="account-title">
      <div className="account-shell">
        <header className="account-heading">
          <div>
            <span className="eyebrow">SENİN MOS’SO DÜNYAN</span>
            <h1 id="account-title">{section}</h1>
          </div>
        </header>
        {signedIn && (
          <nav className="account-nav" aria-label="Hesap bölümleri">
            {sections
              .filter((item) =>
                signedIn ? item !== 'Giriş yap / Kayıt ol' : item === 'Giriş yap / Kayıt ol',
              )
              .map((item) => (
                <button
                  key={item}
                  aria-current={section === item ? 'page' : undefined}
                  onClick={() => onSection(item)}
                >
                  {item}
                </button>
              ))}
          </nav>
        )}
        <div
          className={`account-content ${section === 'Giriş yap / Kayıt ol' ? 'account-content-auth' : ''}`}
        >
          {section === 'Giriş yap / Kayıt ol' && (
            <>
              <div className="account-auth-tabs">
                <button
                  aria-pressed={mode === 'login'}
                  onClick={() => {
                    setMode('login');
                    setMessage('');
                  }}
                >
                  Giriş yap
                </button>
                <button
                  aria-pressed={mode === 'register'}
                  onClick={() => {
                    setMode('register');
                    setMessage('');
                  }}
                >
                  Kayıt ol
                </button>
              </div>
              <h3>
                {mode === 'register'
                  ? 'Stiline yer aç.'
                  : mode === 'reset'
                    ? 'Şifreni yenile'
                    : 'Yeniden merhaba.'}
              </h3>
              <p className="account-description">
                {mode === 'reset'
                  ? 'Hesabına bağlı e-posta adresini gir.'
                  : 'Favorilerin, adreslerin ve siparişlerin tek bir yerde.'}
              </p>
              <form key={mode} className="account-form" onSubmit={authSubmit}>
                {mode === 'register' && (
                  <label>
                    Ad soyad
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      maxLength={100}
                      placeholder="Adın ve soyadın"
                    />
                  </label>
                )}
                <label>
                  E-posta
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    placeholder="ornek@eposta.com"
                  />
                </label>
                {mode !== 'reset' && (
                  <PasswordField
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    minLength={mode === 'register' ? 12 : 1}
                    placeholder={mode === 'register' ? 'En az 12 karakter' : 'Şifren'}
                  />
                )}
                {mode === 'login' && (
                  <div className="account-login-options">
                    <label className="account-remember">
                      <input type="checkbox" name="remember" /> Beni hatırla
                    </label>
                    <button
                      type="button"
                      className="account-text-button"
                      onClick={() => {
                        setMode('reset');
                        setMessage('');
                      }}
                    >
                      Şifremi unuttum
                    </button>
                  </div>
                )}
                <button className="primary" type="submit">
                  {mode === 'register'
                    ? 'Kayıt ol'
                    : mode === 'reset'
                      ? 'Şifremi yenile'
                      : 'Giriş yap'}
                  <ArrowRight size={17} />
                </button>
                {mode !== 'reset' && <SocialLoginButtons onLogin={onLogin} />}
              </form>
            </>
          )}
          {section === 'Hesabım' && (
            <AccountProfile
              profile={profile}
              preferences={preferences}
              onSaveProfile={onSaveProfile}
              onSavePreferences={onSavePreferences}
            />
          )}
          {section === 'Siparişlerim' && (
            <OrderList
              orders={orders}
              onCancel={onCancelOrder}
              onReturn={onReturnOrder}
              onExamples={onExampleOrders}
              onShop={onClose}
            />
          )}
          {section === 'Adreslerim' && (
            <>
              <div className="account-section-intro">
                <MapPin />
                <div>
                  <h3>Teslimat adreslerin</h3>
                  <p>Ev, iş veya senin seçtiğin başka bir yer.</p>
                </div>
              </div>
              {addresses.length === 0 && editing === null && (
                <p className="account-address-empty">
                  Henüz adres eklemedin. İlk adresini ekleyerek formu deneyebilirsin.
                </p>
              )}
              <div className="account-addresses">
                {addresses.map((address) => (
                  <article key={address.id}>
                    <strong>{address.title}</strong>
                    <p>
                      {address.name}
                      <br />
                      {address.address}
                      <br />
                      {address.district} / {address.city} {address.postalCode}
                      <br />
                      {phoneText(address.phone)}
                    </p>
                    <div>
                      <button
                        onClick={() => {
                          setDraft({ ...address, postalCode: address.postalCode ?? '' });
                          setEditing(address.id);
                          setMessage('');
                        }}
                      >
                        Düzenle
                      </button>
                      <button
                        aria-label={`${address.title} adresini sil`}
                        onClick={() => {
                          setAddresses(addresses.filter((a) => a.id !== address.id));
                          if (editing === address.id) setEditing(null);
                          setMessage('Adres kaldırıldı.');
                        }}
                      >
                        <Trash2 size={15} /> Sil
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {editing === null ? (
                <button
                  className="primary"
                  onClick={() => {
                    setDraft(blankAddress);
                    setEditing('new');
                    setMessage('');
                  }}
                >
                  <Plus size={17} /> Yeni adres ekle
                </button>
              ) : (
                <form
                  className="account-form account-form-grid"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!validAddress(draft)) {
                      setMessage(
                        'Adresi kontrol et: geçerli telefon, il ve ilçe seçimi gerekiyor.',
                      );
                      return;
                    }
                    const entry = { ...draft, id: editing === 'new' ? Date.now() : editing };
                    setAddresses(
                      editing === 'new'
                        ? [...addresses, entry]
                        : addresses.map((a) => (a.id === editing ? entry : a)),
                    );
                    setEditing(null);
                    setMessage('Adres kaydedildi.');
                  }}
                >
                  {(
                    [
                      { key: 'title', label: 'Adres başlığı', placeholder: 'Ev / İş' },
                      { key: 'name', label: 'Ad soyad', placeholder: 'Teslim alacak kişi' },
                    ] as const
                  ).map(({ key, label, placeholder }) => (
                    <label key={key}>
                      {label}
                      <input
                        required
                        type="text"
                        maxLength={100}
                        value={draft[key]}
                        placeholder={placeholder}
                        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      />
                    </label>
                  ))}
                  <label>
                    Telefon
                    <PhoneInput
                      required
                      value={draft.phone}
                      onValueChange={(phone) => setDraft({ ...draft, phone })}
                    />
                  </label>
                  <LocationFields
                    city={draft.city}
                    district={draft.district}
                    onChange={(location) => setDraft({ ...draft, ...location })}
                  />
                  <label>
                    Posta kodu
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      pattern="[0-9]{5}"
                      maxLength={5}
                      placeholder="54050"
                      value={draft.postalCode}
                      onChange={(event) =>
                        setDraft({ ...draft, postalCode: event.target.value.replace(/\D/g, '') })
                      }
                    />
                  </label>
                  <label className="account-wide">
                    Açık adres
                    <textarea
                      required
                      maxLength={500}
                      rows={3}
                      value={draft.address}
                      placeholder="Mahalle, sokak, bina ve daire numarası"
                      onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                    />
                  </label>
                  <div className="account-wide account-form-actions">
                    <button type="submit" className="primary">
                      Adresi kaydet
                    </button>
                    <button type="button" onClick={() => setEditing(null)}>
                      Vazgeç
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
          {message && (
            <p className="account-feedback" role="status">
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
