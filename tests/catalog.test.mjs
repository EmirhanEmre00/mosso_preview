import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCatalog } from '../lib/catalog.mjs';
const catalog = [
  {
    id: 'a',
    name: 'Mor Şal',
    category: 'Şal & Eşarp',
    groups: ['Tesettür'],
    price: 299,
    oldPrice: 499,
    sizes: ['Standart'],
    colors: [{ name: 'Mor' }],
  },
  {
    id: 'b',
    name: 'Mor Triko',
    category: 'Triko & Hırka',
    price: 799,
    sizes: ['M'],
    colors: [{ name: 'Mor' }],
  },
  {
    id: 'c',
    name: 'Mavi Gömlek',
    category: 'Gömlek',
    price: 649,
    sizes: ['M'],
    colors: [{ name: 'Mavi' }],
  },
];
test('birleşik filtreler OR değil AND olarak uygulanır', () => {
  assert.deepEqual(
    filterCatalog(catalog, { color: 'Mor', max: '500', sale: true }).map((p) => p.id),
    ['a'],
  );
  assert.equal(filterCatalog(catalog, { color: 'Mor', size: 'M', max: '500' }).length, 0);
});
test('ürün birden çok koleksiyonda keşfedilebilir; Türkçe arama desteklenir', () => {
  assert.deepEqual(
    filterCatalog(catalog, { category: 'Tesettür', query: 'ŞAL' }).map((p) => p.id),
    ['a'],
  );
  assert.equal(filterCatalog(catalog, {}).length, 3);
});
test('ters fiyat aralığı yanlış sonuç döndürmez', () => {
  assert.equal(filterCatalog(catalog, { min: '900', max: '100' }).length, 0);
});
