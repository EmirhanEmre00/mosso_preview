import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCart, cartTotal } from '../lib/cart.mjs';
const catalog = [{ id: 'tunik', sizes: ['S', 'M'], price: 899 }];
const coloredCatalog = [{ ...catalog[0], colors: [{ name: 'Lila' }, { name: 'Siyah' }] }];

test('seçilen renk korunur; farklı renkler ayrı varyantlar olarak fiyatlanır', () => {
  const rows = [
    { id: 'tunik', size: 'M', color: 'Lila', quantity: 1 },
    { id: 'tunik', size: 'M', color: 'Siyah', quantity: 2 },
  ];
  assert.deepEqual(validateCart(rows, coloredCatalog), rows);
  assert.equal(cartTotal(rows, coloredCatalog), 2697);
  assert.deepEqual(validateCart([...rows, rows[0]], coloredCatalog), rows);
});

test('eski renksiz kayıt ilk rengi alır, katalog dışı renk reddedilir', () => {
  const row = { id: 'tunik', size: 'M', quantity: 1 };
  assert.deepEqual(validateCart([row], coloredCatalog), [{ ...row, color: 'Lila' }]);
  assert.deepEqual(validateCart([{ ...row, color: 'Bilinmeyen' }], coloredCatalog), []);
  assert.deepEqual(validateCart([row, { ...row, color: 'Lila' }], coloredCatalog), [
    { ...row, color: 'Lila' },
  ]);
});
test('bozuk tarayıcı kaydı ve geçersiz varyantlar uygulamayı bozamaz', () => {
  assert.deepEqual(validateCart(null, catalog), []);
  assert.deepEqual(
    validateCart(
      [null, { id: 'unknown', size: 'M', quantity: 1 }, { id: 'tunik', size: 'XXXL', quantity: 1 }],
      catalog,
    ),
    [],
  );
});
test('negatif, kesirli ve aşırı adetler reddedilir; aynı varyant yinelenmez', () => {
  const rows = [-1, 0, 1.5, 11, 2, 2].map((quantity) => ({ id: 'tunik', size: 'M', quantity }));
  assert.deepEqual(validateCart(rows, catalog), [{ id: 'tunik', size: 'M', quantity: 2 }]);
});
test('tarayıcı kaydına eklenen sahte fiyat kullanılmaz', () => {
  const rows = [{ id: 'tunik', size: 'S', quantity: 2, price: 1 }];
  assert.equal(cartTotal(rows, catalog), 1798);
  assert.deepEqual(validateCart(rows, catalog), [{ id: 'tunik', size: 'S', quantity: 2 }]);
  // Not a security boundary: production pricing must be server-validated.
});
