import locations from './data/turkey-locations.json' with { type: 'json' };

export const provinces = locations
  .map((item) => item.name)
  .sort((a, b) => a.localeCompare(b, 'tr'));
export function districtsFor(city) {
  return [...(locations.find((item) => item.name === city)?.districts ?? [])].sort((a, b) =>
    a.localeCompare(b, 'tr'),
  );
}
export function validLocation(city, district) {
  return districtsFor(city).includes(district);
}
// Store national numbers; accept common Turkish international paste formats.
export function phoneInput(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.startsWith('0090')) digits = '0' + digits.slice(4);
  else if (digits.startsWith('90') && digits.length >= 12) digits = '0' + digits.slice(2);
  else if (/^[2-5]\d{9}$/.test(digits)) digits = '0' + digits;
  return digits;
}
export function validPhone(value, optional = false) {
  if (optional && value === '') return true;
  return typeof value === 'string' && /^0[2-5]\d{9}$/.test(value);
}
export function phoneDisplay(value) {
  const national = phoneInput(value);
  const digits = national.startsWith('0') ? national.slice(1) : national;
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join(' ');
}
export function phoneText(value) {
  return validPhone(value) ? `+90 ${phoneDisplay(value)}` : value;
}
export function validPostalCode(value) {
  return (
    value === undefined || value === '' || (typeof value === 'string' && /^\d{5}$/.test(value))
  );
}
export function validAddress(value) {
  return (
    ['title', 'name', 'address'].every(
      (key) => typeof value[key] === 'string' && value[key].trim().length > 0,
    ) &&
    validPhone(value.phone) &&
    validLocation(value.city, value.district) &&
    validPostalCode(value.postalCode)
  );
}
