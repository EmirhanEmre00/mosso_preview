import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCart, cartTotal } from '../lib/cart.mjs';
const catalog = [{ id: 'tunik', sizes: ['S', 'M'], price: 899 }];
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
