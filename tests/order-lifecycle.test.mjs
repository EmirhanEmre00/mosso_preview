import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cancelOrder,
  canCancelOrder,
  canRequestReturn,
  requestOrderReturn,
  availableOrderRows,
  getReturnRequests,
  orderStages,
  returnReasons,
} from '../lib/order-lifecycle.mjs';

const tunic = { id: 'tunik', size: 'M', color: 'Lila', quantity: 2 };
const jeans = { id: 'jean', size: '36', color: 'İndigo', quantity: 1 };
const oneTunic = { ...tunic, quantity: 1 };
const makeOrder = (status = 'received') => ({
  id: 'DEMO-1',
  status,
  rows: [{ ...tunic }, { ...jeans }],
});
const returnSelection = (items = [oneTunic], category = 'size', description = '') => ({
  items,
  category,
  description,
});

test('hazırlık aşamasından itibaren iptal hem arayüz hem işlem seviyesinde engellenir', () => {
  for (const { key: status } of orderStages.slice(1)) {
    const order = makeOrder(status);
    assert.equal(canCancelOrder(order), false);
    assert.equal(cancelOrder(order, [tunic]), order);
  }
  for (const status of ['pending', 'received']) {
    const order = makeOrder(status);
    assert.equal(canCancelOrder(order), true);
    assert.equal(cancelOrder(order, order.rows).status, 'cancelled');
  }
  for (const status of ['cancelled', 'unknown']) {
    const order = makeOrder(status);
    assert.equal(canCancelOrder(order), false);
    assert.equal(cancelOrder(order, order.rows), order);
  }
});

test('kısmi iptal diğer ürünleri ve orijinal siparişi değiştirmez; sadece seçilen adet düşer', () => {
  const order = makeOrder();
  const partial = cancelOrder(order, [oneTunic]);
  assert.equal(partial.status, 'received');
  assert.deepEqual(partial.cancelledRows, [oneTunic]);
  assert.deepEqual(availableOrderRows(partial), [oneTunic, jeans]);
  assert.deepEqual(order.rows, [tunic, jeans]);
  assert.equal(order.cancelledRows, undefined);
  const more = cancelOrder(partial, [oneTunic]);
  assert.equal(more.status, 'received');
  assert.deepEqual(more.cancelledRows, [tunic]);
  const all = cancelOrder(more, [jeans]);
  assert.equal(all.status, 'cancelled');
  assert.deepEqual(availableOrderRows(all), []);
});

test('ürün seçmeden veya geçersiz seçimle bütün sipariş yanlışlıkla işleme alınmaz', () => {
  const order = makeOrder();
  assert.equal(cancelOrder(order), order);
  assert.equal(requestOrderReturn(order, { category: 'size', description: '' }), order);
  for (const items of [
    [],
    null,
    [null],
    [oneTunic, oneTunic],
    [{ ...oneTunic, id: 'unknown' }],
    [{ ...oneTunic, size: 'XXL' }],
    [{ ...oneTunic, color: 'Siyah' }],
    ...[0, -1, 1.5, 3].map((quantity) => [{ ...tunic, quantity }]),
    [oneTunic, { ...jeans, quantity: 2 }],
  ]) {
    assert.equal(cancelOrder(order, items), order);
    assert.equal(requestOrderReturn(order, returnSelection(items)), order);
  }
});

test('iade teslimatı beklemeden yalnız seçilen ürünle talep olarak başlar, otomatik tamamlanmaz', () => {
  for (const status of ['pending', ...orderStages.map((stage) => stage.key)]) {
    const order = makeOrder(status);
    const requested = requestOrderReturn(
      order,
      returnSelection([oneTunic], 'size', ' Beden uygun olmadı. '),
      '2026-10-02T10:00:00Z',
    );
    const request = requested.returnRequests[0];
    assert.match(request.id, /^RETURN-/);
    assert.equal(requested.status, status);
    assert.deepEqual(request.items, [oneTunic]);
    assert.equal(request.status, 'requested');
    assert.equal(request.category, 'size');
    assert.equal(request.reason, 'Beden uygun değil');
    assert.equal(request.description, 'Beden uygun olmadı.');
    assert.equal(request.requestedAt, '2026-10-02T10:00:00Z');
    assert.equal(order.returnRequests, undefined);
    assert.deepEqual(order.rows, [tunic, jeans]);
  }
});

