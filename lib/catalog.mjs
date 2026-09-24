import { belongsToCategory } from './categories.mjs';
export function filterCatalog(
  catalog,
  {
    category = 'Tümü',
    query = '',
    size = 'Tümü',
    color = 'Tümü',
    min = '',
    max = '',
    sale = false,
  } = {},
) {
  const needle = query.trim().toLocaleLowerCase('tr');
  return catalog.filter(
    (p) =>
      belongsToCategory(p, category) &&
      `${p.name} ${p.category} ${p.colors.map((c) => c.name).join(' ')}`
        .toLocaleLowerCase('tr')
        .includes(needle) &&
      (size === 'Tümü' || p.sizes.includes(size)) &&
      (color === 'Tümü' || p.colors.some((c) => c.name === color)) &&
      (!min || p.price >= Number(min)) &&
      (!max || p.price <= Number(max)) &&
      (!sale || (p.oldPrice && p.oldPrice > p.price)),
  );
}
