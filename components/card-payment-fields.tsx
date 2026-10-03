'use client';

import { CreditCard, Info } from 'lucide-react';

export default function CardPaymentFields() {
  return (
    <div className="card-payment-fields">
      <div className="card-payment-heading">
        <CreditCard size={24} aria-hidden="true" />
        <div>
          <h3>Banka / kredi kartı</h3>
          <p>Kart bilgilerini aşağıdan tamamla.</p>
        </div>
        <span>Önizleme</span>
      </div>
      <p className="card-payment-notice" id="card-preview-note">
        <Info size={18} aria-hidden="true" />
        <span>
          Gerçek kart bilgilerini girme. Denemek için 4242 4242 4242 4242, 12/30 ve 123
          kullanabilirsin. Bu alanlar kaydedilmez veya gönderilmez.
        </span>
      </p>
      <div className="account-form card-form" aria-describedby="card-preview-note">
        <label className="card-form-wide">
          Kart üzerindeki ad soyad
          <input required autoComplete="off" maxLength={80} placeholder="AD SOYAD" />
        </label>
        <label className="card-form-wide">
          Kart numarası
          <input
            required
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0000 0000 0000 0000"
            maxLength={23}
            pattern="(?:[0-9] ?){13,19}"
            title="13–19 haneli örnek kart numarası gir."
            onChange={(e) => {
              e.currentTarget.value = e.currentTarget.value
                .replace(/\D/g, '')
                .slice(0, 19)
                .replace(/(.{4})/g, '$1 ')
                .trim();
            }}
          />
        </label>
        <label>
          Son kullanma tarihi
          <input
            required
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="AA/YY"
            maxLength={5}
            pattern="(0[1-9]|1[0-2])/[0-9]{2}"
            title="AA/YY biçiminde geçerli bir ay gir."
            onChange={(e) => {
              const digits = e.currentTarget.value.replace(/\D/g, '').slice(0, 4);
              e.currentTarget.value =
                digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
            }}
          />
        </label>
        <label>
          Güvenlik kodu
          <input
            required
            type="password"
            inputMode="numeric"
            autoComplete="off"
            placeholder="CVV"
            maxLength={4}
            pattern="[0-9]{3,4}"
            title="3 veya 4 haneli örnek güvenlik kodu gir."
            onChange={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 4);
            }}
          />
          <small>Kartın üzerindeki 3 veya 4 haneli kod.</small>
        </label>
      </div>
      <div className="card-payment-plan">
        <span>Ödeme şekli</span>
        <strong>Tek çekim</strong>
      </div>
    </div>
  );
}