test('iptal ve iadeler aynı adetleri paylaşamaz, kalan ürünler için ayrı talep açılabilir', () => {
  const order = cancelOrder(makeOrder(), [oneTunic]);
  const requested = requestOrderReturn(order, returnSelection([oneTunic]));
  assert.deepEqual(availableOrderRows(requested), [jeans]);
  assert.equal(canRequestReturn(requested), true);
  assert.equal(canCancelOrder(requested), true);
  assert.equal(requestOrderReturn(requested, returnSelection([oneTunic])), requested);
  assert.equal(cancelOrder(requested, [oneTunic]), requested);
  const second = requestOrderReturn(requested, returnSelection([jeans], 'fit'));
  assert.equal(second.returnRequests.length, 2);
  assert.deepEqual(second.returnRequests[1].items, [jeans]);
  assert.equal(second.returnRequests[0].status, 'requested');
  assert.equal(canRequestReturn(second), false);
  assert.equal(canCancelOrder(second), false);
  assert.equal(second.status, 'received');
});

test('aynı ürün ve bedenin farklı renkleri ayrı kalır', () => {
  const black = { ...tunic, color: 'Siyah' };
  const order = { ...makeOrder(), rows: [tunic, black] };
  const requested = requestOrderReturn(order, returnSelection([tunic]));
  assert.deepEqual(availableOrderRows(requested), [black]);
  assert.deepEqual(requested.returnRequests[0].items, [tunic]);
  const cancelled = cancelOrder(requested, [black]);
  assert.deepEqual(cancelled.cancelledRows, [black]);
  assert.equal(cancelled.status, 'received');
});

test('eski bütün sipariş iade kaydı korunur, tamamlanan adetler tekrar kullanılamaz', () => {
  const order = { ...makeOrder(), returnRequest: { status: 'requested', reason: 'Eski neden' } };
  assert.deepEqual(getReturnRequests(order)[0].items, order.rows);
  assert.equal(canRequestReturn(order), false);
  assert.equal(canCancelOrder(order), false);
  const completed = { ...makeOrder(), returnRequests: [{ status: 'completed', items: [tunic] }] };
  assert.deepEqual(availableOrderRows(completed), [jeans]);
  const rejected = { ...makeOrder(), returnRequests: [{ status: 'rejected', items: [tunic] }] };
  assert.deepEqual(availableOrderRows(rejected), [tunic, jeans]);
});

test('geçersiz iade durumu, kategori ve açıklama işlem oluşturmaz', () => {
  for (const status of ['cancelled', 'unknown']) {
    const order = makeOrder(status);
    assert.equal(requestOrderReturn(order, returnSelection()), order);
  }
  const order = makeOrder();
  for (const selection of [
    null,
    '',
    {},
    returnSelection([oneTunic], 'unknown'),
    returnSelection([oneTunic], 'changed_mind'),
    returnSelection([oneTunic], 'size', null),
    returnSelection([oneTunic], 'size', 'x'.repeat(1001)),
  ])
    assert.equal(requestOrderReturn(order, selection), order);
});

test('neden listeden gelir; ek açıklama isteğe bağlıdır', () => {
  for (const { key, label } of returnReasons) {
    const requested = requestOrderReturn(makeOrder(), returnSelection([oneTunic], key));
    assert.equal(requested.returnRequests[0].category, key);
    assert.equal(requested.returnRequests[0].reason, label);
    assert.equal(requested.returnRequests[0].description, '');
  }
});
