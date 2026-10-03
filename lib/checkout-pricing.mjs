import { cartTotal, validateCart } from './cart.mjs';

export const paymentMethods = ['Kredi Kartı', 'iyzico', 'PayTR', 'GarantiPay'];
export function previewTotals(rows, catalog, code = '') {
  const validRows = validateCart(rows, catalog);
  const subtotal = Math.round(cartTotal(validRows, catalog) * 100) / 100;
  const originalTotal =
    Math.round(
      validRows.reduce((sum, row) => {
        const product = catalog.find((p) => p.id === row.id);
        const originalPrice = Number.isFinite(product.oldPrice)
          ? Math.max(product.oldPrice, product.price)
          : product.price;
        return sum + originalPrice * row.quantity;
      }, 0) * 100,
    ) / 100;
  const productDiscount = Math.round((originalTotal - subtotal) * 100) / 100;
  const coupon =
    typeof code === 'string' && code.trim().toUpperCase() === 'MOSSO10' ? 'MOSSO10' : '';
  const discount = coupon ? Math.round(subtotal * 10) / 100 : 0;
  const total = Math.round((subtotal - discount) * 100) / 100;
  // Demo only: catalog prices include VAT. Production rates belong to the server's tax model.
  const vatRate = 10;
  const netTotal = Math.round((total * 100) / (1 + vatRate / 100)) / 100;
  const vat = Math.round((total - netTotal) * 100) / 100;
  return {
    originalTotal,
    productDiscount,
    subtotal,
    coupon,
    discount,
    total,
    vatRate,
    netTotal,
    vat,
  };
}
