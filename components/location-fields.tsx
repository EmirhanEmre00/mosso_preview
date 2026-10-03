'use client';
import { provinces, districtsFor } from '@/lib/contact-validation.mjs';

export default function LocationFields({
  city,
  district,
  onChange,
}: {
  city: string;
  district: string;
  onChange: (value: { city: string; district: string }) => void;
}) {
  const districts: string[] = districtsFor(city);
  return (
    <>
      <label>
        İl
        <select
          aria-label="İl"
          required
          autoComplete="address-level1"
          value={city}
          onChange={(event) => onChange({ city: event.target.value, district: '' })}
        >
          <option value="" disabled>
            İl seç
          </option>
          {provinces.map((name: string) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <label>
        İlçe
        <select
          aria-label="İlçe"
          required
          autoComplete="address-level2"
          disabled={!districts.length}
          value={district}
          onChange={(event) => onChange({ city, district: event.target.value })}
        >
          <option value="" disabled>
            {city ? 'İlçe seç' : 'Önce il seç'}
          </option>
          {districts.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
    </>
  );
}
