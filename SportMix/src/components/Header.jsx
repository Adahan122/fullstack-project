import { useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Badge,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TuneIcon from "@mui/icons-material/Tune";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { useNavigate } from "react-router-dom";

import { useApp } from "../context/app-context";
import { formatCurrency } from "../lib/format";

const categoryButtons = [
  { label: "Все товары", value: "all", icon: <AutoAwesomeIcon sx={{ fontSize: 16 }} /> },
  { label: "Новинки", value: "New", icon: <WhatshotIcon sx={{ fontSize: 16 }} />, isNew: true },
  { label: "Скидки", value: "Sale", icon: <LocalOfferIcon sx={{ fontSize: 16 }} />, isSale: true },
  { label: "Обувь", value: "Shoes" },
  { label: "Одежда", value: "Clothes" },
  { label: "Сумки", value: "Bags" },
];

function Header({
  onCategoryChange,
  selectedCategory = "all",
  searchQuery = "",
  onSearchChange,
  searchSuggestions = [],
  searchResultsCount = 0,
  searchIsPending = false,
  onSuggestionSelect,
}) {
  const navigate = useNavigate();
  const {
    cart,
    cartItemsCount,
    cartTotal,
    favorites,
    removeFromCart,
    user,
    isAdmin,
    logout,
    placeOrder,
    isPlacingOrder,
  } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  const isProfileMenuOpen = Boolean(profileAnchorEl);
  const normalizedQuery = searchQuery.trim();
  const showSuggestions = isSearchOpen && normalizedQuery.length > 0;
  const quickStats = useMemo(
    () => [
      { label: "Найдено", value: `${searchResultsCount}` },
      { label: "Избранное", value: `${favorites.length}` },
      { label: "Корзина", value: `${cartItemsCount}` },
    ],
    [cartItemsCount, favorites.length, searchResultsCount],
  );

  const handleOpenProfileMenu = (event) => setProfileAnchorEl(event.currentTarget);
  const handleCloseProfileMenu = () => setProfileAnchorEl(null);

  const navigateTo = (path) => {
    handleCloseProfileMenu();
    navigate(path);
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionSelect?.(suggestion);
    setIsSearchOpen(false);
  };

  const handleCheckout = async () => {
    const result = await placeOrder({
      shippingAddress: user?.address || "Адрес будет уточнен с менеджером",
      paymentMethod: "card",
    });

    if (result.requiresAuth) {
      return;
    }

    if (!result.success) {
      setCheckoutError(result.error || "Не удалось оформить заказ");
      return;
    }

    setCheckoutMessage(`Заказ ${result.order.orderNumber} успешно оформлен`);
    setIsCartOpen(false);
    navigate("/orders");
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        zIndex: 1100,
        bgcolor: "rgba(252, 252, 253, 0.88)",
        backdropFilter: "blur(18px)",
        boxShadow: "0 14px 50px rgba(15, 23, 42, 0.08)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(90deg, #0f172a 0%, #0f449e 55%, #1d4ed8 100%)",
          minHeight: "42px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 4 },
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.84)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Search-first shopping experience
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {user ? (
            <>
              <Typography sx={{ color: "#fff", fontSize: "11px", fontWeight: 700, opacity: 0.95 }}>
                Привет, {(user.username || user.name || "друг").toUpperCase()}
              </Typography>
              <Typography onClick={logout} sx={{ color: "rgba(255,255,255,0.82)", fontSize: "11px", fontWeight: 700, cursor: "pointer", "&:hover": { color: "#fff" } }}>
                Выйти
              </Typography>
            </>
          ) : (
            <>
              <Typography onClick={() => navigate("/login")} sx={{ color: "rgba(255,255,255,0.82)", fontSize: "11px", fontWeight: 700, cursor: "pointer", "&:hover": { color: "#fff" } }}>
                Вход
              </Typography>
              <Typography onClick={() => navigate("/register")} sx={{ color: "rgba(255,255,255,0.82)", fontSize: "11px", fontWeight: 700, cursor: "pointer", "&:hover": { color: "#fff" } }}>
                Регистрация
              </Typography>
            </>
          )}
        </Box>
      </Box>

      <Toolbar
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "220px minmax(0, 1fr) auto" },
          alignItems: "center",
          gap: 2.5,
          py: { xs: 2, md: 2.5 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35, cursor: "pointer" }} onClick={() => { navigate("/"); onCategoryChange?.("all"); }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", fontFamily: '"Montserrat", sans-serif', letterSpacing: "-0.04em", lineHeight: 1 }}>
            SPORT<span style={{ color: "#0f449e" }}>MIX</span>
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: "12px", fontWeight: 600 }}>
            Быстрый поиск. Четкий выбор.
          </Typography>
        </Box>

        <ClickAwayListener onClickAway={() => setIsSearchOpen(false)}>
          <Box sx={{ position: "relative", width: "100%" }}>
            <Paper elevation={0} sx={{ borderRadius: "30px", px: { xs: 1.5, md: 2 }, py: 1.15, display: "flex", alignItems: "center", gap: 1.25, border: showSuggestions ? "1px solid rgba(15, 68, 158, 0.24)" : "1px solid rgba(148, 163, 184, 0.22)", background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", boxShadow: showSuggestions ? "0 20px 45px rgba(15, 68, 158, 0.12)" : "0 12px 30px rgba(15, 23, 42, 0.05)", transition: "all 0.2s ease" }}>
              <Box sx={{ width: 42, height: 42, borderRadius: "14px", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #0f449e 0%, #2563eb 100%)", color: "#fff", flexShrink: 0, boxShadow: "0 12px 24px rgba(37, 99, 235, 0.24)" }}>
                <SearchIcon sx={{ fontSize: 20 }} />
              </Box>

              <InputBase
                placeholder="Ищи по названию, бренду или категории"
                value={searchQuery}
                onChange={(event) => onSearchChange?.(event.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                sx={{ flex: 1, color: "#0f172a", fontSize: 15, fontWeight: 600, "& input::placeholder": { color: "#94a3b8", opacity: 1, fontWeight: 500 } }}
              />

              <Chip icon={<TuneIcon sx={{ fontSize: "16px !important" }} />} label={searchIsPending ? "Поиск..." : `${searchResultsCount} результатов`} sx={{ display: { xs: "none", md: "inline-flex" }, backgroundColor: searchIsPending ? "rgba(245, 158, 11, 0.12)" : "rgba(15, 68, 158, 0.08)", color: searchIsPending ? "#b45309" : "#0f449e", fontWeight: 700, borderRadius: "999px" }} />
            </Paper>

            {showSuggestions && (
              <Paper elevation={0} sx={{ position: "absolute", top: "calc(100% + 12px)", left: 0, right: 0, p: 1.25, borderRadius: "24px", border: "1px solid rgba(148, 163, 184, 0.22)", boxShadow: "0 25px 60px rgba(15, 23, 42, 0.14)", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1, pb: 1 }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    Быстрые подсказки
                  </Typography>
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#0f449e" }}>
                    {searchResultsCount} найдено
                  </Typography>
                </Box>

                {searchSuggestions.length > 0 ? (
                  <List disablePadding>
                    {searchSuggestions.map((suggestion) => (
                      <ListItemButton key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)} sx={{ borderRadius: "18px", px: 1.25, py: 1, mb: 0.5, alignItems: "center", "&:hover": { backgroundColor: "rgba(15, 68, 158, 0.05)" } }}>
                        <Box sx={{ width: 54, height: 54, borderRadius: "16px", backgroundColor: "#f8fafc", display: "grid", placeItems: "center", mr: 1.5, overflow: "hidden", flexShrink: 0 }}>
                          <img src={suggestion.image} alt={suggestion.name} style={{ maxWidth: "88%", maxHeight: "88%", objectFit: "contain" }} />
                        </Box>
                        <ListItemText
                          disableTypography
                          primary={<Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "14px" }}>{suggestion.name}</Typography>}
                          secondary={<Typography component="span" sx={{ color: "#64748b", fontSize: "12px", fontWeight: 600 }}>{suggestion.brand} · {formatCurrency(suggestion.price)}</Typography>}
                        />
                        <NorthEastIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                      </ListItemButton>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ px: 1.25, py: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
                      Ничего близкого не нашли
                    </Typography>
                    <Typography sx={{ color: "#64748b", fontSize: "13px" }}>
                      Попробуй бренд, например Nike, Adidas или категорию Shoes.
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1.2 }} />

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, px: 1 }}>
                  {quickStats.map((stat) => (
                    <Chip key={stat.label} label={`${stat.label}: ${stat.value}`} sx={{ backgroundColor: "#f8fafc", color: "#334155", fontWeight: 700, borderRadius: "999px" }} />
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        </ClickAwayListener>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "space-between", lg: "flex-end" }, gap: 1.25 }}>
          <IconButton sx={{ color: "#2D3748", "&:hover": { color: "#0f449e" } }} onClick={handleOpenProfileMenu}>
            <PersonOutlineIcon sx={{ fontSize: 26 }} />
          </IconButton>

          <Menu anchorEl={profileAnchorEl} open={isProfileMenuOpen} onClose={handleCloseProfileMenu} PaperProps={{ sx: { width: 190, borderRadius: "18px", mt: 1.5, p: 1, boxShadow: "0 18px 44px rgba(15, 23, 42, 0.12)" } }}>
            <MenuItem onClick={() => navigateTo(user ? "/profile" : "/login")} sx={{ fontSize: 14, fontWeight: 700, color: "#2D3748", borderRadius: "12px" }}>Мой профиль</MenuItem>
            <MenuItem onClick={() => navigateTo(user ? "/orders" : "/login")} sx={{ fontSize: 14, fontWeight: 700, color: "#2D3748", borderRadius: "12px" }}>Мои заказы</MenuItem>
            {isAdmin && (
              <MenuItem onClick={() => navigateTo("/admin")} sx={{ fontSize: 14, fontWeight: 700, color: "#0f449e", borderRadius: "12px" }}>Админка</MenuItem>
            )}
            {user ? (
              <MenuItem onClick={() => { handleCloseProfileMenu(); logout(); }} sx={{ fontSize: 14, fontWeight: 700, color: "#E53E3E", borderRadius: "12px" }}>Выйти</MenuItem>
            ) : (
              <MenuItem onClick={() => navigateTo("/login")} sx={{ fontSize: 14, fontWeight: 700, color: "#0f449e", borderRadius: "12px" }}>Войти</MenuItem>
            )}
          </Menu>

          <IconButton sx={{ color: "#2D3748", "&:hover": { color: "#E53E3E" } }} onClick={() => navigate("/favorites")}>
            <Badge badgeContent={favorites.length} sx={{ "& .MuiBadge-badge": { bgcolor: "#E53E3E", color: "#fff", fontSize: "10px", fontWeight: "bold" } }}>
              <FavoriteBorderIcon sx={{ fontSize: 26 }} />
            </Badge>
          </IconButton>

          <IconButton sx={{ color: "#2D3748", "&:hover": { color: "#0f449e" } }} onClick={() => setIsCartOpen(true)}>
            <Badge badgeContent={cartItemsCount} sx={{ "& .MuiBadge-badge": { bgcolor: "#0f449e", color: "#fff", fontSize: "10px", fontWeight: "bold" } }}>
              <ShoppingCartIcon sx={{ fontSize: 26 }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>

      <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1.25, py: 1.6, px: 2, background: "linear-gradient(180deg, rgba(248,250,252,0.96) 0%, rgba(241,245,249,0.78) 100%)", borderTop: "1px solid rgba(148,163,184,0.12)", borderBottom: "1px solid rgba(148,163,184,0.14)" }}>
        {categoryButtons.map((category) => {
          const isActive = selectedCategory === category.value;
          let buttonColor = "#475569";
          let backgroundColor = "rgba(255,255,255,0.85)";

          if (isActive) {
            buttonColor = "#fff";
            backgroundColor = category.isSale ? "#dc2626" : "#0f449e";
          } else if (category.isSale) {
            buttonColor = "#dc2626";
          } else if (category.isNew) {
            buttonColor = "#b45309";
          }

          return (
            <Button
              key={category.value}
              variant={isActive ? "contained" : "text"}
              onClick={() => { navigate("/"); onCategoryChange?.(category.value); }}
              startIcon={category.icon}
              sx={{ bgcolor: backgroundColor, color: buttonColor, fontWeight: 800, borderRadius: "999px", px: 2.6, py: 0.8, textTransform: "none", border: isActive ? "none" : "1px solid rgba(148,163,184,0.18)", boxShadow: isActive ? "0 12px 28px rgba(15, 68, 158, 0.22)" : "none", "&:hover": { bgcolor: isActive ? (category.isSale ? "#b91c1c" : "#0b3376") : "#ffffff" } }}
            >
              {category.label}
            </Button>
          );
        })}
      </Box>

      <Drawer anchor="right" open={isCartOpen} onClose={() => setIsCartOpen(false)} PaperProps={{ sx: { borderRadius: "24px 0 0 24px", borderLeft: "1px solid rgba(148,163,184,0.16)" } }}>
        <Box sx={{ width: { xs: "100vw", sm: "420px" }, height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" }}>
          <Box sx={{ p: 3, borderBottom: "1px solid #EDF2F7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>Корзина</Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>{cartItemsCount} товаров</Typography>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 3 }}>
            {cart.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column", gap: 2 }}>
                <Box sx={{ width: 82, height: 82, borderRadius: "24px", display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(15,68,158,0.08) 0%, rgba(37,99,235,0.18) 100%)" }}>
                  <ShoppingCartIcon sx={{ fontSize: 42, color: "#0f449e" }} />
                </Box>
                <Typography sx={{ color: "#0f172a", fontWeight: 800 }}>В корзине пока пусто</Typography>
                <Typography sx={{ color: "#64748b", fontSize: "14px", maxWidth: 280, textAlign: "center" }}>
                  Добавь товары из поиска или каталога, и они появятся здесь.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {cart.map((item, index) => (
                  <Box key={`${item.id}-${item.selectedSize}-${index}`} sx={{ mb: 2, display: "flex", alignItems: "center", border: "1px solid rgba(148,163,184,0.14)", borderRadius: "18px", p: 1.5, backgroundColor: "#fff", boxShadow: "0 10px 25px rgba(15,23,42,0.04)" }}>
                    <Box sx={{ width: "72px", height: "72px", bgcolor: "#F8FAFC", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", mr: 2, p: 0.5 }}>
                      <img src={item.image} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </Box>
                    <ListItemText
                      disableTypography
                      primary={<Typography sx={{ fontWeight: 800, fontSize: "14px", color: "#0f172a" }}>{item.name}</Typography>}
                      secondary={<Box component="span" sx={{ display: "block", mt: 0.5 }}>{item.selectedSize && <Typography component="span" variant="caption" sx={{ display: "block", color: "#64748b", fontWeight: 700 }}>Размер: {item.selectedSize}</Typography>}<Typography component="span" variant="caption" sx={{ color: "#0f449e", fontWeight: 900, fontSize: "12px" }}>{formatCurrency(item.price)} × {item.quantity} шт.</Typography></Box>}
                    />
                    <IconButton sx={{ color: "#94a3b8", "&:hover": { color: "#E53E3E" } }} onClick={() => removeFromCart(item.id, item.selectedSize)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                ))}
              </List>
            )}
          </Box>

          {cart.length > 0 && (
            <Box sx={{ p: 3, borderTop: "1px solid #EDF2F7", bgcolor: "#fff" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>Итого к оплате:</Typography>
                <Typography sx={{ fontWeight: 900, color: "#0f449e", fontSize: "1.4rem" }}>{formatCurrency(cartTotal)}</Typography>
              </Box>
              <Typography sx={{ color: "#64748b", fontSize: "13px", mb: 3 }}>
                Доставка будет оформлена на адрес из профиля.
              </Typography>
              <Button variant="contained" fullWidth disabled={isPlacingOrder} onClick={handleCheckout} sx={{ bgcolor: "#0f449e", color: "#fff", py: 2, borderRadius: "999px", fontWeight: 900, boxShadow: "0 16px 28px rgba(15,68,158,0.24)" }}>
                {isPlacingOrder ? "Оформляем..." : "Оформить заказ"}
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      <Snackbar open={Boolean(checkoutMessage)} autoHideDuration={2600} onClose={() => setCheckoutMessage("")} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Alert onClose={() => setCheckoutMessage("")} severity="success" sx={{ width: "100%" }}>
          {checkoutMessage}
        </Alert>
      </Snackbar>

      <Snackbar open={Boolean(checkoutError)} autoHideDuration={2600} onClose={() => setCheckoutError("")} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Alert onClose={() => setCheckoutError("")} severity="error" sx={{ width: "100%" }}>
          {checkoutError}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}

export default Header;
