import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, IconButton, Snackbar, Alert, Grid, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Импортируем контекст корзины
import { CartContext } from '../App';

function ProductGrid({ products, onToggleFavorite }) {
  const navigate = useNavigate();
  
  // Подключаем функцию добавления в корзину
  const { addToCart } = useContext(CartContext);

  // Состояния для уведомлений
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Храним массив ID избранного для мгновенного перекрашивания сердечек
  const [localFavs, setLocalFavs] = useState([]);

  // Синхронизируем избранное с localStorage при загрузке
  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    setLocalFavs(saved ? JSON.parse(saved) : []);
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  // --- ЛОГИКА КЛИКА ПО СЕРДЕЧКУ ---
  const handleHeartClick = (e, item) => {
    e.stopPropagation(); // Чтобы не переходило на страницу товара

    // Извлекаем пользователя из localStorage для проверки
    const savedUser = localStorage.getItem('user');
    
    // Если юзер не залогинен, вызываем addToCart(null), чтобы просто сработала модалка из App.js!
    if (!savedUser) {
      addToCart(null);
      return; // Стопаем добавление в избранное
    }

    const saved = localStorage.getItem('favorites');
    let currentFavs = saved ? JSON.parse(saved) : [];
    const isAdding = !currentFavs.includes(item.id);

    let updatedFavs;
    if (isAdding) {
      updatedFavs = [...currentFavs, item.id];
    } else {
      updatedFavs = currentFavs.filter((id) => id !== item.id);
    }

    localStorage.setItem('favorites', JSON.stringify(updatedFavs));
    setLocalFavs(updatedFavs); // Мгновенно меняем цвет сердечка

    if (onToggleFavorite) {
      onToggleFavorite(item.id);
    }

    setSnackbarMessage(
      isAdding
        ? `"${item.name}" добавлен в избранное 🖤`
        : `"${item.name}" удален из избранного`
    );
    setOpenSnackbar(true);
  };

  // --- ЛОГИКА КЛИКА ПО КНОПКЕ КОРЗИНЫ ---
  const handleCartClick = (e, item) => {
    e.stopPropagation(); // Чтобы не переходило на страницу товара
    
    // 1. Пытаемся добавить в корзину и сохраняем результат (true/false)
    let isAdded = false;
    if (addToCart) {
      isAdded = addToCart(item, ""); 
    }

    // 2. Если добавление прошло успешно (юзер авторизован) — показываем Snackbar!
    if (isAdded) {
      setSnackbarMessage(`"${item.name}" добавлен в корзину! 🛒`);
      setOpenSnackbar(true);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        {products.map((item) => {
          const isFavorited = localFavs.includes(item.id);

          // === РАСЧЕТ СКИДКИ ===
          const rawPrice = parseFloat(item.price);
          const rawOldPrice = parseFloat(item.oldPrice || item.old_price);

          let discount = null;
          if (rawOldPrice && rawOldPrice > rawPrice) {
            const percent = Math.round((1 - rawPrice / rawOldPrice) * 100);
            if (percent > 0) discount = `-${percent}%`;
          }

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Box
                sx={{
                  border: '1px solid #eaeaea',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                    borderColor: '#0f449e',
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: '#fff',
                  position: 'relative',
                }}
                onClick={() => navigate(`/product/${item.id}`)}
              >
                {/* КРАСНЫЙ БЕЙДЖ СО СКИДКОЙ */}
                {discount && (
                  <Chip
                    label={discount}
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      fontWeight: 700,
                      fontSize: 12,
                      zIndex: 10,
                      borderRadius: '6px',
                    }}
                  />
                )}

                {/* ИКОНКА СЕРДЕЧКА */}
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#fff' },
                  }}
                  onClick={(e) => handleHeartClick(e, item)}
                >
                  {isFavorited ? (
                    <FavoriteIcon sx={{ color: '#eb2f2f' }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ color: '#555' }} />
                  )}
                </IconButton>

                {/* Изображение */}
                <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: '#f9f9f9' }}>
                  <img src={item.image} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </Box>

                {/* Инфо о товаре */}
                <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ color: '#888', mb: 0.5 }}>{item.brand}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: '#1a1a1a', flexGrow: 1 }}>{item.name}</Typography>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f449e' }}>
                      {rawPrice.toLocaleString()} ₽
                    </Typography>

                    {/* ЗАЧЕРКНУТАЯ СТАРАЯ ЦЕНА */}
                    {discount && (
                      <Typography
                        variant="caption"
                        sx={{ textDecoration: 'line-through', color: '#888', fontWeight: '600', fontSize: '0.9rem' }}
                      >
                        {rawOldPrice.toLocaleString()} ₽
                      </Typography>
                    )}
                  </Box>

                  {/* КНОПКА С ТЕКСТОМ «ДОБАВИТЬ В КОРЗИНУ» */}
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    fullWidth
                    sx={{
                      bgcolor: '#0f449e',
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      py: 1,
                      '&:hover': {
                        bgcolor: '#0b3376',
                      },
                    }}
                    onClick={(e) => handleCartClick(e, item)}
                  >
                    Добавить в корзину
                  </Button>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* УВЕДОМЛЕНИЕ ДЛЯ КАТАЛОГА */}
      <Snackbar open={openSnackbar} autoHideDuration={2000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} style={{ zIndex: 9999 }}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', bgcolor: '#0f449e', color: '#fff', fontWeight: 600, borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', '& .MuiAlert-icon': { color: '#fff' } }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProductGrid;