export function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ru-RU")} ₽`;
}

export function calculateDiscount(price, oldPrice) {
  const current = Number(price);
  const previous = Number(oldPrice);

  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= current) {
    return null;
  }

  const percent = Math.round((1 - current / previous) * 100);
  return percent > 0 ? `-${percent}%` : null;
}
