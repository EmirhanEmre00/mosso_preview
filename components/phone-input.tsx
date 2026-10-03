'use client';
import type { InputHTMLAttributes } from 'react';
import { phoneInput } from '@/lib/contact-validation.mjs';

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'defaultValue'
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};
export default function PhoneInput({ value, defaultValue, onValueChange, ...props }: Props) {
  return (
    <input
      {...props}
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      value={value}
      defaultValue={defaultValue === undefined ? undefined : phoneInput(defaultValue)}
      pattern="0[2-5][0-9]{9}"
      minLength={11}
      maxLength={18}
      placeholder="0532 123 45 67"
      title="Telefon numaranı 0 ile başlayan 11 rakam olarak gir."
      onChange={(event) => {
        const next = phoneInput(event.currentTarget.value);
        if (onValueChange) onValueChange(next);
        else event.currentTarget.value = next;
      }}
    />
  );
}
