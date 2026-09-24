// Canonical parents define navigation; product groups allow curated collections.
export const categoryTree = {
  Elbise: ['Günlük Elbise', 'Davet Elbisesi'],
  Tesettür: ['Tunik', 'Şal & Eşarp'],
  'Üst Giyim': ['Tişört', 'Crop', 'Askılı Üst', 'Bluz', 'Gömlek', 'Triko & Hırka', 'Sweatshirt'],
  'Alt Giyim': ['Pantolon', 'Etek', 'Şort'],
  Takım: ['Günlük Takım', 'Crop Takım'],
  'Dış Giyim': ['Blazer', 'Kot Ceket', 'Kaban'],
};
export const rootCategories = Object.keys(categoryTree);
export const navigationCategories = ['Yeni Gelenler', ...rootCategories];
export const categories = [
  'Tümü',
  'Yeni Gelenler',
  ...rootCategories,
  ...Object.values(categoryTree).flat(),
];
export function categoryPath(category) {
  const parent = rootCategories.find((root) => categoryTree[root].includes(category));
  return parent ? [parent, category] : [category];
}
export function categoryNavigation(category) {
  if (category === 'Tümü' || category === 'Yeni Gelenler') return rootCategories;
  const root = categoryPath(category)[0];
  const children = categoryTree[root] || [];
  return children.length ? [root, ...children] : [];
}
export function belongsToCategory(product, category) {
  return (
    category === 'Tümü' ||
    (category === 'Yeni Gelenler' && product.tag === 'YENİ') ||
    categoryPath(product.category).includes(category) ||
    product.groups?.includes(category)
  );
}
