import { memo, useState } from 'react';
import { Alert, Box, Chip, IconButton, Rating, Snackbar, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

import { useApp } from '../context/app-context';
import { calculateDiscount, formatCurrency } from '../lib/format';

function ProductGrid({ products }) {
  const navigate = useNavigate();
  const { addToCart, isFavorite, requireAuth, toggleFavorite } = useApp();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') {
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

    const result = addToCart(item, '');

    if (result?.requiresAuth) {
      return;
    }

    if (result?.success) {
      showMessage(`"${item.name}" добавлен в корзину`);
      return;
    }

    showMessage(result?.error || 'Не удалось добавить товар в корзину');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: { xs: 0.8, sm: 1.2, md: 2.4 },
          alignItems: 'stretch',
        }}
      >
        {products.map((item) => {
          const rawPrice = Number(item.price);
          const rawOldPrice = Number(item.oldPrice || item.old_price);
          const discount = calculateDiscount(rawPrice, rawOldPrice);
          const favorited = isFavorite(item.id);
          const stock = Number(item.stock || 0);
          const isOutOfStock = stock <= 0;
          const stockLabel = isOutOfStock ? 'Нет' : stock <= 3 ? `Ост. ${stock}` : 'В наличии';

          return (
            <Box key={item.id} sx={{ minWidth: 0 }}>
              <Box
                onClick={() => navigate(`/product/${item.id}`)}
                sx={{
                  position: 'relative',
                  height: '100%',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: { xs: '12px', sm: '18px', md: '26px' },
                  overflow: 'hidden',
                  border: '1px solid rgba(148,163,184,0.14)',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                  boxShadow: {
                    xs: '0 8px 20px rgba(15,23,42,0.045)',
                    md: '0 16px 40px rgba(15,23,42,0.06)',
                  },
                  cursor: 'pointer',
                  transition:
                    'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                  '&:hover': {
                    transform: { xs: 'none', md: 'translateY(-5px)' },
                    boxShadow: '0 22px 54px rgba(15,23,42,0.12)',
                    borderColor: 'rgba(15,68,158,0.22)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: { xs: 8, md: 14 },
                    left: { xs: 8, md: 14 },
                    right: { xs: 8, md: 14 },
                    zIndex: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: { xs: 0.35, md: 0.8 },
                      minWidth: 0,
                    }}
                  >
                    <Chip
                      label={
                        discount ||
                        (item.is_new ? 'New' : item.subcategory || item.category || 'Sport')
                      }
                      size='small'
                      sx={{
                        height: { xs: 20, md: 28 },
                        maxWidth: { xs: 96, md: 150 },
                        bgcolor: discount ? '#dc2626' : 'rgba(255,255,255,0.94)',
                        color: discount ? '#fff' : '#0f449e',
                        fontWeight: 900,
                        borderRadius: '999px',
                        boxShadow: {
                          xs: 'none',
                          md: discount ? '0 12px 24px rgba(220,38,38,0.24)' : 'none',
                        },
                        '& .MuiChip-label': {
                          px: { xs: 0.8, md: 1.4 },
                          fontSize: { xs: '10px', md: '13px' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                      }}
                    />
                    <Chip
                      label={stockLabel}
                      size='small'
                      sx={{
                        height: { xs: 19, md: 24 },
                        alignSelf: 'flex-start',
                        bgcolor: isOutOfStock
                          ? 'rgba(239,68,68,0.12)'
                          : stock <= 3
                            ? 'rgba(245,158,11,0.12)'
                            : 'rgba(34,197,94,0.12)',
                        color: isOutOfStock ? '#b91c1c' : stock <= 3 ? '#b45309' : '#15803d',
                        fontWeight: 900,
                        borderRadius: '999px',
                        '& .MuiChip-label': {
                          px: { xs: 0.75, md: 1 },
                          fontSize: { xs: '10px', md: '12px' },
                        },
                      }}
                    />
                  </Box>

                  <IconButton
                    size='small'
                    onClick={(event) => handleFavoriteClick(event, item)}
                    sx={{
                      width: { xs: 30, md: 42 },
                      height: { xs: 30, md: 42 },
                      bgcolor: 'rgba(255,255,255,0.94)',
                      boxShadow: {
                        xs: '0 6px 14px rgba(15,23,42,0.10)',
                        md: '0 10px 24px rgba(15,23,42,0.10)',
                      },
                      '&:hover': { bgcolor: '#fff' },
                    }}
                  >
                    {favorited ? (
                      <FavoriteIcon sx={{ color: '#ef4444', fontSize: { xs: 18, md: 24 } }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ color: '#475569', fontSize: { xs: 18, md: 24 } }} />
                    )}
                  </IconButton>
                </Box>

                <Box
                  sx={{
                    aspectRatio: { xs: '1 / 0.9', sm: '1 / 0.98', md: '1 / 1.02' },
                    minHeight: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: { xs: 1.1, md: 2.5 },
                    pt: { xs: 3.7, md: 6 },
                    pb: { xs: 0.9, md: 2 },
                    background:
                      'linear-gradient(180deg, rgba(248,250,252,0.92) 0%, rgba(241,245,249,0.78) 100%)',
                  }}
                >
                  <Box
                    component='img'
                    src={item.image}
                    alt={item.name}
                    loading='lazy'
                    decoding='async'
                    sx={{
                      width: '100%',
                      height: '100%',
                      maxHeight: { xs: 118, sm: 132, md: 190 },
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 10px 18px rgba(15,23,42,0.09))',
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    p: { xs: 1.1, sm: 1.35, md: 2.5 },
                    pt: { xs: 0.9, md: 1.5 },
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    sx={{
                      color: '#0f449e',
                      fontSize: { xs: '10px', md: '12px' },
                      fontWeight: 900,
                      letterSpacing: 0,
                      textTransform: 'uppercase',
                      mb: { xs: 0.45, md: 0.9 },
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.brand || 'Brand'}
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: '#0f172a',
                      fontSize: { xs: '12px', sm: '13px', md: '1rem' },
                      lineHeight: { xs: 1.25, md: 1.35 },
                      minHeight: { xs: '2.5em', md: '2.7em' },
                      mb: { xs: 0.65, md: 1.1 },
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.name}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 0.35, md: 0.75 },
                      mb: { xs: 0.7, md: 1.4 },
                      minWidth: 0,
                    }}
                  >
                    <Rating
                      value={Number(item.rating) || 0}
                      precision={0.1}
                      readOnly
                      size='small'
                      sx={{
                        color: '#f59e0b',
                        '& .MuiRating-icon': { fontSize: { xs: 13, md: 18 } },
                      }}
                    />
                    <Typography
                      sx={{
                        color: '#64748b',
                        fontSize: { xs: '10.5px', md: '12px' },
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.reviews || 0}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 0.8,
                      mt: 'auto',
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          color: '#0f172a',
                          fontSize: { xs: '14px', sm: '16px', md: '1.35rem' },
                          letterSpacing: 0,
                          lineHeight: 1.1,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatCurrency(rawPrice)}
                      </Typography>
                      {discount ? (
                        <Typography
                          sx={{
                            textDecoration: 'line-through',
                            color: '#94a3b8',
                            fontWeight: 700,
                            fontSize: { xs: '11px', md: '0.9rem' },
                            lineHeight: 1.2,
                          }}
                        >
                          {formatCurrency(rawOldPrice)}
                        </Typography>
                      ) : null}
                    </Box>

                    <IconButton
                      aria-label={isOutOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
                      disabled={isOutOfStock}
                      size='small'
                      onClick={(event) => handleCartClick(event, item)}
                      sx={{
                        width: { xs: 34, md: 42 },
                        height: { xs: 34, md: 42 },
                        flexShrink: 0,
                        bgcolor: isOutOfStock ? '#e2e8f0' : '#0f449e',
                        color: '#fff',
                        borderRadius: { xs: '11px', md: '14px' },
                        boxShadow: isOutOfStock ? 'none' : '0 10px 20px rgba(15,68,158,0.20)',
                        '&:hover': { bgcolor: isOutOfStock ? '#e2e8f0' : '#0b3376' },
                        '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
                      }}
                    >
                      <ShoppingCartIcon sx={{ fontSize: { xs: 18, md: 22 } }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: { xs: 7, md: 0 } }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity='success'
          sx={{
            width: '100%',
            bgcolor: '#0f449e',
            color: '#fff',
            fontWeight: 700,
            borderRadius: '14px',
            boxShadow: '0 14px 30px rgba(15,68,158,0.24)',
            '& .MuiAlert-icon': { color: '#fff' },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default memo(ProductGrid);
