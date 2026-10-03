import { validAddress, validPhone } from './contact-validation.mjs';

export const ADDRESSES_KEY = 'mosso-demo-addresses-v1';
export const ACCOUNT_KEY = 'mosso-demo-account-v1';
export const emptyProfile = {
  name: '',
  surname: '',
  email: '',
  phone: '',
  birthday: '',
  gender: '',
};
export const defaultPreferences = {
  email: true,
  sms: true,
  new: true,
  discount: true,
  order: true,
};

export function validateAddresses(value) {
  if (!Array.isArray(value)) return [];
  const ids = new Set();
  return value.flatMap((entry) => {
    if (
      !entry ||
      typeof entry !== 'object' ||
      !Number.isSafeInteger(entry.id) ||
      entry.id <= 0 ||
      ids.has(entry.id) ||
      !validAddress(entry)
    )
      return [];
    ids.add(entry.id);
    return [
      {
        id: entry.id,
        title: entry.title.trim().slice(0, 100),
        name: entry.name.trim().slice(0, 100),
        phone: entry.phone,
        city: entry.city,
        district: entry.district,
        address: entry.address.trim().slice(0, 500),
      },
    ];
  });
}

export function validateAccount(value) {
  const profile = { ...emptyProfile };
  const preferences = { ...defaultPreferences };
  for (const key of Object.keys(profile)) {
    const text = value?.profile?.[key];
    if (typeof text === 'string') profile[key] = text.trim().slice(0, key === 'email' ? 254 : 100);
  }
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) profile.email = '';
  if (!validPhone(profile.phone, true)) profile.phone = '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.birthday)) profile.birthday = '';
  if (!['Kadın', 'Erkek', 'Belirtmek istemiyorum'].includes(profile.gender)) profile.gender = '';
  for (const key of Object.keys(preferences)) {
    if (typeof value?.preferences?.[key] === 'boolean') preferences[key] = value.preferences[key];
  }
  return { profile, preferences };
}

export function readSessionValue(key, validate) {
  try {
    return validate(JSON.parse(sessionStorage.getItem(key) || 'null'));
  } catch {
    return validate(null);
  }
}

export function writeSessionValue(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep in-memory editing available when browser storage is blocked.
  }
}
