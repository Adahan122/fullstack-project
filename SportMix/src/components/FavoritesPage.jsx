import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import Header from './Header';
import ProductGrid from './ProductGrid';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function FavoritesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  
  // Безопасное получение юзера для хедера
  const [user] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/data')
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) setData(json);
      })
      .catch((err) => console.error('Ошибка загрузки:', err));
  }, []);

  // Безопасное переключение лайка (через коллбэк стейта)
  const toggleFavorite = (productId) => {
    setFavorites((prevFavorites) => {
      const updatedFavorites = prevFavorites.includes(productId)
        ? prevFavorites.filter((id) => id !== productId)
        : [...prevFavorites, productId];
        
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  const favoriteProducts = data.filter((item) => favorites.includes(item.id));

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      {/* Передаем юзера и пустые заглушки для поиска/категорий, чтобы хедер не ругался */}
      <Header 
        favoritesCount={favorites.length} 
        user={user}
        onCategoryChange={() => navigate('/')}
        onSearchChange={() => navigate('/')}
      />

      <Container maxWidth='xl' sx={{ mt: 4, mb: 8 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ color: '#000', mb: 3, textTransform: 'none', fontWeight: 600 }}
        >
          Вернуться в магазин
        </Button>

        <Typography variant='h4' sx={{ fontWeight: 800, color: '#1a1a1a', mb: 4 }}>
          Избранное 🖤
        </Typography>

        {favoriteProducts.length > 0 ? (
          <ProductGrid 
            products={favoriteProducts} 
            favorites={favorites} 
            onToggleFavorite={toggleFavorite} 
          />
        ) : (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant='h5' sx={{ color: '#888', mb: 2 }}>
              В избранном пока ничего нет
            </Typography>
            <Button
              variant='contained'
              onClick={() => navigate('/')}
              sx={{ bgcolor: '#0f449e', textTransform: 'none', fontWeight: 600 }}
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