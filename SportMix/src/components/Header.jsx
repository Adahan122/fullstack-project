import React, { useState, useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import WhatshotIcon from '@mui/icons-material/Whatshot';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { CartContext } from '../App';
import { useNavigate } from 'react-router-dom';

const categoryButtons = [
  { label: 'Все товары', value: 'all', icon: <AutoAwesomeIcon sx={{ fontSize: 16 }} /> },
  { label: 'Новинки', value: 'New', icon: <WhatshotIcon sx={{ fontSize: 16 }} />, isNew: true },
  { label: 'Скидки', value: 'Sale', icon: <LocalOfferIcon sx={{ fontSize: 16 }} />, isSale: true },
  { label: 'Обувь', value: 'Shoes' },
  { label: 'Одежда', value: 'Clothes' },
  { label: 'Сумки', value: 'Bags' },
];

// Добавил пропсы user и onLogout
const Header = ({ onCategoryChange, selectedCategory, favoritesCount = 0, searchQuery = '', onSearchChange, user, onLogout }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart } = useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- ЛОГИКА ДЛЯ ПРОФИЛЯ ЮЗЕРА ---
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  const handleOpenProfileMenu = (event) => setProfileAnchorEl(event.currentTarget);
  const handleCloseProfileMenu = () => setProfileAnchorEl(null);

  const totalItems = Array.isArray(cart) ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const totalPrice = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
    : 0;

  return (
    <AppBar
      position='sticky'
      sx={{
        top: 0, 
        zIndex: 1100,
        bgcolor: '#ffffff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        border: 'none',
      }}
    >
      {/* 1. Тонкая верхняя плашка */}
      <Box
        sx={{
          bgcolor: '#0f449e',
          height: '35px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: 4,
        }}
      >
        {user ? (
          <>
            {/* Если пользователь авторизован */}
            <Typography
              sx={{ color: '#fff', fontSize: '11px', fontWeight: 600, mx: 1.5, opacity: 0.9, letterSpacing: '0.5px' }}
            >
              ПРИВЕТ, {user.username.toUpperCase()}!
            </Typography>
            <Typography
              onClick={onLogout}
              sx={{
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                mx: 1.5,
                opacity: 0.8,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                '&:hover': { opacity: 1 },
              }}
            >
              Выйти
            </Typography>
          </>
        ) : (
          <>
            {/* Если пользователь ГОСТЬ */}
            <Typography
              onClick={() => navigate('/login')}
              sx={{
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                mx: 1.5,
                opacity: 0.8,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                '&:hover': { opacity: 1 },
              }}
            >
              Вход
            </Typography>
            <Typography
              onClick={() => navigate('/register')}
              sx={{
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                mx: 1.5,
                opacity: 0.8,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                '&:hover': { opacity: 1 },
              }}
            >
              Регистрация
            </Typography>
          </>
        )}
        
        <Typography
          sx={{
            color: '#fff',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            mx: 1.5,
            opacity: 0.8,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            '&:hover': { opacity: 1 },
          }}
        >
          Помощь
        </Typography>
      </Box>

      {/* 2. Основная шапка */}
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5,
          px: { xs: 2, md: 4 },
        }}
      >
        {/* ЛОГОТИП */}
        <Typography
          variant='h5'
          sx={{
            fontWeight: 900,
            letterSpacing: '1px',
            color: '#1A202C',
            cursor: 'pointer',
            fontFamily: '"Montserrat", sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
          onClick={() => {
            navigate('/');
            onCategoryChange && onCategoryChange('all');
          }}
        >
          SPORT<span style={{ color: '#0f449e' }}>MIX</span>
        </Typography>

        {/* Поиск */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: 600 }}>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <InputBase
              placeholder='Поиск кроссовок, одежды и аксессуаров...'
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              sx={{
                bgcolor: '#F7FAFC',
                color: '#1A202C',
                borderRadius: '50px', 
                pl: 3,
                pr: 6,
                py: 1,
                width: '100%',
                fontSize: 14,
                border: '1px solid #EDF2F7',
                transition: 'all 0.2s ease',
                '&:focus-within': {
                  borderColor: '#0f449e',
                  bgcolor: '#fff',
                  boxShadow: '0 0 0 4px rgba(15, 68, 158, 0.1)',
                },
              }}
            />
            <IconButton
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#0f449e',
              }}
            >
              <SearchIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Иконки */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 3 }}>
          {/* ПРОФИЛЬ */}
          <IconButton
            sx={{
              color: '#2D3748',
              transition: 'all 0.2s ease',
              '&:hover': { color: '#0f449e', transform: 'translateY(-2px)' },
            }}
            onClick={handleOpenProfileMenu}
          >
            <PersonOutlineIcon sx={{ fontSize: 26 }} />
          </IconButton>

          <Menu
            anchorEl={profileAnchorEl}
            open={isProfileMenuOpen}
            onClose={handleCloseProfileMenu}
            PaperProps={{
              sx: {
                width: 180,
                borderRadius: '12px',
                mt: 1.5,
                p: 1,
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: 'none',
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleCloseProfileMenu();
                navigate('/profile');
              }}
              sx={{ fontSize: 14, fontWeight: 700, borderRadius: '6px', color: '#2D3748' }}
            >
              Мой профиль
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCloseProfileMenu();
                navigate('/orders');
              }}
              sx={{ fontSize: 14, fontWeight: 700, borderRadius: '6px', color: '#2D3748' }}
            >
              Мои заказы
            </MenuItem>
            
            {/* Динамическая кнопка Войти/Выйти в меню */}
            {user ? (
              <MenuItem
                onClick={() => {
                  handleCloseProfileMenu();
                  onLogout();
                }}
                sx={{ fontSize: 14, fontWeight: 700, borderRadius: '6px', color: '#E53E3E' }}
              >
                Выйти
              </MenuItem>
            ) : (
              <MenuItem
                onClick={() => {
                  handleCloseProfileMenu();
                  navigate('/login');
                }}
                sx={{ fontSize: 14, fontWeight: 700, borderRadius: '6px', color: '#0f449e' }}
              >
                Войти
              </MenuItem>
            )}
          </Menu>

          {/* ИЗБРАННОЕ */}
          <IconButton
            sx={{
              color: '#2D3748',
              transition: 'all 0.2s ease',
              '&:hover': { color: '#E53E3E', transform: 'translateY(-2px)' },
            }}
            onClick={() => navigate('/favorites')}
          >
            <Badge
              badgeContent={favoritesCount}
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: '#E53E3E',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 'bold',
                },
              }}
            >
              <FavoriteBorderIcon sx={{ fontSize: 26 }} />
            </Badge>
          </IconButton>

          {/* КОРЗИНА */}
          <IconButton
            sx={{
              color: '#2D3748',
              transition: 'all 0.2s ease',
              '&:hover': { color: '#0f449e', transform: 'translateY(-2px)' },
            }}
            onClick={() => setIsCartOpen(true)}
          >
            <Badge
              badgeContent={totalItems}
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: '#0f449e',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 'bold',
                },
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 26 }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>

      {/* 3. КНОПКИ КАТЕГОРИЙ */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 2,
          py: 1.5,
          bgcolor: '#F9FAFB',
          borderBottom: '1px solid #EDF2F7',
        }}
      >
        {categoryButtons.map((cat) => {
          const isActive = selectedCategory === cat.value;

          let btnColor = '#4A5568';
          let bgColor = 'transparent';

          if (isActive) {
            btnColor = '#fff';
            bgColor = cat.isSale ? '#E53E3E' : '#0f449e';
          } else if (cat.isSale) {
            btnColor = '#E53E3E';
          } else if (cat.isNew) {
            btnColor = '#D69E2E';
          }

          return (
            <Button
              key={cat.value}
              variant={isActive ? 'contained' : 'text'}
              onClick={() => {
                navigate('/');
                onCategoryChange && onCategoryChange(cat.value);
              }}
              startIcon={cat.icon}
              sx={{
                bgcolor: bgColor,
                color: btnColor,
                fontWeight: 700,
                borderRadius: '50px',
                px: 3,
                py: 0.5,
                textTransform: 'none',
                boxShadow: isActive ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
                border: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isActive ? (cat.isSale ? '#C53030' : '#0b3376') : '#EDF2F7',
                  boxShadow: isActive ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {cat.label}
            </Button>
          );
        })}
      </Box>

      {/* Выезжающая корзина (Drawer) */}
      <Drawer
        anchor='right'
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        PaperProps={{
          sx: { borderRadius: '16px 0 0 16px', boxShadow: '-10px 0 30px rgba(0,0,0,0.05)' },
        }}
      >
        <Box
          sx={{
            width: { xs: '100vw', sm: '420px' },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
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
            <Typography variant='h6' sx={{ fontWeight: 800, color: '#1A202C' }}>
              Корзина
            </Typography>
            <Typography variant='body2' sx={{ color: '#718096', fontWeight: 600 }}>
              {totalItems} товаров
            </Typography>
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
                <ShoppingCartIcon sx={{ fontSize: 50, color: '#CBD5E0' }} />
                <Typography sx={{ color: '#718096', fontWeight: 600 }}>
                  В корзине пока пусто
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {cart.map((item, index) => (
                  <ListItem
                    key={`${item.id}-${item.selectedSize}-${index}`}
                    sx={{
                      mb: 2,
                      alignItems: 'center',
                      border: '1px solid #EDF2F7',
                      borderRadius: '12px',
                      p: 1.5,
                      transition: 'all 0.2s ease',
                      '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
                    }}
                  >
                    <Box
                      sx={{
                        width: '70px',
                        height: '70px',
                        bgcolor: '#F7FAFC',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        p: 0.5,
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#1A202C' }}>
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          {item.selectedSize && (
                            <Typography
                              variant='caption'
                              sx={{ display: 'block', color: '#718096', fontWeight: 600 }}
                            >
                              Размер:{' '}
                              <span style={{ color: '#1A202C' }}>{item.selectedSize}</span>
                            </Typography>
                          )}
                          <Typography
                            variant='caption'
                            sx={{ color: '#0f449e', fontWeight: 800, fontSize: '12px' }}
                          >
                            {parseFloat(item.price).toLocaleString()} ₽ × {item.quantity} шт.
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton
                      sx={{ color: '#A0AEC0', '&:hover': { color: '#E53E3E' } }}
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {cart.length > 0 && (
            <Box sx={{ p: 3, borderTop: '1px solid #EDF2F7', bgcolor: '#F7FAFC' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography sx={{ fontWeight: 700, color: '#1A202C' }}>Итого к оплате:</Typography>
                <Typography sx={{ fontWeight: 900, color: '#0f449e', fontSize: '1.4rem' }}>
                  {totalPrice.toLocaleString()} ₽
                </Typography>
              </Box>
              <Button
                variant='contained'
                fullWidth
                sx={{
                  bgcolor: '#0f449e',
                  color: '#fff',
                  py: 2,
                  borderRadius: '50px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(15, 68, 158, 0.2)',
                  '&:hover': { bgcolor: '#0b3376', boxShadow: '0 6px 15px rgba(15, 68, 158, 0.3)' },
                }}
              >
                Оформить заказ
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header;