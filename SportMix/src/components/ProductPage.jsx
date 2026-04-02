import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// 1. ДОБАВИЛИ Snackbar и Alert в импорты
import { Box, Typography, Button, Container, Grid, Rating, CircularProgress, Snackbar, Alert } from '@mui/material';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from './Header'; 

// Импортируем созданный контекст из App.jsx
import { CartContext } from '../App';

function ProductPage() {
    
  const { id } = useParams(); // Забираем id из URL
  const navigate = useNavigate();
  
  // Достаем функцию добавления в корзину из глобального стейта
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  
  // 2. ДОБАВИЛИ СТЕЙТ ДЛЯ УВЕДОМЛЕНИЯ
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Запрос данных с твоего бэкенда
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/data`)
      .then((res) => res.json())
      .then((data) => {
        // Ищем товар, сравнивая ID
        const foundProduct = data.find(item => String(item.id) === String(id));
        setProduct(foundProduct);
      })
      .catch((err) => console.error('Ошибка загрузки товара:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} sx={{ color: '#0f449e' }} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5">Товар не найден</Typography>
        <Button onClick={() => navigate('/')} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Вернуться на главную
        </Button>
      </Container>
    );
  }

  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;

  const handleAddToCartClick = () => {
    if (hasSizes && !selectedSize) {
      alert('Пожалуйста, выберите размер!');
      return;
    }
    
    addToCart(product, selectedSize);
    setOpenSnackbar(true); // 3. ВКЛЮЧАЕМ УВЕДОМЛЕНИЕ ПРИ КЛИКЕ
  };

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      <Header />
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <Button 
          onClick={() => navigate('/')} 
          startIcon={<ArrowBackIcon />} 
          sx={{ color: '#1a1a1a', fontWeight: '700', mb: 4, textTransform: 'none' }}
        >
          Назад к покупкам
        </Button>

        <Grid container spacing={6}>
          {/* Левая колонка: Картинка */}
          <Grid item xs={12} md={6}>
            <Box sx={{ width: '100%', bgcolor: '#f6f6f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, height: { xs: '350px', md: '550px' } }}>
              <Box component="img" src={product.image} alt={product.name} sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
            </Box>
          </Grid>

          {/* Правая колонка: Инфо */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="subtitle1" sx={{ color: '#0f449e', fontWeight: 'bold', textTransform: 'uppercase', mb: 1 }}>
                {product.brand}
              </Typography>

              <Typography variant="h3" sx={{ fontWeight: 900, color: '#1a1a1a', mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                {product.name}
              </Typography>

              <Box display='flex' alignItems='center' gap={1} sx={{ mb: 3 }}>
                <Rating value={parseFloat(product.rating)} precision={0.1} readOnly sx={{ color: '#000' }} />
                <Typography variant='body2' sx={{ fontWeight: '700', color: '#000' }}>
                  ({product.reviews} отзывов)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#000', mr: 2 }}>
                  {parseFloat(product.price).toLocaleString()} ₽
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ color: '#555', mb: 4, lineHeight: 1.8 }}>
                {product.description || 'Высококачественный спортивный товар, созданный специально для достижения максимальных результатов.'}
              </Typography>

              {/* Размеры */}
              {hasSizes && (
                <Box sx={{ mb: 5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1a1a1a' }}>
                    Выберите размер:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "contained" : "outlined"}
                        onClick={() => setSelectedSize(size)}
                        sx={{
                          minWidth: '55px',
                          height: '45px',
                          borderRadius: '6px',
                          borderColor: selectedSize === size ? '#0f449e' : '#ddd',
                          bgcolor: selectedSize === size ? '#0f449e' : '#fff',
                          color: selectedSize === size ? '#fff' : '#1a1a1a',
                          fontWeight: 'bold',
                          '&:hover': { borderColor: '#0f449e', bgcolor: selectedSize === size ? '#0b3376' : '#f5f5f5' }
                        }}
                      >
                        {size}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Кнопка */}
              <Button
                variant="contained"
                size="large"
                startIcon={<LocalMallIcon />}
                onClick={handleAddToCartClick}
                sx={{
                  bgcolor: '#1976d2',
                  color: '#fff',
                  py: 1.5,
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1565c0', boxShadow: 'none' },
                  width: { xs: '100%', md: '280px' }
                }}
              >
                Добавить в корзину
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* 4. САМ КОМПОНЕНТ УВЕДОМЛЕНИЯ (ВСПЛЫВАЕТ СНИЗУ СПРАВА) */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={3000} // Скроется само через 3 секунды
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="success" 
          variant="filled"
          sx={{ 
            bgcolor: '#0f449e', // Твой фирменный глубокий синий цвет
            color: '#fff', 
            fontWeight: 'bold',
            minWidth: '250px'
          }}
        >
          {product.name} добавлен в корзину!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProductPage;