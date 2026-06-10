import { memo, useMemo } from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

import { formatCurrency } from '../lib/format';
import { deliveryOptions, getDeliveryOption } from '../lib/shop-content';

function CartDrawer({
  open,
  onClose,
  cart,
  cartItemsCount,
  cartSubtotal,
  removeFromCart,
  updateCartQuantity,
}) {
  const navigate = useNavigate();
  const selectedDelivery = useMemo(() => getDeliveryOption('courier'), []);
  const orderTotal = cartSubtotal + selectedDelivery.fee;

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: '24px 0 0 24px', borderLeft: '1px solid rgba(148,163,184,0.16)' },
      }}
    >
      <Box
        sx={{
          width: { xs: '100vw', sm: '460px' },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid #EDF2F7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 900, color: '#0f172a' }}>
              Корзина
            </Typography>
            <Typography variant='body2' sx={{ color: '#64748b', fontWeight: 700 }}>
              {cartItemsCount} товаров
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
          {cart.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 82,
                  height: 82,
                  borderRadius: '24px',
                  display: 'grid',
                  placeItems: 'center',
                  background:
                    'linear-gradient(135deg, rgba(15,68,158,0.08) 0%, rgba(37,99,235,0.18) 100%)',
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 42, color: '#0f449e' }} />
              </Box>
              <Typography sx={{ color: '#0f172a', fontWeight: 800 }}>
                В корзине пока пусто
              </Typography>
              <Typography
                sx={{ color: '#64748b', fontSize: '14px', maxWidth: 280, textAlign: 'center' }}
              >
                Добавь товары из каталога, и они появятся здесь.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              <List disablePadding>
                {cart.map((item, index) => (
                  <Box
                    key={`${item.id}-${item.selectedSize}-${index}`}
                    sx={{
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      border: '1px solid rgba(148,163,184,0.14)',
                      borderRadius: '18px',
                      p: 1.5,
                      backgroundColor: '#fff',
                      boxShadow: '0 10px 25px rgba(15,23,42,0.04)',
                    }}
                  >
                    <Box
                      sx={{
                        width: '72px',
                        height: '72px',
                        bgcolor: '#F8FAFC',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 0.5,
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        loading='lazy'
                        decoding='async'
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                    <ListItemText
                      disableTypography
                      primary={
                        <Typography sx={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Box component='span' sx={{ display: 'block', mt: 0.5 }}>
                          {item.selectedSize && (
                            <Typography
                              component='span'
                              variant='caption'
                              sx={{ display: 'block', color: '#64748b', fontWeight: 700 }}
                            >
                              Размер: {item.selectedSize}
                            </Typography>
                          )}
                          <Typography
                            component='span'
                            variant='caption'
                            sx={{ color: '#0f449e', fontWeight: 900, fontSize: '12px' }}
                          >
                            {formatCurrency(item.price)} x {item.quantity} шт.
                          </Typography>
                        </Box>
                      }
                    />
                    <Stack spacing={0.75} alignItems='flex-end'>
                      <Stack
                        direction='row'
                        spacing={0.35}
                        alignItems='center'
                        sx={{ bgcolor: '#f8fafc', borderRadius: '999px', p: 0.4 }}
                      >
                        <IconButton
                          size='small'
                          sx={{ color: '#475569' }}
                          onClick={() =>
                            updateCartQuantity(item.id, item.selectedSize, item.quantity - 1)
                          }
                        >
                          <RemoveIcon fontSize='inherit' />
                        </IconButton>
                        <Typography
                          sx={{
                            minWidth: 20,
                            textAlign: 'center',
                            fontWeight: 800,
                            color: '#0f172a',
                            fontSize: '13px',
                          }}
                        >
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size='small'
                          sx={{ color: '#0f449e' }}
                          onClick={() =>
                            updateCartQuantity(item.id, item.selectedSize, item.quantity + 1)
                          }
                        >
                          <AddIcon fontSize='inherit' />
                        </IconButton>
                      </Stack>
                      <IconButton
                        sx={{ color: '#94a3b8', '&:hover': { color: '#E53E3E' } }}
                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                ))}
              </List>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '22px',
                  bgcolor: '#fff',
                  border: '1px solid rgba(148,163,184,0.12)',
                }}
              >
                <Typography sx={{ fontWeight: 900, color: '#0f172a', mb: 1.5 }}>
                  Что будет дальше
                </Typography>
                <Stack spacing={1.2}>
                  {deliveryOptions.map((option) => (
                    <Box
                      key={option.value}
                      sx={{
                        p: 1.5,
                        borderRadius: '16px',
                        bgcolor: '#f8fafc',
                        border: '1px solid rgba(148,163,184,0.12)',
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {option.label}
                      </Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '13px', mt: 0.4 }}>
                        {option.description}{' '}
                        {option.fee > 0 ? `• ${formatCurrency(option.fee)}` : '• бесплатно'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          )}
        </Box>

        {cart.length > 0 && (
          <Box sx={{ p: 3, borderTop: '1px solid #EDF2F7', bgcolor: '#fff' }}>
            <Stack spacing={1.1} sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#64748b', fontWeight: 700 }}>Товары</Typography>
                <Typography sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {formatCurrency(cartSubtotal)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#64748b', fontWeight: 700 }}>Доставка от</Typography>
                <Typography sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {selectedDelivery.fee > 0 ? formatCurrency(selectedDelivery.fee) : 'Бесплатно'}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Итого ориентировочно
                </Typography>
                <Typography sx={{ fontWeight: 900, color: '#0f449e', fontSize: '1.4rem' }}>
                  {formatCurrency(orderTotal)}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant='contained'
              fullWidth
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => {
                onClose?.();
                navigate('/checkout');
              }}
              sx={{
                bgcolor: '#0f449e',
                color: '#fff',
                py: 2,
                borderRadius: '999px',
                fontWeight: 900,
                boxShadow: '0 16px 28px rgba(15,68,158,0.24)',
              }}
            >
              Перейти к оформлению
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

export default memo(CartDrawer);
