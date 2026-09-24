import test from 'node:test';
import assert from 'node:assert/strict';
import { categoryNavigation, categoryPath, categories } from '../lib/categories.mjs';
import { filterCatalog } from '../lib/catalog.mjs';
import { products } from '../lib/products.ts';

test('alt başlıklar kendi ailelerinde kalır ve şalın yolu Tesettür üzerinden geçer', () => {
  assert.deepEqual(categoryNavigation('Alt Giyim'), ['Alt Giyim', 'Pantolon', 'Etek', 'Şort']);
  assert.deepEqual(categoryPath('Şal & Eşarp'), ['Tesettür', 'Şal & Eşarp']);
  assert.deepEqual(categoryPath('Sweatshirt'), ['Üst Giyim', 'Sweatshirt']);
  assert.ok(!categoryNavigation('Sweatshirt').includes('Şal & Eşarp'));
});
test('gerçek katalogda ebeveynler çocuklarını kapsar, tüm ürünlerin geçerli yolu vardır', () => {
  for (const product of products) {
    assert.ok(categories.includes(product.category));
    for (const category of categoryPath(product.category)) {
      assert.ok(filterCatalog(products, { category }).some((p) => p.id === product.id));
    }
  }
  assert.equal(filterCatalog(products, { category: 'Alt Giyim' }).length, 6);
  assert.ok(
    filterCatalog(products, { category: 'Alt Giyim' }).every((p) =>
      ['Pantolon', 'Etek', 'Şort'].includes(p.category),
    ),
  );
  assert.ok(filterCatalog(products, { category: 'Tesettür' }).some((p) => p.id === 'mor-sal'));
});
