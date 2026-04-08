import { Box, Button, Container, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";
import ProductGrid from "./ProductGrid";
import { useApp } from "../context/app-context";
import { useProducts } from "../hooks/useProducts";

function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites } = useApp();
  const { products } = useProducts();

  const favoriteProducts = products.filter((item) => favorites.includes(item.id));

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
      <Header />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{ color: "#000", mb: 3, textTransform: "none", fontWeight: 600 }}
        >
          Вернуться в магазин
        </Button>

        <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a1a1a", mb: 4 }}>
          Избранное
        </Typography>

        {favoriteProducts.length > 0 ? (
          <ProductGrid products={favoriteProducts} />
        ) : (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography variant="h5" sx={{ color: "#888", mb: 2 }}>
              В избранном пока ничего нет
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{ bgcolor: "#0f449e", textTransform: "none", fontWeight: 600 }}
            >
              Перейти к покупкам
            </Button>
          </Box>
        )}
      </Container>

      <Footer />
    </Box>
  );
}

export default FavoritesPage;
