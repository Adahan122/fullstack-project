export function normalizePrice(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getPriceBounds(products) {
  const prices = products
    .map((item) => normalizePrice(item.price))
    .filter((price) => price > 0);

  if (prices.length === 0) {
    return { minPrice: 0, maxPrice: 10000 };
  }

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  };
}

export function getBrandOptions(products) {
  return Array.from(new Set(products.map((item) => item.brand).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function filterProducts(products, filters) {
  const { category, priceRange, selectedBrands, searchQuery } = filters;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return products.filter((item) => {
    const itemPrice = normalizePrice(item.price);
    const itemOldPrice = normalizePrice(item.oldPrice || item.old_price);
    const matchesSearch =
      !normalizedQuery ||
      [item.name, item.brand].some((value) => value?.toLowerCase().includes(normalizedQuery));

    const matchesCategory =
      category === "all" ||
      (category === "New" && Boolean(item.is_new)) ||
      (category === "Sale" && (Boolean(item.is_sale) || itemOldPrice > itemPrice)) ||
      (category !== "New" && category !== "Sale" && item.category === category);

    const matchesPrice = itemPrice >= priceRange[0] && itemPrice <= priceRange[1];
    const matchesBrand =
      selectedBrands.length === 0 ||
      selectedBrands.some((brand) => brand.toLowerCase() === item.brand?.toLowerCase());

    return matchesSearch && matchesCategory && matchesPrice && matchesBrand;
  });
}

export function getRecommendedProducts(products, limit = 12) {
  return [...products]
    .filter((item) => item.rating)
    .sort(
      (a, b) =>
        (Number(b.reviews) || 0) + (Number(b.rating) || 0) - ((Number(a.reviews) || 0) + (Number(a.rating) || 0)),
    )
    .slice(0, limit);
}
