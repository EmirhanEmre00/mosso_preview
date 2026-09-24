// Only a local preview cart. A future server must validate every price and stock.
export function validateCart(value, catalog) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .filter((row) => {
      if (!row || typeof row !== 'object') return false;
      const product = catalog.find((p) => p.id === row.id);
      const key = `${row.id}:${row.size}`;
      if (
        !product ||
        !product.sizes.includes(row.size) ||
        !Number.isInteger(row.quantity) ||
        row.quantity < 1 ||
        row.quantity > 10 ||
        seen.has(key)
      )
        return false;
      seen.add(key);
      return true;
    })
    .map(({ id, size, quantity }) => ({ id, size, quantity }));
}
export function cartTotal(cart, catalog) {
  return validateCart(cart, catalog).reduce(
    (total, row) => total + catalog.find((p) => p.id === row.id).price * row.quantity,
    0,
  );
}
