import { validateCart } from './cart.mjs';
import { products } from './products';
import { paymentMethods, previewTotals } from './checkout-pricing.mjs';
import {
  orderStages,
  returnStages,
  returnReasons,
  validateOrderItems,
} from './order-lifecycle.mjs';
export type OrderRow = { id: string; size: string; color?: string; quantity: number };
export type OrderStatus =
  'pending' | 'received' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderAddress = {
  name: string;
  phone: string;
  city: string;
  district: string;
  address: string;
};
export type CheckoutSelection = {
  coupon: string;
  paymentMethod: string;
  deliveryAddress: OrderAddress;
  billingAddress: string;
};
export type ReturnSelection = { category: string; description: string; items: OrderRow[] };
export type ReturnRequest = {
  status:
    | 'requested'
    | 'in_transit'
    | 'inspection'
    | 'approved'
    | 'refund_pending'
    | 'completed'
    | 'rejected';
  reason: string;
  category?: string;
  description?: string;
  requestedAt: string;
  id?: string;
  items: OrderRow[];
};
export type DemoOrder = {
  id: string;
  date: string;
  rows: OrderRow[];
  status: OrderStatus;
  coupon?: string;
  paymentMethod?: string;
  deliveryAddress?: OrderAddress;
  billingAddress?: string;
  shipment?: { carrier: string; trackingNumber: string };
  returnRequest?: ReturnRequest;
  returnRequests?: ReturnRequest[];
  cancelledRows?: OrderRow[];
  example?: boolean;
};
const bounded = (value: unknown, max: number) =>
  typeof value === 'string' ? value.slice(0, max) : '';
export function snapshotAddress(value: unknown): OrderAddress | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const source = value as Record<string, unknown>;
  return {
    name: bounded(source.name, 100),
    phone: bounded(source.phone, 30),
    city: bounded(source.city, 100),
    district: bounded(source.district, 100),
    address: bounded(source.address, 500),
  };
}
export function addressText(address?: OrderAddress) {
  return address
    ? [address.name, address.address, [address.district, address.city].filter(Boolean).join(' / ')]
        .filter(Boolean)
        .join('\n')
    : '';
}
export const ORDERS_KEY = 'mosso-demo-orders-v1';
function readReturns(value: unknown, rows: OrderRow[], cancelledRows: OrderRow[]): ReturnRequest[] {
  if (!Array.isArray(value)) return [];
  const returns: ReturnRequest[] = [];
  for (const source of value.slice(0, 100)) {
    if (
      !source ||
      ![...returnStages.map((stage) => stage.key), 'rejected'].includes(source.status) ||
      typeof source.reason !== 'string' ||
      !Number.isFinite(Date.parse(source.requestedAt))
    )
      continue;
    const items = validateOrderItems(
      { rows, cancelledRows, returnRequests: returns },
      validateCart(source.items ?? rows, products),
    );
    if (!items.length) continue;
    returns.push({
      id: bounded(source.id, 100) || `LEGACY-${returns.length}`,
      status: source.status,
      reason: bounded(source.reason, 1000),
      category: returnReasons.some((reason) => reason.key === source.category)
        ? source.category
        : undefined,
      description: bounded(source.description, 1000),
      requestedAt: source.requestedAt,
      items,
    });
  }
  return returns;
}
const exampleAddress: OrderAddress = {
  name: 'Emirhan Emre',
  phone: '551*****34',
  city: 'Sakarya',
  district: 'Serdivan',
  address:
    'Kemalpaşa Mahallesi, Üniversite Caddesi, No: 39A\nKat: 2, Daire: 9B\nİmren House karşısı, renkli bina',
};
export function refreshExampleOrder(order: DemoOrder): DemoOrder {
  if (!order.example || !/^DEMO-[1-4]ABC$/.test(order.id)) return order;
  const shipped = ['shipped', 'delivered'].includes(order.status);
  return {
    ...order,
    deliveryAddress: { ...exampleAddress },
    billingAddress: addressText(exampleAddress),
    shipment: {
      carrier: 'Aras Kargo',
      trackingNumber: shipped ? `900000000000${order.id.charAt(5)}` : '',
    },
  };
}
export function readDemoOrders(): DemoOrder[] {
  try {
    const data = JSON.parse(sessionStorage.getItem(ORDERS_KEY) || '[]');
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (o) =>
          o &&
          /^DEMO-[A-F0-9-]+$/i.test(o.id) &&
          typeof o.date === 'string' &&
          Number.isFinite(Date.parse(o.date)) &&
          ['created', 'pending', 'cancelled', ...orderStages.map((stage) => stage.key)].includes(
            o.status,
          ),
      )
      .slice(0, 50)
      .map((o) => {
        const rows = validateCart(o.rows, products);
        const cancelledRows =
          o.status === 'cancelled'
            ? rows.map((row) => ({ ...row }))
            : validateOrderItems({ rows }, validateCart(o.cancelledRows, products));
        return {
          id: o.id,
          date: o.date,
          status: (o.status === 'created' ? 'received' : o.status) as OrderStatus,
          rows,
          cancelledRows,
          coupon: previewTotals([], products, o.coupon).coupon,
          paymentMethod: paymentMethods.includes(o.paymentMethod) ? o.paymentMethod : 'Kredi Kartı',
          deliveryAddress: snapshotAddress(o.deliveryAddress),
          billingAddress: bounded(o.billingAddress, 800),
          shipment:
            o.shipment && typeof o.shipment === 'object'
              ? {
                  carrier: bounded(o.shipment.carrier, 100),
                  trackingNumber: bounded(o.shipment.trackingNumber, 100),
                }
              : undefined,
          returnRequests: readReturns(
            o.returnRequests ?? (o.returnRequest ? [o.returnRequest] : []),
            rows,
            cancelledRows,
          ),
          example: o.example === true,
        };
      })
      .filter((o) => o.rows.length)
      .map(refreshExampleOrder);
  } catch {
    return [];
  }
}
export function exampleOrders(): DemoOrder[] {
  return orderStages.map((stage, index) =>
    refreshExampleOrder({
      id: `DEMO-${index + 1}ABC`,
      date: new Date(Date.now() - index * 86400000).toISOString(),
      status: stage.key as OrderStatus,
      rows: [
        {
          id: products[index].id,
          size: products[index].sizes[0],
          color: products[index].colors[0].name,
          quantity: 2,
        },
        {
          id: products[(index + 1) % products.length].id,
          size: products[(index + 1) % products.length].sizes[0],
          color: products[(index + 1) % products.length].colors[0].name,
          quantity: 1,
        },
      ],
      paymentMethod: 'Kredi Kartı',
      example: true,
    }),
  );
}
