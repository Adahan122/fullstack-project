import { useState } from "react";
import { Alert, Box, Button, Chip, Grid, IconButton, Rating, Snackbar, Typography } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";

import { useApp } from "../context/app-context";
import { calculateDiscount, formatCurrency } from "../lib/format";

function ProductGrid({ products }) {
  const navigate = useNavigate();
  const { addToCart, isFavorite, requireAuth, toggleFavorite } = useApp();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleCloseSnackbar = (_, reason) => {
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
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={3}>
        {products.map((item) => {
          const rawPrice = Number(item.price);
          const rawOldPrice = Number(item.oldPrice || item.old_price);
          const discount = calculateDiscount(rawPrice, rawOldPrice);
          const favorited = isFavorite(item.id);
          const stock = Number(item.stock || 0);
          const isOutOfStock = stock <= 0;
          const stockLabel = isOutOfStock ? "Нет в наличии" : stock <= 3 ? `Осталось ${stock}` : "В наличии";

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Box
                sx={{
                  position: "relative",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: "1px solid rgba(148,163,184,0.14)",
                  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
                  boxShadow: "0 16px 40px rgba(15,23,42,0.06)",
                  cursor: "pointer",
                  transition: "transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 22px 54px rgba(15,23,42,0.12)",
                    borderColor: "rgba(15,68,158,0.22)",
                  },
                }}
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(circle at top right, rgba(96,165,250,0.12) 0%, transparent 24%)",
                    pointerEvents: "none",
                  }}
                />

                <Box sx={{ position: "absolute", top: 14, left: 14, right: 14, zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                    {discount ? (
                      <Chip
                        label={discount}
                        sx={{
                          backgroundColor: "#dc2626",
                          color: "#fff",
                          fontWeight: 900,
                          borderRadius: "999px",
                          boxShadow: "0 12px 24px rgba(220,38,38,0.24)",
                        }}
                      />
                    ) : (
                      <Chip
                        label={item.is_new ? "New" : item.category || "Sport"}
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.92)",
                          color: "#0f449e",
                          fontWeight: 800,
                          borderRadius: "999px",
                        }}
                      />
                    )}
                    <Chip
                      label={stockLabel}
                      size="small"
                      sx={{
                        alignSelf: "flex-start",
                        backgroundColor: isOutOfStock ? "rgba(239,68,68,0.12)" : stock <= 3 ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)",
                        color: isOutOfStock ? "#b91c1c" : stock <= 3 ? "#b45309" : "#15803d",
                        fontWeight: 900,
                        borderRadius: "999px",
                      }}
                    />
                  </Box>

                  <IconButton
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: "rgba(255,255,255,0.94)",
                      boxShadow: "0 10px 24px rgba(15,23,42,0.10)",
                      "&:hover": { bgcolor: "#fff" },
                    }}
                    onClick={(event) => handleFavoriteClick(event, item)}
                  >
                    {favorited ? <FavoriteIcon sx={{ color: "#ef4444" }} /> : <FavoriteBorderIcon sx={{ color: "#475569" }} />}
                  </IconButton>
                </Box>

                <Box
                  sx={{
                    minHeight: 250,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2.5,
                    pt: 6,
                    pb: 2,
                    background:
                      "linear-gradient(180deg, rgba(248,250,252,0.92) 0%, rgba(241,245,249,0.78) 100%)",
                  }}
                >
                  <img src={item.image} alt={item.name} style={{ maxHeight: "190px", maxWidth: "100%", objectFit: "contain", filter: "drop-shadow(0 16px 24px rgba(15,23,42,0.10))" }} />
                </Box>

                <Box sx={{ p: 2.5, pt: 1.5, display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <Typography sx={{ color: "#0f449e", fontSize: "12px", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", mb: 0.9 }}>
                    {item.brand || "Brand"}
                  </Typography>

                  <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", lineHeight: 1.35, minHeight: "2.7em", mb: 1.1 }}>
                    {item.name}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.4 }}>
                    <Rating value={Number(item.rating) || 0} precision={0.1} readOnly size="small" sx={{ color: "#f59e0b" }} />
                    <Typography sx={{ color: "#64748b", fontSize: "12px", fontWeight: 700 }}>
                      {item.reviews || 0} отзывов
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 2 }}>
                    <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.35rem", letterSpacing: "-0.03em" }}>
                      {formatCurrency(rawPrice)}
                    </Typography>
                    {discount && (
                      <Typography sx={{ textDecoration: "line-through", color: "#94a3b8", fontWeight: 700, fontSize: "0.9rem" }}>
                        {formatCurrency(rawOldPrice)}
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    fullWidth
                    disabled={isOutOfStock}
                    sx={{
                      mt: "auto",
                      bgcolor: isOutOfStock ? "#cbd5e1" : "#0f449e",
                      color: "#fff",
                      textTransform: "none",
                      fontWeight: 900,
                      borderRadius: "16px",
                      py: 1.3,
                      boxShadow: isOutOfStock ? "none" : "0 16px 28px rgba(15,68,158,0.22)",
                      "&:hover": { bgcolor: isOutOfStock ? "#cbd5e1" : "#0b3376" },
                    }}
                    onClick={(event) => handleCartClick(event, item)}
                  >
                    {isOutOfStock ? "Нет в наличии" : "Добавить в корзину"}
                  </Button>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <Snackbar open={openSnackbar} autoHideDuration={2000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} style={{ zIndex: 9999 }}>
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{
            width: "100%",
            bgcolor: "#0f449e",
            color: "#fff",
            fontWeight: 700,
            borderRadius: "14px",
            boxShadow: "0 14px 30px rgba(15,68,158,0.24)",
            "& .MuiAlert-icon": { color: "#fff" },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProductGrid;
