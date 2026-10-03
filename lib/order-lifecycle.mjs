import { cartRowKey } from './cart.mjs';

export const orderStages = [
  { key: 'received', label: 'Sipariş alındı' },
  { key: 'preparing', label: 'Hazırlanıyor' },
  { key: 'shipped', label: 'Kargoya verildi' },
  { key: 'delivered', label: 'Teslim edildi' },
];
export const returnStages = [
  { key: 'requested', label: 'İade talebi alındı' },
  { key: 'in_transit', label: 'Ürün geri gönderiliyor' },
  { key: 'inspection', label: 'Ürün alındı, inceleniyor' },
  { key: 'approved', label: 'Mağaza onayladı' },
  { key: 'refund_pending', label: 'Ödeme iadesi bekleniyor' },
  { key: 'completed', label: 'İade tamamlandı' },
];
export const returnReasons = [
  { key: 'size', label: 'Beden uygun değil' },
  { key: 'fit', label: 'Kalıbı uygun değil' },
  { key: 'expectation', label: 'Beklediğim gibi değil' },
  { key: 'damaged', label: 'Kusurlu / hasarlı ürün' },
  { key: 'wrong_product', label: 'Yanlış ürün gönderildi' },
  { key: 'delivery', label: 'Teslimat sorunu' },
  { key: 'other', label: 'Diğer' },
];
export function orderLabel(status) {
  return (
    orderStages.find((stage) => stage.key === status)?.label ||
    (status === 'pending'
      ? 'Onay bekliyor'
      : status === 'cancelled'
        ? 'İptal edildi'
        : 'Sipariş alındı')
  );
}
export function getReturnRequests(order) {
  return Array.isArray(order.returnRequests)
    ? order.returnRequests
    : order.returnRequest
      ? [{ ...order.returnRequest, items: order.returnRequest.items || order.rows || [] }]
      : [];
}
export function availableOrderRows(order) {
  const reserved = [
    ...(order.cancelledRows || []),
    ...getReturnRequests(order)
      .filter((request) => request.status !== 'rejected')
      .flatMap((request) => request.items || []),
  ];
  return (order.rows || [])
    .map((row) => ({
      ...row,
      quantity:
        row.quantity -
        reserved
          .filter((item) => cartRowKey(item) === cartRowKey(row))
          .reduce((sum, item) => sum + item.quantity, 0),
    }))
    .filter((row) => row.quantity > 0);
}
export function orderOverview(order) {
  const hasActiveItems = availableOrderRows(order).length > 0 && order.status !== 'cancelled';
  const cancelled = (order.cancelledRows || []).some((row) => row.quantity > 0);
  const requests = getReturnRequests(order).filter(
    (request) => request.status !== 'rejected' && request.items?.some((row) => row.quantity > 0),
  );
  if (order.status === 'cancelled' || (!hasActiveItems && cancelled && !requests.length))
    return { label: 'İptal edildi', description: 'Siparişin iptal edildi.', hasActiveItems: false };
  if (!hasActiveItems && requests.length) {
    const completed = requests.every((request) => request.status === 'completed');
    return {
      label: cancelled
        ? completed
          ? 'İptal ve iade tamamlandı'
          : 'İptal ve iade sürecinde'
        : completed
          ? 'İade tamamlandı'
          : 'İade sürecinde',
      description: completed
        ? 'İade işlemleri tamamlandı. Ürünlerin durumlarını aşağıda görebilirsin.'
        : 'İade taleplerini aşağıdan takip edebilirsin. İade, ürün kontrolü ve mağaza onayından sonra tamamlanır.',
      hasActiveItems: false,
    };
  }
  return {
    label: orderLabel(order.status),
    description:
      {
        pending: 'Siparişini kontrol ediyoruz.',
        received: 'Seçimlerin bize ulaştı, sırada özenle hazırlamak var.',
        preparing: 'Seçimlerin senin için özenle hazırlanıyor.',
        shipped: 'Siparişin yola çıktı, yeni favorilerin sana geliyor.',
        delivered: 'Güle güle kullan, yeni favorilerinle güzel günlere!',
      }[order.status] || '',
    hasActiveItems,
  };
}
export function validateOrderItems(order, items) {
  if (!Array.isArray(items) || !items.length) return [];
  const available = availableOrderRows(order);
  const seen = new Set();
  const selected = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') return [];
    const key = cartRowKey(item);
    const row = available.find((row) => cartRowKey(row) === key);
    if (
      !row ||
      seen.has(key) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > row.quantity
    )
      return [];
    seen.add(key);
    selected.push({ ...row, quantity: item.quantity });
  }
  return selected;
}
export function canCancelOrder(order) {
  return ['pending', 'received'].includes(order.status) && availableOrderRows(order).length > 0;
}
export function cancelOrder(order, items) {
  const selected = validateOrderItems(order, items);
  if (!canCancelOrder(order) || !selected.length) return order;
  const cancelledRows = [...(order.cancelledRows || [])];
  for (const item of selected) {
    const index = cancelledRows.findIndex((row) => cartRowKey(row) === cartRowKey(item));
    if (index === -1) cancelledRows.push(item);
    else
      cancelledRows[index] = {
        ...cancelledRows[index],
        quantity: cancelledRows[index].quantity + item.quantity,
      };
  }
  const allCancelled = (order.rows || []).every((row) =>
    cancelledRows.some(
      (item) => cartRowKey(item) === cartRowKey(row) && item.quantity === row.quantity,
    ),
  );
  return { ...order, cancelledRows, status: allCancelled ? 'cancelled' : order.status };
}
export function canRequestReturn(order) {
  return (
    ['pending', ...orderStages.map((stage) => stage.key)].includes(order.status) &&
    availableOrderRows(order).length > 0
  );
}
export function requestOrderReturn(order, selection, date = new Date().toISOString()) {
  const reason = returnReasons.find((item) => item.key === selection?.category);
  const items = validateOrderItems(order, selection?.items);
  if (
    !canRequestReturn(order) ||
    !reason ||
    !items.length ||
    typeof selection.description !== 'string' ||
    selection.description.length > 1000
  )
    return order;
  return {
    ...order,
    returnRequest: undefined,
    returnRequests: [
      ...getReturnRequests(order),
      {
        id: `RETURN-${crypto.randomUUID()}`,
        status: 'requested',
        category: reason.key,
        reason: reason.label,
        description: selection.description.trim(),
        requestedAt: date,
        items,
      },
    ],
  };
}
