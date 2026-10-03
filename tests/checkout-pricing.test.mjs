import test from 'node:test';
import assert from 'node:assert/strict';
import { previewTotals } from '../lib/checkout-pricing.mjs';

const catalog = [{ id: 'tunik', sizes: ['M'], price: 899 }];
const rows = [{ id: 'tunik', size: 'M', quantity: 1 }];
test('önizleme kuponu kuruş hassasiyetinde toplamdan düşer', () => {
  assert.deepEqual(previewTotals(rows, catalog, ' mosso10 '), {
    originalTotal: 899,
    productDiscount: 0,
    subtotal: 899,
    coupon: 'MOSSO10',
    discount: 89.9,
    total: 809.1,
    vatRate: 10,
    netTotal: 735.55,
    vat: 73.55,
  });
  assert.equal(previewTotals([{ ...rows[0], quantity: 2 }], catalog, 'MOSSO10').total, 1618.2);
});
test('ürün indirimi ve kupon ayrı hesaplanır; KDV toplamın içinden ayrılır', () => {
  const totals = previewTotals(rows, [{ ...catalog[0], oldPrice: 1199 }], 'MOSSO10');
  assert.equal(totals.originalTotal, 1199);
  assert.equal(totals.productDiscount, 300);
  assert.equal(totals.total, 809.1);
  assert.equal(Math.round((totals.netTotal + totals.vat) * 100), Math.round(totals.total * 100));
  assert.equal(
    Math.round((totals.originalTotal - totals.productDiscount - totals.discount) * 100),
    80910,
  );
  assert.equal(previewTotals(rows, [{ ...catalog[0], oldPrice: 799 }]).productDiscount, 0);
  assert.equal(previewTotals([{ ...rows[0], quantity: 99 }], catalog).originalTotal, 0);
  assert.equal(previewTotals([], catalog).vat, 0);
});
test('geçersiz veya kaldırılmış kupon indirim oluşturmaz; boş sepet eksiye düşmez', () => {
  assert.equal(previewTotals(rows, catalog, 'FAKE90').discount, 0);
  assert.equal(previewTotals(rows, catalog).total, 899);
  assert.equal(previewTotals([], catalog, 'MOSSO10').total, 0);
  assert.equal(previewTotals(rows, catalog, { discount: 5000 }).discount, 0);
});
