import React, { useContext } from 'react';
import { Box, Typography, Button, Rating, Chip, IconButton } from '@mui/material';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { CartContext } from '../App';

const ProductCard = ({ item, onOpenDetail, isFavorite, onToggleFavorite }) => {
  const { addToCart } = useContext(CartContext);

  // === ВСЕЯДНАЯ ЛОГИКА СКИДКИ (Берет и oldPrice, и old_price) ===
  const rawPrice = parseFloat(item.price);
  const rawOldPrice = parseFloat(item.oldPrice || item.old_price);

  let discount = null;
  if (rawOldPrice && rawOldPrice > rawPrice) {
    const percent = Math.round((1 - rawPrice / rawOldPrice) * 100);
    if (percent > 0) discount = `-${percent}%`;
  }
  // ==========================================================

  // Обработчик добавления в корзину
  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(item);
  };

  // Обработчик клика по сердечку
  const handleToggleFavorite = (e) => {
    e.stopPropagation(); // Чтобы не открывалась модалка товара
    if (onToggleFavorite) {
      onToggleFavorite(item.id);
    }
  };

  return (
    <Box
      onClick={() => onOpenDetail && onOpenDetail(item)} // Открываем модалку при клике на карточку
      sx={{
        height: '100%',
        width: '100%',
        maxWidth: 220,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: '8px',
        border: '1px solid #f1f1f1',
        backgroundColor: '#fff',
        transition: 'box-shadow 0.3s ease, transform 0.2s ease',
        cursor: 'pointer',
        mx: 'auto',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          transform: 'translateY(-2px)', // Небольшой интерактив при наведении
        },
      }}
    >
      {/* Красный бейдж со скидкой */}
      {discount && (
        <Chip
          label={discount}
          color='error'
          size='small'
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontWeight: 700,
            fontSize: 14,
            zIndex: 2,
            borderRadius: 1,
          }}
        />
      )}

      {/* Изображение товара */}
      <Box
        sx={{
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f6f6f6',
          borderRadius: '8px 8px 0 0',
          p: 2,
          position: 'relative', // Добавили, чтобы сердечко позиционировалось относительно этой коробки
          overflow: 'hidden',
          borderBottom: '1px solid #f1f1f1',
        }}
      >
        <Box
          component='img'
          src={item.image}
          alt={item.name}
          sx={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
            mixBlendMode: 'multiply',
          }}
        />

        {/* Кнопка "В избранное" */}
        <IconButton
          onClick={handleToggleFavorite}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 2,
            width: 36,
            height: 36,
            '&:hover': {
              backgroundColor: '#fff',
            },
          }}
        >
          {isFavorite ? (
            <FavoriteIcon sx={{ color: '#eb2f2f', fontSize: '1.3rem' }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: '#1a1a1a', fontSize: '1.3rem' }} />
          )}
        </IconButton>
      </Box>

      {/* Контентная часть */}
      <Box
        sx={{
          p: '12px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          gap: 0.5,
        }}
      >
        {/* Цена */}
        <Box display='flex' alignItems='baseline' gap={1} sx={{ mb: '2px' }}>
          <Typography variant='body1' sx={{ fontWeight: '800', color: '#000', fontSize: '1.1rem' }}>
            {parseFloat(item.price).toLocaleString()} ₽
          </Typography>

          {/* === ИСПРАВЛЕНО: Теперь используем вычисленную переменную rawOldPrice === */}
          {rawOldPrice && rawOldPrice > rawPrice && (
            <Typography
              variant='caption'
              sx={{ textDecoration: 'line-through', color: '#888', fontWeight: '600' }}
            >
              {rawOldPrice.toLocaleString()} ₽
            </Typography>
          )}
        </Box>

        {/* Название */}
        <Typography
          variant='body2'
          sx={{
            fontWeight: '600',
            lineHeight: 1.2,
            height: '2.4em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: '#1a1a1a',
            mb: 0.5,
          }}
        >
          {item.name}
        </Typography>
        <Typography sx={{ color: 'red', fontSize: '10px' }}>
          Прайс: {item.price} | Олд: {item.old_price || 'нету'} | Олд2: {item.oldPrice || 'нету'}
        </Typography>

        {/* Рейтинг */}
        <Box display='flex' alignItems='center' gap={0.5} sx={{ mt: 'auto', mb: 1.5 }}>
          <Rating
            value={parseFloat(item.rating)}
            precision={0.1}
            size='small'
            readOnly
            sx={{ color: '#000' }}
          />
          <Typography
            variant='caption'
            sx={{ fontWeight: '700', color: '#000', fontSize: '0.75rem' }}
          >
            ({item.reviews})
          </Typography>
        </Box>

        {/* Кнопка "В корзину" */}
        <Button
          variant='contained'
          fullWidth
          onClick={handleAddToCart} // Вызываем функцию с stopPropagation
          startIcon={<LocalMallIcon sx={{ fontSize: '1.1rem !important' }} />}
          sx={{
            backgroundColor: '#1976d2',
            color: '#fff',
            borderRadius: '6px',
            textTransform: 'none',
            fontWeight: '700',
            fontSize: '0.9rem',
            py: 1,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#1565c0',
              boxShadow: 'none',
            },
          }}
        >
          В корзину
        </Button>
      </Box>
    </Box>
  );
};

export default ProductCard;
