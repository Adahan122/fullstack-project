import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import SouthRoundedIcon from "@mui/icons-material/SouthRounded";

import Footer from "./Footer";
import Header from "./Header";
import ProductGrid from "./ProductGrid";
import RecommendedSwiper from "./RecommendedSwiper";
import Sidebar from "./Sidebar";
import { useApp } from "../context/app-context";
import { filterProducts, getPriceBounds, getRecommendedProducts } from "../lib/catalog";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useProducts } from "../hooks/useProducts";

function HomePage() {
  const navigate = useNavigate();
  const catalogRef = useRef(null);
  const { hasSeenAuthPrompt, markAuthPromptSeen, user } = useApp();
  const { products, loading, error } = useProducts();
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [authPromoOpen, setAuthPromoOpen] = useState(false);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const debouncedSearchQuery = useDebouncedValue(deferredSearchQuery, 220);
  const isSearchPending = searchQuery !== debouncedSearchQuery;
  const { minPrice, maxPrice } = useMemo(() => getPriceBounds(products), [products]);
  const effectivePriceRange = useMemo(() => priceRange || [minPrice, maxPrice], [maxPrice, minPrice, priceRange]);

  useEffect(() => {
    if (user || hasSeenAuthPrompt) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setAuthPromoOpen(true);
      markAuthPromptSeen();
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasSeenAuthPrompt, markAuthPromptSeen, user]);

  const filteredProducts = useMemo(() => {
    const baseProducts = filterProducts(products, {
      category,
      priceRange: effectivePriceRange,
      selectedBrands,
      searchQuery: debouncedSearchQuery,
    });

    if (!onlyInStock) {
      return baseProducts;
    }

    return baseProducts.filter((item) => Number(item.stock || 0) > 0);
  }, [category, debouncedSearchQuery, effectivePriceRange, onlyInStock, products, selectedBrands]);

  const searchSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return products
      .filter((item) =>
        [item.name, item.brand, item.category].some((value) =>
          value?.toLowerCase().includes(query),
        ),
      )
      .slice(0, 5);
  }, [products, searchQuery]);

  const newProducts = useMemo(() => filteredProducts.filter((item) => item.is_new), [filteredProducts]);
  const recommendedProducts = useMemo(() => getRecommendedProducts(products), [products]);

  const isSidebarFiltered =
    selectedBrands.length > 0 ||
    effectivePriceRange[0] !== minPrice ||
    effectivePriceRange[1] !== maxPrice ||
    onlyInStock ||
    debouncedSearchQuery.trim().length > 0;

  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (category !== "all") {
      chips.push({ key: "category", label: `Категория: ${category}` });
    }

    if (debouncedSearchQuery.trim()) {
      chips.push({ key: "search", label: `Поиск: ${debouncedSearchQuery.trim()}` });
    }

    if (selectedBrands.length > 0) {
      chips.push(...selectedBrands.map((brand) => ({ key: `brand-${brand}`, label: brand })));
    }

    if (onlyInStock) {
      chips.push({ key: "stock", label: "Только в наличии" });
    }

    if (effectivePriceRange[0] !== minPrice || effectivePriceRange[1] !== maxPrice) {
      chips.push({
        key: "price",
        label: `${effectivePriceRange[0].toLocaleString("ru-RU")} - ${effectivePriceRange[1].toLocaleString("ru-RU")} ₽`,
      });
    }

    return chips;
  }, [category, debouncedSearchQuery, effectivePriceRange, minPrice, maxPrice, onlyInStock, selectedBrands]);

  const getCatalogTitle = () => {
    if (category === "all") return "Наш лучший выбор";
    if (category === "Shoes") return "Спортивная обувь";
    if (category === "Clothes") return "Стильная одежда";
    if (category === "Bags") return "Аксессуары и сумки";
    if (category === "New") return "Свежие поступления";
    if (category === "Sale") return "Лучшие скидки";
    return "Результаты поиска";
  };

  const handleScrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((currentBrands) =>
      currentBrands.includes(brand)
        ? currentBrands.filter((currentBrand) => currentBrand !== brand)
        : [...currentBrands, brand],
    );
  };

  const handleSearchChange = (value) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion.name);
    navigate(`/product/${suggestion.id}`);
  };

  const resetSearchExperience = () => {
    setSearchQuery("");
    setCategory("all");
    setSelectedBrands([]);
    setOnlyInStock(false);
    setPriceRange([minPrice, maxPrice]);
  };

  const closePromo = () => setAuthPromoOpen(false);

  return (
    <Box sx={{ bgcolor: "#eef4fb", minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      <Header
        onCategoryChange={setCategory}
        selectedCategory={category}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchSuggestions={searchSuggestions}
        searchResultsCount={filteredProducts.length}
        searchIsPending={isSearchPending}
        onSuggestionSelect={handleSuggestionSelect}
      />

      <Box
        sx={{
          minHeight: { xs: "72vh", md: "68vh" },
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 15% 20%, rgba(125,211,252,0.28) 0%, transparent 22%), radial-gradient(circle at 80% 18%, rgba(96,165,250,0.20) 0%, transparent 24%), linear-gradient(125deg, rgba(15,23,42,0.76) 0%, rgba(15,68,158,0.66) 48%, rgba(37,99,235,0.58) 100%), url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&auto=format&fit=crop&w=1600') center/cover no-repeat",
          mb: 6,
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0.04) 0%, rgba(238,244,251,0.2) 100%)" }} />

        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ maxWidth: "760px", px: { xs: 2, md: 4 } }}>
            <Chip
              icon={<AutoAwesomeIcon sx={{ fontSize: "16px !important" }} />}
              label="Поиск стал быстрее и умнее"
              sx={{
                mb: 2.5,
                color: "#fff",
                backgroundColor: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(10px)",
                fontWeight: 800,
              }}
            />

            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "2.9rem", sm: "4.2rem", md: "5.7rem" },
                letterSpacing: "-0.06em",
                lineHeight: 0.94,
                color: "#fff",
                mb: 2,
                fontFamily: '"Montserrat", sans-serif',
                textTransform: "uppercase",
                textShadow: "0 18px 40px rgba(15,23,42,0.34)",
              }}
            >
              Найди
              <br />
              свой ритм
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.18rem" },
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.84)",
                maxWidth: "560px",
                mb: 4,
              }}
            >
              Ищи быстрее, фильтруй точнее и переходи к товару без лишнего шума. Мы сделали каталог более четким, воздушным и современным.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                variant="contained"
                endIcon={<SouthRoundedIcon />}
                onClick={handleScrollToCatalog}
                sx={{
                  borderRadius: "999px",
                  bgcolor: "#fff",
                  color: "#0f172a",
                  fontWeight: 900,
                  px: 4.2,
                  py: 1.8,
                  boxShadow: "0 20px 40px rgba(15,23,42,0.26)",
                  "&:hover": { bgcolor: "#e2e8f0" },
                }}
              >
                Открыть каталог
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/favorites")}
                sx={{
                  borderRadius: "999px",
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.28)",
                  fontWeight: 800,
                  px: 4.2,
                  py: 1.8,
                  backdropFilter: "blur(8px)",
                  "&:hover": { borderColor: "#fff", backgroundColor: "rgba(255,255,255,0.06)" },
                }}
              >
                Посмотреть избранное
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mb: 10, flex: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
            <CircularProgress size={52} thickness={4} sx={{ color: "#0f449e" }} />
          </Box>
        ) : error ? (
          <Paper elevation={0} sx={{ textAlign: "center", mt: 8, p: 5, bgcolor: "#fff5f5", borderRadius: "24px", border: "1px solid rgba(239,68,68,0.12)" }}>
            <Typography variant="h5" sx={{ color: "#dc2626", fontWeight: 800, mb: 1 }}>
              Не удалось загрузить каталог
            </Typography>
            <Typography sx={{ color: "#64748b" }}>{error.message}</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 4.5 }}>
            <Box sx={{ width: "280px", flexShrink: 0, display: { xs: "none", lg: "block" }, position: "sticky", top: "24px" }}>
              <Sidebar
                minPrice={minPrice}
                maxPrice={maxPrice}
                priceRange={effectivePriceRange}
                onPriceChange={(_, nextRange) => setPriceRange(nextRange)}
                selectedBrands={selectedBrands}
                onBrandChange={handleBrandChange}
                products={products}
              />
            </Box>

            <Box ref={catalogRef} sx={{ flex: 1, minWidth: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  mb: 4,
                  p: { xs: 2, md: 3 },
                  borderRadius: "28px",
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
                  border: "1px solid rgba(148,163,184,0.14)",
                  boxShadow: "0 24px 60px rgba(15,23,42,0.06)",
                }}
              >
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", mb: 0.75, letterSpacing: "-0.04em" }}>
                      {getCatalogTitle()}
                    </Typography>
                    <Typography sx={{ color: "#64748b", fontWeight: 600 }}>
                      {isSearchPending
                        ? "Обновляем результаты..."
                        : `Показываем ${filteredProducts.length} товаров по твоему запросу и фильтрам.`}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      label="Только в наличии"
                      onClick={() => setOnlyInStock((current) => !current)}
                      clickable
                      sx={{
                        backgroundColor: onlyInStock ? "#0f449e" : "#f8fafc",
                        color: onlyInStock ? "#fff" : "#334155",
                        fontWeight: 800,
                        borderRadius: "999px",
                        border: onlyInStock ? "none" : "1px solid rgba(148,163,184,0.16)",
                      }}
                    />
                    {activeFilterChips.length > 0 ? (
                      activeFilterChips.map((chip) => (
                        <Chip key={chip.key} label={chip.label} sx={{ backgroundColor: "#eff6ff", color: "#0f449e", fontWeight: 800, borderRadius: "999px" }} />
                      ))
                    ) : (
                      <Chip label="Без фильтров" sx={{ backgroundColor: "#f8fafc", color: "#64748b", fontWeight: 800, borderRadius: "999px" }} />
                    )}
                  </Stack>
                </Stack>
              </Paper>

              {filteredProducts.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    textAlign: "center",
                    py: 8,
                    px: 3,
                    borderRadius: "32px",
                    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
                    border: "1px solid rgba(148,163,184,0.14)",
                    boxShadow: "0 24px 60px rgba(15,23,42,0.06)",
                  }}
                >
                  <Box sx={{ width: 92, height: 92, mx: "auto", mb: 2.5, borderRadius: "28px", display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(14,165,233,0.18) 100%)" }}>
                    <SearchOffIcon sx={{ fontSize: 42, color: "#0f449e" }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", mb: 1 }}>
                    По этому запросу пока пусто
                  </Typography>
                  <Typography sx={{ color: "#64748b", maxWidth: 520, mx: "auto", mb: 3 }}>
                    Попробуй убрать часть фильтров, ввести название бренда короче или вернуться к общему каталогу.
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} justifyContent="center">
                    <Button variant="contained" onClick={resetSearchExperience} sx={{ borderRadius: "999px", px: 3.5, py: 1.4, fontWeight: 900, bgcolor: "#0f449e" }}>
                      Сбросить поиск
                    </Button>
                    <Button variant="outlined" onClick={() => setCategory("all")} sx={{ borderRadius: "999px", px: 3.5, py: 1.4, fontWeight: 800 }}>
                      Ко всем товарам
                    </Button>
                  </Stack>
                </Paper>
              ) : isSidebarFiltered ? (
                <ProductGrid products={filteredProducts} />
              ) : (
                <>
                  <ProductGrid products={category === "New" ? newProducts : filteredProducts} />

                  {(category === "all" || category === "Shoes" || category === "Clothes" || category === "Bags") && (
                    <Box sx={{ mt: 8, p: { xs: 2.2, md: 4 }, bgcolor: "#fff", borderRadius: "30px", boxShadow: "0 24px 60px rgba(15,23,42,0.07)", border: "1px solid rgba(148,163,184,0.14)" }}>
                      <RecommendedSwiper products={recommendedProducts} title="Рекомендуем также" />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        )}
      </Container>

      <Footer />

      <Dialog open={authPromoOpen} onClose={closePromo} PaperProps={{ sx: { borderRadius: "24px", p: 1, maxWidth: "420px", position: "relative" } }}>
        <IconButton onClick={closePromo} sx={{ position: "absolute", right: 12, top: 12, color: "#718096" }}>
          <CloseIcon />
        </IconButton>

        <DialogContent sx={{ textAlign: "center", mt: 3, mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#1A202C", mb: 1 }}>
            Привет, {user?.username || "гость"}!
          </Typography>

          <Typography sx={{ color: "#718096", mb: 4, fontSize: "0.95rem" }}>
            Чтобы сохранять избранное, оформлять покупки и отслеживать заказы, войди в аккаунт.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              closePromo();
              navigate("/login");
            }}
            sx={{ bgcolor: "#0f449e", fontWeight: 800, py: 1.5, borderRadius: "14px", mb: 2, "&:hover": { bgcolor: "#0b337a" } }}
          >
            Войти в аккаунт
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              closePromo();
              navigate("/register");
            }}
            sx={{ borderColor: "#0f449e", color: "#0f449e", fontWeight: 800, py: 1.5, borderRadius: "14px", borderWidth: "2px", "&:hover": { borderWidth: "2px", borderColor: "#0b337a", color: "#0b337a" } }}
          >
            Создать профиль
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default HomePage;
