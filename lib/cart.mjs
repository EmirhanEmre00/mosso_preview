// Only a local preview cart. A future server must validate every price and stock.
export const cartRowKey = (row) => JSON.stringify([row.id, row.size, row.color || '']);
export function validateCart(value, catalog) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .filter((row) => {
      if (!row || typeof row !== 'object') return false;
      const product = catalog.find((p) => p.id === row.id);
      const color = row.color ?? product?.colors?.[0]?.name;
      const key = cartRowKey({ ...row, color });
      if (
        !product ||
        !product.sizes.includes(row.size) ||
        (product.colors && !product.colors.some((item) => item.name === color)) ||
        !Number.isInteger(row.quantity) ||
        row.quantity < 1 ||
        row.quantity > 10 ||
        seen.has(key)
      )
        return false;
      seen.add(key);
      return true;
    })
    .map(({ id, size, color, quantity }) => {
      const selectedColor = color ?? catalog.find((product) => product.id === id).colors?.[0]?.name;
      return { id, size, ...(selectedColor ? { color: selectedColor } : {}), quantity };
    });
}
export function cartTotal(cart, catalog) {
  return validateCart(cart, catalog).reduce(
    (total, row) => total + catalog.find((p) => p.id === row.id).price * row.quantity,
    0,
  );
}
