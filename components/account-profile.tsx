'use client';
import PhoneInput from './phone-input';

import { useState } from 'react';
import {
  UserRound,
  Mail,
  Smartphone,
  Sparkles,
  Tag,
  Truck,
  Settings2,
  LockKeyhole,
} from 'lucide-react';
import PasswordField from './password-field';
import type { SupportContact } from './support-widget';

const communicationOptions = [
  {
    key: 'email',
    title: 'E-posta kampanyaları',
    text: 'Yeni sezon, özel teklifler ve kampanyalar.',
    icon: Mail,
  },
  {
    key: 'sms',
    title: 'SMS bildirimleri',
    text: 'Kampanya ve önemli duyurular.',
    icon: Smartphone,
  },
  {
    key: 'new',
    title: 'Yeni gelenler',
    text: 'Yeni ürünlerden ilk sen haberdar ol.',
    icon: Sparkles,
  },
  {
    key: 'discount',
    title: 'İndirim haberleri',
    text: 'Sana özel indirim ve fırsatlar.',
    icon: Tag,
  },
  {
    key: 'order',
    title: 'Sipariş güncellemeleri',
    text: 'Siparişin ve teslimatın hakkında bilgiler.',
    icon: Truck,
  },
] as const;

export default function AccountProfile({
  onSaveContact,
}: {
  onSaveContact: (contact: SupportContact) => void;
}) {
  const [profile, setProfile] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    birthday: '',
    gender: '',
  });
  const [preferences, setPreferences] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(communicationOptions.map(({ key }) => [key, true])),
  );
  const [profileMessage, setProfileMessage] = useState('');
  const [preferencesMessage, setPreferencesMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordFormKey, setPasswordFormKey] = useState(0);
  return (
    <div className="profile-sections">
      <div className="profile-columns">
        <section aria-labelledby="personal-info-title">
          <div className="account-section-intro">
            <UserRound aria-hidden="true" />
            <div>
              <h3 id="personal-info-title">Kişisel bilgiler</h3>
              <p>Sana ait bilgileri buradan düzenleyebilirsin.</p>
            </div>
          </div>
          <form
            className="account-form account-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              onSaveContact({
                name: `${profile.name} ${profile.surname}`.trim(),
                email: profile.email,
                phone: profile.phone,
              });
              setProfileMessage('Bilgilerin güncellendi.');
            }}
          >
            {(
              [
                { key: 'name', label: 'Ad', auto: 'given-name', placeholder: 'Adın' },
                { key: 'surname', label: 'Soyad', auto: 'family-name', placeholder: 'Soyadın' },
                { key: 'email', label: 'E-posta', auto: 'email', placeholder: 'ornek@mail.com' },
                { key: 'phone', label: 'Telefon', auto: 'tel', placeholder: '+90 5XX XXX XX XX' },
              ] as const
            ).map(({ key, label, auto, placeholder }) => (
              <label
                key={key}
                className={key === 'email' || key === 'phone' ? 'account-wide' : undefined}
              >
                {label}
                {key === 'phone' ? (
                  <PhoneInput
                    value={profile.phone}
                    onValueChange={(phone) => setProfile({ ...profile, phone })}
                  />
                ) : (
                  <input
                    value={profile[key]}
                    onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                    type={key === 'email' ? 'email' : 'text'}
                    autoComplete={auto}
                    required
                    maxLength={key === 'email' ? 254 : 100}
                    placeholder={placeholder}
                  />
                )}
              </label>
            ))}
            <label className="account-wide">
              Doğum tarihi <small>(isteğe bağlı)</small>
              <input
                type="date"
                autoComplete="bday"
                max={new Date().toLocaleDateString('en-CA')}
                value={profile.birthday}
                onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
              />
            </label>
            <fieldset className="profile-gender account-wide">
              <legend>
                Cinsiyet <small>(isteğe bağlı)</small>
              </legend>
              {['Kadın', 'Erkek', 'Belirtmek istemiyorum'].map((gender) => (
                <label key={gender}>
                  <input
                    type="radio"
                    name="profile-gender"
                    value={gender}
                    checked={profile.gender === gender}
                    onChange={() => setProfile({ ...profile, gender })}
                  />
                  {gender}
                </label>
              ))}
            </fieldset>
            <button type="submit" className="primary account-wide">
              Bilgileri kaydet
            </button>
            {profileMessage && (
              <p className="account-feedback account-wide" role="status">
                {profileMessage}
              </p>
            )}
          </form>
        </section>
        <section className="profile-preferences" aria-labelledby="communication-title">
          <div className="account-section-intro">
            <Settings2 aria-hidden="true" />
            <div>
              <h3 id="communication-title">İletişim tercihleri</h3>
              <p>Hangi haberleri görmek istediğini seç.</p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPreferencesMessage('İletişim tercihlerin güncellendi.');
            }}
          >
            <div className="communication-options">
              {communicationOptions.map(({ key, title, text, icon: Icon }) => (
                <div className="communication-option" key={key}>
                  <Icon size={21} aria-hidden="true" />
                  <div>
                    <strong id={`preference-${key}`}>{title}</strong>
                    <p id={`preference-description-${key}`}>{text}</p>
                  </div>
                  <button
                    className="preference-switch"
                    type="button"
                    role="switch"
                    aria-checked={!!preferences[key]}
                    aria-labelledby={`preference-${key}`}
                    aria-describedby={`preference-description-${key}`}
                    onClick={() => setPreferences({ ...preferences, [key]: !preferences[key] })}
                  >
                    <span />
                  </button>
                </div>
              ))}
            </div>
            <button className="primary" type="submit">
              Tercihleri kaydet
            </button>
            {preferencesMessage && (
              <p className="account-feedback" role="status">
                {preferencesMessage}
              </p>
            )}
          </form>
        </section>
      </div>
      <section className="profile-password" aria-labelledby="password-change-title">
        <div className="account-section-intro">
          <LockKeyhole aria-hidden="true" />
          <div>
            <h3 id="password-change-title">Şifre değiştir</h3>
            <p>Yeni şifren en az 12 karakter olmalı.</p>
          </div>
        </div>
        <form
          key={passwordFormKey}
          className="account-form profile-password-form"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const current = form.elements.namedItem('current-password') as HTMLInputElement;
            const next = form.elements.namedItem('new-password') as HTMLInputElement;
            const confirm = form.elements.namedItem('confirm-password') as HTMLInputElement;
            if (next.value !== confirm.value) {
              confirm.setCustomValidity('Yeni şifreler eşleşmiyor.');
              confirm.reportValidity();
              return;
            }
            if (current.value === next.value) {
              next.setCustomValidity('Yeni şifren mevcut şifrenden farklı olmalı.');
              next.reportValidity();
              return;
            }
            form.reset();
            setPasswordFormKey((key) => key + 1);
            setPasswordMessage('Şifre değiştirme şu anda kullanılamıyor.');
          }}
          onInput={(e) => {
            e.currentTarget
              .querySelectorAll('input')
              .forEach((input) => input.setCustomValidity(''));
            setPasswordMessage('');
          }}
        >
          <PasswordField label="Mevcut şifre" name="current-password" />
          <PasswordField
            label="Yeni şifre"
            name="new-password"
            autoComplete="new-password"
            minLength={12}
            placeholder="En az 12 karakter"
          />
          <PasswordField
            label="Yeni şifre tekrar"
            name="confirm-password"
            autoComplete="new-password"
            minLength={12}
            placeholder="Yeni şifreni tekrar gir"
          />
          <div className="profile-password-actions">
            <button className="primary" type="submit">
              Şifreyi güncelle
            </button>
          </div>
          {passwordMessage && (
            <p className="account-feedback profile-password-message" role="status">
              {passwordMessage}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
