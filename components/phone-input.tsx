'use client';
import { useState, type InputHTMLAttributes } from 'react';
import { phoneInput, phoneDisplay } from '@/lib/contact-validation.mjs';

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'defaultValue'
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};
export default function PhoneInput({
  value,
  defaultValue,
  onValueChange,
  name,
  onKeyDown,
  ...props
}: Props) {
  const [local, setLocal] = useState(() => phoneInput(defaultValue ?? ''));
  const current = value ?? local;
  const update = (text: string) => {
    const digits = phoneInput(text);
    const next = digits ? (digits.startsWith('0') ? digits : `0${digits}`) : '';
    setLocal(next);
    onValueChange?.(next);
  };
  return (
    <span className="phone-field">
      <span className="phone-country" aria-hidden="true">
        +90
      </span>
      <input
        {...props}
        aria-label={props['aria-label'] ?? 'Telefon'}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={phoneDisplay(current)}
        pattern="[2-5][0-9]{2} [0-9]{3} [0-9]{4}"
        maxLength={20}
        placeholder="532 324 4356"
        title="Telefon numaranı ülke kodu olmadan 10 rakam olarak gir."
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          const input = event.currentTarget;
          const start = input.selectionStart ?? 0;
          const end = input.selectionEnd ?? start;
          if (event.key === 'Backspace' && start === end && input.value[start - 1] === ' ') {
            event.preventDefault();
            update(input.value.slice(0, start - 2) + input.value.slice(start));
            requestAnimationFrame(() => input.setSelectionRange(start - 2, start - 2));
          }
        }}
        onChange={(event) => {
          const input = event.currentTarget;
          const cursor = input.selectionStart ?? input.value.length;
          const before = input.value.slice(0, cursor).replace(/\D/g, '').length;
          const atEnd = cursor === input.value.length;
          update(input.value);
          if (!atEnd)
            requestAnimationFrame(() => {
              let digits = 0;
              let position = 0;
              while (position < input.value.length && digits < before) {
                if (/\d/.test(input.value[position])) digits++;
                position++;
              }
              input.setSelectionRange(position, position);
            });
        }}
      />
      {name && <input type="hidden" name={name} value={current} />}
    </span>
  );
}
