'use client';
import { useEffect, useState } from 'react';
import { provinces, districtsFor } from '@/lib/contact-validation.mjs';
import provinceIds from '@/lib/data/neighborhood-provinces.json';
import { sitePath } from '@/lib/site-path';

type Neighborhoods = Record<string, string[]>;
const pending = new Map<number, Promise<Neighborhoods>>();
function loadNeighborhoods(id: number) {
  let request = pending.get(id);
  if (!request) {
    request = fetch(sitePath(`/data/neighborhoods/${id}.json`))
      .then(async (response) => {
        if (!response.ok) throw new Error('Neighborhood list unavailable');
        const data: unknown = await response.json();
        if (
          !data ||
          typeof data !== 'object' ||
          Array.isArray(data) ||
          !Object.values(data).every(
            (names) => Array.isArray(names) && names.every((name) => typeof name === 'string'),
          )
        )
          throw new Error('Invalid neighborhood list');
        return data as Neighborhoods;
      })
      .catch((error) => {
        pending.delete(id);
        throw error;
      });
    pending.set(id, request);
  }
  return request;
}

export default function LocationFields({
  city,
  district,
  neighborhood,
  onChange,
}: {
  city: string;
  district: string;
  neighborhood: string;
  onChange: (value: { city: string; district: string; neighborhood: string }) => void;
}) {
  const districts: string[] = districtsFor(city);
  const [result, setResult] = useState<{ city: string; options: Neighborhoods; failed: boolean }>();
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const id = provinceIds[city as keyof typeof provinceIds];
    if (!id) return;
    let active = true;
    setResult(undefined);
    loadNeighborhoods(id).then(
      (options) => {
        if (active) setResult({ city, options, failed: false });
      },
      () => {
        if (active) setResult({ city, options: {}, failed: true });
      },
    );
    return () => {
      active = false;
    };
  }, [city, retry]);
  const current = result?.city === city ? result : undefined;
  const neighborhoods = current?.options[district] ?? [];
  return (
    <>
      <label>
        İl
        <select
          aria-label="İl"
          required
          autoComplete="address-level1"
          value={city}
          onChange={(event) =>
            onChange({ city: event.target.value, district: '', neighborhood: '' })
          }
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
          onChange={(event) => onChange({ city, district: event.target.value, neighborhood: '' })}
        >
          <option value="" disabled>
            {city ? 'İlçe seç' : 'Önce il seç'}
          </option>
          {districts.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <label>
        Mahalle
        <select
          aria-label="Mahalle"
          required
          autoComplete="address-level3"
          disabled={!district || !neighborhoods.length}
          value={neighborhood}
          onChange={(event) => onChange({ city, district, neighborhood: event.target.value })}
        >
          <option value="" disabled>
            {!district
              ? 'Önce ilçe seç'
              : !current
                ? 'Mahalleler yükleniyor…'
                : current.failed
                  ? 'Liste yüklenemedi'
                  : 'Mahalle seç'}
          </option>
          {neighborhoods.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
        {current?.failed && (
          <span role="alert">
            Mahalle listesi yüklenemedi.{' '}
            <button
              type="button"
              className="text-link"
              onClick={() => setRetry((value) => value + 1)}
            >
              Tekrar dene
            </button>
          </span>
        )}
      </label>
    </>
  );
}
