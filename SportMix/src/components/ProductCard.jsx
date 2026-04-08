import { Box, Button, Chip, IconButton, Rating, Typography } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalMallIcon from "@mui/icons-material/LocalMall";

import { useApp } from "../context/app-context";
import { calculateDiscount, formatCurrency } from "../lib/format";

function ProductCard({ item, onOpenDetail, isFavorite = false, onToggleFavorite }) {
  const { addToCart } = useApp();
  const rawPrice = Number(item.price);
  const rawOldPrice = Number(item.oldPrice || item.old_price);
  const discount = calculateDiscount(rawPrice, rawOldPrice);
  const stock = Number(item.stock || 0);
  const isOutOfStock = stock <= 0;

  const handleAddToCart = (event) => {
    event.stopPropagation();
    addToCart(item);
  };

  const handleToggleFavorite = (event) => {
    event.stopPropagation();
    onToggleFavorite?.(item.id);
  };

  return (
    <Box
      onClick={() => onOpenDetail?.(item)}
      sx={{
        height: "100%",
        width: "100%",
        maxWidth: 220,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        borderRadius: "8px",
        border: "1px solid #f1f1f1",
        backgroundColor: "#fff",
        transition: "box-shadow 0.3s ease, transform 0.2s ease",
        cursor: "pointer",
        mx: "auto",
        overflow: "hidden",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {discount && (
        <Chip
          label={discount}
          color="error"
          size="small"
          sx={{ position: "absolute", top: 12, left: 12, fontWeight: 700, fontSize: 14, zIndex: 2, borderRadius: 1 }}
        />
      )}

      <Box
        sx={{
          height: "180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f6f6f6",
          borderRadius: "8px 8px 0 0",
          p: 2,
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid #f1f1f1",
        }}
      >
        <Box component="img" src={item.image} alt={item.name} sx={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />

        <IconButton
          onClick={handleToggleFavorite}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 2,
            width: 36,
            height: 36,
            "&:hover": { backgroundColor: "#fff" },
          }}
        >
          {isFavorite ? <FavoriteIcon sx={{ color: "#eb2f2f", fontSize: "1.3rem" }} /> : <FavoriteBorderIcon sx={{ color: "#1a1a1a", fontSize: "1.3rem" }} />}
        </IconButton>
      </Box>

      <Box sx={{ p: "12px 16px 16px", display: "flex", flexDirection: "column", flexGrow: 1, gap: 0.5 }}>
        <Box display="flex" alignItems="baseline" gap={1} sx={{ mb: "2px" }}>
          <Typography variant="body1" sx={{ fontWeight: 800, color: "#000", fontSize: "1.1rem" }}>
            {formatCurrency(rawPrice)}
          </Typography>
          {discount && (
            <Typography variant="caption" sx={{ textDecoration: "line-through", color: "#888", fontWeight: 600 }}>
              {formatCurrency(rawOldPrice)}
            </Typography>
          )}
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            lineHeight: 1.2,
            height: "2.4em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            color: "#1a1a1a",
            mb: 0.5,
          }}
        >
          {item.name}
        </Typography>

        <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: "auto", mb: 1.5 }}>
          <Rating value={parseFloat(item.rating) || 0} precision={0.1} size="small" readOnly sx={{ color: "#000" }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#000", fontSize: "0.75rem" }}>
            ({item.reviews || 0})
          </Typography>
        </Box>

        <Chip
          label={isOutOfStock ? "Нет в наличии" : stock <= 3 ? `Осталось ${stock}` : "В наличии"}
          size="small"
          sx={{
            alignSelf: "flex-start",
            mb: 1.5,
            bgcolor: isOutOfStock ? "rgba(239,68,68,0.12)" : stock <= 3 ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)",
            color: isOutOfStock ? "#b91c1c" : stock <= 3 ? "#b45309" : "#15803d",
            fontWeight: 800,
          }}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          startIcon={<LocalMallIcon sx={{ fontSize: "1.1rem !important" }} />}
          sx={{ backgroundColor: isOutOfStock ? "#cbd5e1" : "#1976d2", color: "#fff", borderRadius: "6px", textTransform: "none", fontWeight: 700, fontSize: "0.9rem", py: 1, boxShadow: "none", "&:hover": { backgroundColor: isOutOfStock ? "#cbd5e1" : "#1565c0", boxShadow: "none" } }}
        >
          {isOutOfStock ? "Нет в наличии" : "В корзину"}
        </Button>
      </Box>
    </Box>
  );
}

export default ProductCard;
