import { memo, useMemo, useState, useCallback } from 'react';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TuneIcon from '@mui/icons-material/Tune';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { useNavigate } from 'react-router-dom';

import CartDrawer from './CartDrawer';
import { useApp } from '../context/app-context';
import { formatCurrency } from '../lib/format';

const categoryButtons = [
  { label: 'Все товары', value: 'all', icon: <AutoAwesomeIcon sx={{ fontSize: 16 }} /> },
  { label: 'Новинки', value: 'New', icon: <WhatshotIcon sx={{ fontSize: 16 }} />, isNew: true },
  { label: 'Скидки', value: 'Sale', icon: <LocalOfferIcon sx={{ fontSize: 16 }} />, isSale: true },
  { label: 'Обувь', value: 'Shoes' },
  { label: 'Одежда', value: 'Clothes' },
  { label: 'Сумки', value: 'Bags' },
];

const audienceButtons = [
  { label: 'Мужчинам', value: 'Men' },
  { label: 'Женщинам', value: 'Women' },
  { label: 'Детям', value: 'Kids' },
];

function Header({
  onCategoryChange,
  onAudienceChange,
  selectedCategory = 'all',
  selectedAudience = 'all',
  showCatalogFilters = false,
  searchQuery = '',
  onSearchChange,
  searchSuggestions = [],
  searchResultsCount = 0,
  searchIsPending = false,
  onSuggestionSelect,
}) {
  const navigate = useNavigate();
  const {
    cart,
    cartItemsCount,
    cartSubtotal,
    favorites,
    removeFromCart,
    updateCartQuantity,
    user,
    isAdmin,
    logout,
  } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isProfileMenuOpen = Boolean(profileAnchorEl);
  const normalizedQuery = searchQuery.trim();
  const showSuggestions = isSearchOpen && normalizedQuery.length > 0;
  const quickStats = useMemo(
    () => [
      { label: 'Найдено', value: `${searchResultsCount}` },
      { label: 'Избранное', value: `${favorites.length}` },
      { label: 'Корзина', value: `${cartItemsCount}` },
    ],
    [cartItemsCount, favorites.length, searchResultsCount],
  );

  const handleOpenProfileMenu = useCallback((event) => setProfileAnchorEl(event.currentTarget), []);
  const handleCloseProfileMenu = useCallback(() => setProfileAnchorEl(null), []);

  const navigateTo = useCallback(
    (path) => {
      setProfileAnchorEl(null);
      navigate(path);
    },
    [navigate],
  );

  const handleSuggestionClick = useCallback(
    (suggestion) => {
      onSuggestionSelect?.(suggestion);
      setIsSearchOpen(false);
    },
    [onSuggestionSelect],
  );

  return (
    <AppBar
      position='sticky'
      sx={{
        top: 0,
        zIndex: 1100,
        bgcolor: 'rgba(252, 252, 253, 0.88)',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 14px 50px rgba(15, 23, 42, 0.08)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(90deg, #0f172a 0%, #0f449e 55%, #1d4ed8 100%)',
          minHeight: { xs: '28px', sm: '34px', md: '42px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: { xs: 1.25, md: 4 },
        }}
      >
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.84)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          Search-first shopping experience
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            ml: 'auto',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          {user ? (
            <>
              <Typography
                sx={{
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  opacity: 0.95,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Привет, {(user.username || user.name || 'друг').toUpperCase()}
              </Typography>
              <Typography
                onClick={logout}
                sx={{
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  '&:hover': { color: '#fff' },
                }}
              >
                Выйти
              </Typography>
            </>
          ) : (
            <>
              <Typography
                onClick={() => navigate('/login')}
                sx={{
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  '&:hover': { color: '#fff' },
                }}
              >
                Вход
              </Typography>
              <Typography
                onClick={() => navigate('/register')}
                sx={{
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  '&:hover': { color: '#fff' },
                }}
              >
                Регистрация
              </Typography>
            </>
          )}
        </Box>
      </Box>

      <Toolbar
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', lg: '220px minmax(0, 1fr) auto' },
          alignItems: 'center',
          gap: { xs: 0.8, md: 2.5 },
          py: { xs: 0.75, md: 2.5 },
          px: { xs: 1, sm: 1.5, md: 4 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.35,
            cursor: 'pointer',
            minWidth: 0,
            gridColumn: { xs: '1', lg: 'auto' },
            gridRow: { xs: '1', lg: 'auto' },
            alignItems: { xs: 'flex-start', lg: 'flex-start' },
            textAlign: 'left',
          }}
          onClick={() => {
            navigate('/');
            onCategoryChange?.('all');
          }}
        >
          <Typography
            variant='h4'
            sx={{
              fontWeight: 900,
              color: '#0f172a',
              fontFamily: '"Montserrat", sans-serif',
              letterSpacing: 0,
              lineHeight: 1,
              fontSize: { xs: '1.45rem', md: '2.125rem' },
            }}
          >
            SPORT<span style={{ color: '#0f449e' }}>MIX</span>
          </Typography>
          <Typography
            sx={{
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Быстрый поиск. Четкий выбор.
          </Typography>
        </Box>

        <ClickAwayListener onClickAway={() => setIsSearchOpen(false)}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              minWidth: 0,
              gridColumn: { xs: '1 / -1', lg: 'auto' },
              gridRow: { xs: '2', lg: 'auto' },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: { xs: '22px', md: '30px' },
                px: { xs: 0.8, md: 2 },
                py: { xs: 0.55, md: 1.15 },
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.65, md: 1.25 },
                border: showSuggestions
                  ? '1px solid rgba(15, 68, 158, 0.24)'
                  : '1px solid rgba(148, 163, 184, 0.22)',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: showSuggestions
                  ? '0 20px 45px rgba(15, 68, 158, 0.12)'
                  : {
                      xs: '0 8px 18px rgba(15, 23, 42, 0.05)',
                      md: '0 12px 30px rgba(15, 23, 42, 0.05)',
                    },
                transition: 'all 0.2s ease',
              }}
            >
              <Box
                sx={{
                  width: { xs: 32, md: 42 },
                  height: { xs: 32, md: 42 },
                  borderRadius: { xs: '11px', md: '14px' },
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, #0f449e 0%, #2563eb 100%)',
                  color: '#fff',
                  flexShrink: 0,
                  boxShadow: '0 12px 24px rgba(37, 99, 235, 0.24)',
                }}
              >
                <SearchIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
              </Box>

              <InputBase
                placeholder='Ищи по названию, бренду или категории'
                value={searchQuery}
                onChange={(event) => onSearchChange?.(event.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  color: '#0f172a',
                  fontSize: { xs: 13, md: 15 },
                  fontWeight: 600,
                  '& input::placeholder': { color: '#94a3b8', opacity: 1, fontWeight: 500 },
                }}
              />

              <Chip
                icon={<TuneIcon sx={{ fontSize: '16px !important' }} />}
                label={searchIsPending ? 'Поиск...' : `${searchResultsCount} результатов`}
                sx={{
                  display: { xs: 'none', md: 'inline-flex' },
                  backgroundColor: searchIsPending
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'rgba(15, 68, 158, 0.08)',
                  color: searchIsPending ? '#b45309' : '#0f449e',
                  fontWeight: 700,
                  borderRadius: '999px',
                }}
              />
            </Paper>

            {showSuggestions && (
              <Paper
                elevation={0}
                sx={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  left: 0,
                  right: 0,
                  p: 1.25,
                  borderRadius: '24px',
                  border: '1px solid rgba(148, 163, 184, 0.22)',
                  boxShadow: '0 25px 60px rgba(15, 23, 42, 0.14)',
                  background: 'rgba(255,255,255,0.97)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1,
                    pb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                    }}
                  >
                    Быстрые подсказки
                  </Typography>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#0f449e' }}>
                    {searchResultsCount} найдено
                  </Typography>
                </Box>

                {searchSuggestions.length > 0 ? (
                  <List disablePadding>
                    {searchSuggestions.map((suggestion) => (
                      <ListItemButton
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        sx={{
                          borderRadius: '18px',
                          px: 1.25,
                          py: 1,
                          mb: 0.5,
                          alignItems: 'center',
                          '&:hover': { backgroundColor: 'rgba(15, 68, 158, 0.05)' },
                        }}
                      >
                        <Box
                          sx={{
                            width: 54,
                            height: 54,
                            borderRadius: '16px',
                            backgroundColor: '#f8fafc',
                            display: 'grid',
                            placeItems: 'center',
                            mr: 1.5,
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={suggestion.image}
                            alt={suggestion.name}
                            loading='lazy'
                            decoding='async'
                            style={{ maxWidth: '88%', maxHeight: '88%', objectFit: 'contain' }}
                          />
                        </Box>
                        <ListItemText
                          disableTypography
                          primary={
                            <Typography
                              sx={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}
                            >
                              {suggestion.name}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              component='span'
                              sx={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}
                            >
                              {suggestion.brand} • {formatCurrency(suggestion.price)}
                            </Typography>
                          }
                        />
                        <NorthEastIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      </ListItemButton>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ px: 1.25, py: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                      Ничего близкого не нашли
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '13px' }}>
                      Попробуй бренд, например Nike, Adidas или категорию Shoes.
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1.2 }} />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 1 }}>
                  {quickStats.map((stat) => (
                    <Chip
                      key={stat.label}
                      label={`${stat.label}: ${stat.value}`}
                      sx={{
                        backgroundColor: '#f8fafc',
                        color: '#334155',
                        fontWeight: 700,
                        borderRadius: '999px',
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        </ClickAwayListener>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: { xs: 0.35, md: 1.25 },
            gridColumn: { xs: '2', lg: 'auto' },
            gridRow: { xs: '1', lg: 'auto' },
            minWidth: 0,
          }}
        >
          <IconButton
            sx={{
              color: '#2D3748',
              width: { xs: 38, md: 44 },
              height: { xs: 38, md: 44 },
              '&:hover': { color: '#0f449e' },
            }}
            onClick={handleOpenProfileMenu}
          >
            <PersonOutlineIcon sx={{ fontSize: { xs: 22, md: 26 } }} />
          </IconButton>

          <Menu
            anchorEl={profileAnchorEl}
            open={isProfileMenuOpen}
            onClose={handleCloseProfileMenu}
            PaperProps={{
              sx: {
                width: 190,
                borderRadius: '18px',
                mt: 1.5,
                p: 1,
                boxShadow: '0 18px 44px rgba(15, 23, 42, 0.12)',
              },
            }}
          >
            <MenuItem
              onClick={() => navigateTo(user ? '/profile' : '/login')}
              sx={{ fontSize: 14, fontWeight: 700, color: '#2D3748', borderRadius: '12px' }}
            >
              Мой профиль
            </MenuItem>
            <MenuItem
              onClick={() => navigateTo(user ? '/orders' : '/login')}
              sx={{ fontSize: 14, fontWeight: 700, color: '#2D3748', borderRadius: '12px' }}
            >
              Мои заказы
            </MenuItem>
            {isAdmin && (
              <MenuItem
                onClick={() => navigateTo('/admin')}
                sx={{ fontSize: 14, fontWeight: 700, color: '#0f449e', borderRadius: '12px' }}
              >
                Админка
              </MenuItem>
            )}
            {user ? (
              <MenuItem
                onClick={() => {
                  handleCloseProfileMenu();
                  logout();
                }}
                sx={{ fontSize: 14, fontWeight: 700, color: '#E53E3E', borderRadius: '12px' }}
              >
                Выйти
              </MenuItem>
            ) : (
              <MenuItem
                onClick={() => navigateTo('/login')}
                sx={{ fontSize: 14, fontWeight: 700, color: '#0f449e', borderRadius: '12px' }}
              >
                Войти
              </MenuItem>
            )}
          </Menu>

          <IconButton
            sx={{
              color: '#2D3748',
              width: { xs: 38, md: 44 },
              height: { xs: 38, md: 44 },
              '&:hover': { color: '#E53E3E' },
            }}
            onClick={() => navigate('/favorites')}
          >
            <Badge
              badgeContent={favorites.length}
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: '#E53E3E',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 'bold',
                },
              }}
            >
              <FavoriteBorderIcon sx={{ fontSize: { xs: 22, md: 26 } }} />
            </Badge>
          </IconButton>

          <IconButton
            sx={{
              color: '#2D3748',
              width: { xs: 38, md: 44 },
              height: { xs: 38, md: 44 },
              '&:hover': { color: '#0f449e' },
            }}
            onClick={() => setIsCartOpen(true)}
          >
            <Badge
              badgeContent={cartItemsCount}
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: '#0f449e',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 'bold',
                },
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: { xs: 22, md: 26 } }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>

      {showCatalogFilters && (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'flex-start', md: 'center' },
              flexWrap: { xs: 'nowrap', md: 'wrap' },
              overflowX: { xs: 'auto', md: 'visible' },
              gap: { xs: 0.65, md: 1.25 },
              py: { xs: 0.55, md: 1.6 },
              px: { xs: 1, md: 2 },
              background:
                'linear-gradient(180deg, rgba(248,250,252,0.96) 0%, rgba(241,245,249,0.78) 100%)',
              borderTop: '1px solid rgba(148,163,184,0.12)',
              borderBottom: '1px solid rgba(148,163,184,0.14)',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {categoryButtons.map((category) => {
              const isActive = selectedCategory === category.value;
              let buttonColor = '#475569';
              let backgroundColor = 'rgba(255,255,255,0.85)';

              if (isActive) {
                buttonColor = '#fff';
                backgroundColor = category.isSale ? '#dc2626' : '#0f449e';
              } else if (category.isSale) {
                buttonColor = '#dc2626';
              } else if (category.isNew) {
                buttonColor = '#b45309';
              }

              return (
                <Button
                  key={category.value}
                  variant={isActive ? 'contained' : 'text'}
                  onClick={() => {
                    navigate('/');
                    onCategoryChange?.(category.value);
                  }}
                  startIcon={category.icon}
                  sx={{
                    flexShrink: 0,
                    minHeight: { xs: 30, md: 36 },
                    bgcolor: backgroundColor,
                    color: buttonColor,
                    fontWeight: 800,
                    borderRadius: '999px',
                    px: { xs: 1.25, md: 2.6 },
                    py: { xs: 0.35, md: 0.8 },
                    fontSize: { xs: '12px', md: '14px' },
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    border: isActive ? 'none' : '1px solid rgba(148,163,184,0.18)',
                    boxShadow: isActive
                      ? { xs: 'none', md: '0 12px 28px rgba(15, 68, 158, 0.22)' }
                      : 'none',
                    '& .MuiButton-startIcon': {
                      mr: { xs: 0.4, md: 0.8 },
                      '& svg': { fontSize: { xs: 14, md: 16 } },
                    },
                    '&:hover': {
                      bgcolor: isActive ? (category.isSale ? '#b91c1c' : '#0b3376') : '#ffffff',
                    },
                  }}
                >
                  {category.label}
                </Button>
              );
            })}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'flex-start', md: 'center' },
              flexWrap: { xs: 'nowrap', md: 'wrap' },
              overflowX: { xs: 'auto', md: 'visible' },
              gap: { xs: 0.6, md: 1 },
              py: { xs: 0.45, md: 1.05 },
              px: { xs: 1, md: 2 },
              background: '#ffffff',
              borderBottom: '1px solid rgba(148,163,184,0.12)',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {audienceButtons.map((audience) => {
              const isActive = selectedAudience === audience.value;

              return (
                <Button
                  key={audience.value}
                  variant={isActive ? 'contained' : 'text'}
                  onClick={() => {
                    navigate('/');
                    onAudienceChange?.(audience.value);
                  }}
                  sx={{
                    flexShrink: 0,
                    borderRadius: '999px',
                    minHeight: { xs: 28, md: 34 },
                    px: { xs: 1.25, md: 2.6 },
                    py: { xs: 0.25, md: 0.65 },
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: { xs: '12px', md: '14px' },
                    bgcolor: isActive ? '#0f172a' : 'transparent',
                    color: isActive ? '#fff' : '#475569',
                    border: isActive ? 'none' : '1px solid rgba(148,163,184,0.18)',
                    '&:hover': { bgcolor: isActive ? '#020617' : '#f8fafc' },
                  }}
                >
                  {audience.label}
                </Button>
              );
            })}
          </Box>
        </>
      )}

      <CartDrawer
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartItemsCount={cartItemsCount}
        cartSubtotal={cartSubtotal}
        removeFromCart={removeFromCart}
        updateCartQuantity={updateCartQuantity}
      />
    </AppBar>
  );
}

export default memo(Header);
