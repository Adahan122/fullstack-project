import { useState } from "react";
import { Alert, Box, Chip, IconButton, Rating, Snackbar, Typography } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import { useApp } from "../context/app-context";
import { formatCurrency } from "../lib/format";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function RecommendedSwiper({ products, title }) {
  const navigate = useNavigate();
  const { addToCart, isFavorite, requireAuth, toggleFavorite } = useApp();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const closeSnackbar = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  const showMessage = (message) => {
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  const handleFavoriteClick = (event, item) => {
    event.stopPropagation();

    const result = toggleFavorite(item.id);

    if (result.requiresAuth) {
      requireAuth();
      return;
    }

    showMessage(
      result.isFavorite
        ? `"${item.name}" добавлен в избранное`
        : `"${item.name}" удален из избранного`,
    );
  };

  const handleCartClick = (event, item) => {
    event.stopPropagation();

    const result = addToCart(item, "");

    if (result?.requiresAuth) {
      return;
    }

    if (result?.success) {
      showMessage(`"${item.name}" добавлен в корзину`);
      return;
    }

    showMessage(result?.error || "Не удалось добавить товар в корзину");
  };

  return (
    <Box sx={{ width: "100%", mb: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: "#0f172a", letterSpacing: "-0.03em" }}>
        {title}
      </Typography>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={4}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          320: { slidesPerView: 1 },
          600: { slidesPerView: 2 },
          960: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        style={{ paddingBottom: "40px" }}
      >
        {products.map((item) => {
          const stock = Number(item.stock || 0);
          const isOutOfStock = stock <= 0;
          const stockLabel = isOutOfStock ? "Нет в наличии" : stock <= 3 ? `Осталось ${stock}` : "В наличии";

          return (
          <SwiperSlide key={item.id}>
            <Box
              sx={{
                position: "relative",
                border: "1px solid rgba(148,163,184,0.14)",
                borderRadius: "24px",
                overflow: "hidden",
                transition: "all 0.28s ease",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: "0 18px 44px rgba(15,23,42,0.10)",
                  borderColor: "rgba(15,68,158,0.18)",
                  transform: "translateY(-4px)",
                },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#fff",
              }}
              onClick={() => navigate(`/product/${item.id}`)}
            >
              <Box sx={{ position: "absolute", top: 12, left: 12, right: 12, zIndex: 10, display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                  <Chip label={item.category || "Sport"} sx={{ alignSelf: "flex-start", bgcolor: "rgba(255,255,255,0.9)", color: "#0f449e", fontWeight: 800, borderRadius: "999px" }} />
                  <Chip label={stockLabel} size="small" sx={{ alignSelf: "flex-start", bgcolor: isOutOfStock ? "rgba(239,68,68,0.12)" : stock <= 3 ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)", color: isOutOfStock ? "#b91c1c" : stock <= 3 ? "#b45309" : "#15803d", fontWeight: 900, borderRadius: "999px" }} />
                </Box>
                <IconButton sx={{ bgcolor: "rgba(255,255,255,0.94)", boxShadow: "0 10px 24px rgba(15,23,42,0.10)", "&:hover": { bgcolor: "#fff" } }} onClick={(event) => handleFavoriteClick(event, item)}>
                  {isFavorite(item.id) ? <FavoriteIcon sx={{ color: "#ef4444" }} /> : <FavoriteBorderIcon sx={{ color: "#475569" }} />}
                </IconButton>
              </Box>

              <Box sx={{ height: 210, display: "flex", alignItems: "center", justifyContent: "center", p: 2.5, bgcolor: "#f8fafc" }}>
                <img src={item.image} alt={item.name} style={{ maxHeight: "165px", maxWidth: "100%", objectFit: "contain", filter: "drop-shadow(0 14px 20px rgba(15,23,42,0.08))" }} />
              </Box>

              <Box sx={{ p: 2.2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <Typography sx={{ color: "#0f449e", fontSize: "12px", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", mb: 0.7 }}>
                  {item.brand}
                </Typography>
                <Typography sx={{ fontWeight: 800, mb: 1, color: "#0f172a", flexGrow: 1, lineHeight: 1.35 }}>
                  {item.name}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.2 }}>
                  <Rating value={Number(item.rating) || 0} precision={0.1} readOnly size="small" sx={{ color: "#f59e0b" }} />
                  <Typography sx={{ color: "#64748b", fontSize: "12px", fontWeight: 700 }}>
                    {item.reviews || 0}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
                  <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.15rem", letterSpacing: "-0.03em" }}>
                    {formatCurrency(item.price)}
                  </Typography>
                  <IconButton disabled={isOutOfStock} sx={{ bgcolor: isOutOfStock ? "#cbd5e1" : "#0f449e", color: "#fff", "&:hover": { bgcolor: isOutOfStock ? "#cbd5e1" : "#0b3376" }, borderRadius: "14px", boxShadow: isOutOfStock ? "none" : "0 12px 24px rgba(15,68,158,0.22)" }} onClick={(event) => handleCartClick(event, item)}>
                    <ShoppingCartIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </SwiperSlide>
        )})}
      </Swiper>

      <Snackbar open={openSnackbar} autoHideDuration={2000} onClose={closeSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} style={{ zIndex: 9999 }}>
        <Alert onClose={closeSnackbar} severity="success" sx={{ width: "100%", bgcolor: "#0f449e", color: "#fff", fontWeight: 700, borderRadius: "14px", boxShadow: "0 14px 30px rgba(15,68,158,0.24)", "& .MuiAlert-icon": { color: "#fff" } }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default RecommendedSwiper;
