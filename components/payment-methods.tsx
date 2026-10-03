'use client';

import { CreditCard, ArrowUpRight } from 'lucide-react';
import { paymentMethods } from '@/lib/checkout-pricing.mjs';
import CardPaymentFields from './card-payment-fields';

export default function PaymentMethods({
  value,
  onChange,
}: {
  value: string;
  onChange: (method: string) => void;
}) {
  return (
    <div className="payment-methods">
      <fieldset className="payment-method-picker">
        <legend>Ödeme yöntemi</legend>
        <div className="payment-method-options">
          {paymentMethods.map((method, index) => (
            <label key={method} data-selected={value === method}>
              <input
                type="radio"
                name="payment-method"
                value={method}
                checked={value === method}
                onChange={() => onChange(method)}
              />
              <span className={`payment-brand payment-brand-${index}`}>
                {index === 0 && <CreditCard size={20} aria-hidden="true" />}
                {method}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {value === 'Kredi Kartı' ? (
        <CardPaymentFields />
      ) : (
        <div className="payment-provider-preview" role="region" aria-label={`${value} ile ödeme`}>
          <ArrowUpRight size={26} aria-hidden="true" />
          <div>
            <h3>{value} ile ödeme</h3>
            <p>Seçilen ödeme yöntemi: {value}.</p>
          </div>
        </div>
      )}
    </div>
  );
}
