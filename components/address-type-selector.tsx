'use client';

import { useId } from 'react';

export type AddressType = 'individual' | 'corporate';

export default function AddressTypeSelector({
  value,
  onChange,
}: {
  value: AddressType;
  onChange: (value: AddressType) => void;
}) {
  const name = useId();
  return (
    <fieldset className="profile-gender account-wide">
      <legend>Adres türü</legend>
      {(
        [
          ['individual', 'Bireysel'],
          ['corporate', 'Kurumsal'],
        ] as const
      ).map(([type, label]) => (
        <label key={type}>
          <input
            type="radio"
            name={name}
            value={type}
            checked={value === type}
            onChange={() => onChange(type)}
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
}
