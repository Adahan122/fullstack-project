import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, IconButton, Snackbar, Alert } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Импортируем контекст корзины, чтобы товар реально добавлялся!
import { CartContext } from '../App';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function RecommendedSwiper({ products, title, onToggleFavorite }) {
  const navigate = useNavigate();
  
  // Подключаем функцию добавления в корзину из твоего App.jsx
  const { addToCart } = useContext(CartContext);

  // Состояния для уведомлений
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Храним массив ID избранного прямо внутри свайпера
  const [localFavs, setLocalFavs] = useState([]);

  // Читаем избранное из локального хранилища при загрузке
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
    e.stopPropagation(); // Не переходим на страницу товара

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
    setLocalFavs(updatedFavs); // Мгновенно перекрашиваем сердечко!

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

  // --- ЛОГИКА КЛИКА ПО КОРЗИНЕ ---
  const handleCartClick = (e, item) => {
    e.stopPropagation(); // Не переходим на страницу товара
    
    // Добавляем в корзину. Передаем товар и пустую строку вместо размера
    if (addToCart) {
      addToCart(item, ""); 
    }

    // Вызываем заветное уведомление!
    setSnackbarMessage(`"${item.name}" добавлен в корзину! 🛒`);
    setOpenSnackbar(true);
  };

  return (
    <Box sx={{ width: '100%', mb: 5 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#1a1a1a' }}>
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
        style={{ paddingBottom: '40px' }}
      >
        {products.map((item) => {
          const isFavorited = localFavs.includes(item.id);

          return (
            <SwiperSlide key={item.id}>
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

                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: '#f9f9f9' }}>
                  <img src={item.image} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </Box>

                <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ color: '#888', mb: 0.5 }}>{item.brand}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: '#1a1a1a', flexGrow: 1 }}>{item.name}</Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f449e' }}>{item.price.toLocaleString()} ₽</Typography>
                    
                    {/* ИКОНКА КОРЗИНЫ С СЮРПРИЗОМ */}
                    <IconButton
                      sx={{ bgcolor: '#0f449e', color: '#fff', '&:hover': { bgcolor: '#0b3376' }, borderRadius: '8px' }}
                      onClick={(e) => handleCartClick(e, item)}
                    >
                      <ShoppingCartIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* УВЕДОМЛЕНИЕ (ОДНО НА ВСЕ СЛУЧАИ ЖИЗНИ) */}
      <Snackbar open={openSnackbar} autoHideDuration={2000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} style={{ zIndex: 9999 }}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', bgcolor: '#0f449e', color: '#fff', fontWeight: 600, borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', '& .MuiAlert-icon': { color: '#fff' } }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default RecommendedSwiper;