import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import Header from './Header';
import ProductGrid from './ProductGrid';
import Sidebar from './Sidebar';
import RecommendedSwiper from './RecommendedSwiper';
import Footer from './Footer';

function HomePage({ user, onLogout }) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all'); 
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // --- ЛОГИКА ДЛЯ МОДАЛЬНОГО ОКНА АВТОРИЗАЦИИ ---
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('hasSeenAuthModal');
    
    if (!user && !hasSeenModal) {
      const timer = setTimeout(() => {
        setAuthModalOpen(true);
        localStorage.setItem('hasSeenAuthModal', 'true');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleCloseModal = () => {
    setAuthModalOpen(false);
  };

  const handleOrderAttempt = (product) => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      setOpenSnackbar(false);
      setTimeout(() => {
        setSnackbarMessage(`Товар "${product.name || 'Товар'}" успешно добавлен в ваш заказ! 🚀`);
        setOpenSnackbar(true);
      }, 10);
    }
  };

  // --- ЛОГИКА ДЛЯ СНЕКБАРА (УВЕДОМЛЕНИЙ) ---
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleCloseSnackbar = (event, reason) => {
    setOpenSnackbar(false);
  };

  // --- ЛОГИКА ИЗБРАННОГО ---
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (productId) => {
    const isAdding = !favorites.includes(productId);
    
    setFavorites((prev) =>
      isAdding
        ? [...prev, productId]
        : prev.filter((id) => id !== productId)
    );

    const product = data.find((item) => item.id === productId);
    const productName = product ? product.name : 'Товар';

    setOpenSnackbar(false);

    setTimeout(() => {
      setSnackbarMessage(
        isAdding 
          ? `"${productName}" добавлен в избранное 🖤` 
          : `"${productName}" удален из избранного`
      );
      setOpenSnackbar(true);
    }, 10); 
  };

  const catalogRef = useRef(null);

  const handleScrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Запрос к бэкенду на Render
  useEffect(() => {
    fetch('https://backend-72bv.onrender.com/api/data')
      .then(async (res) => {
        let json;
        try {
          json = await res.json();
        } catch (e) {
          throw new Error('Некорректный ответ сервера');
        }
        if (json && json.error) throw new Error(json.error);
        if (!Array.isArray(json)) throw new Error('Ответ сервера не является массивом данных.');
        return json;
      })
      .then((data) => setData(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  const prices = data.map((item) => item.price).filter((v) => typeof v === 'number');
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 10000;
  const allBrands = Array.from(new Set(data.map((item) => item.brand).filter(Boolean)));

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedBrands([]);
  }, [minPrice, maxPrice]);

  const filterProducts = (arr) => {
    let filtered = arr;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const nameMatch = item.name ? item.name.toLowerCase().includes(query) : false;
        const brandMatch = item.brand ? item.brand.toLowerCase().includes(query) : false;
        return nameMatch || brandMatch;
      });
    }

    if (category === 'New') {
      filtered = filtered.filter((item) => item.is_new);
    } else if (category === 'Sale') {
      filtered = filtered.filter((item) => {
        const itemOldPrice = item.oldPrice || item.old_price;
        return item.is_sale || itemOldPrice;
      });
    } else if (category !== 'all') {
      filtered = filtered.filter((item) => item.category === category);
    }

    filtered = filtered.filter((item) => {
      const priceOk = item.price >= priceRange[0] && item.price <= priceRange[1];
      const brandOk = selectedBrands.length === 0 || selectedBrands.includes(item.brand);
      return priceOk && brandOk;
    });

    return filtered;
  };

  const newProducts = filterProducts(data.filter((item) => item.is_new));
  const allProducts = filterProducts(data);

  const swiperProducts = [...data]
    .filter((item) => item.rating)
    .sort((a, b) => (b.reviews || 0) + (b.rating || 0) - ((a.reviews || 0) + (a.rating || 0)))
    .slice(0, 12);

  const handlePriceChange = (e, newValue) => setPriceRange(newValue);
  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const isSidebarFiltered =
    selectedBrands.length > 0 || 
    priceRange[0] !== minPrice || 
    priceRange[1] !== maxPrice ||
    searchQuery.length > 0;

  const getCatalogTitle = () => {
    if (category === 'all') return 'Наш лучший выбор';
    if (category === 'Shoes') return 'Спортивная обувь';
    if (category === 'Clothes') return 'Стильная одежда';
    if (category === 'Bags') return 'Аксессуары и сумки';
    return 'Результаты поиска';
  };

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <Header 
        onCategoryChange={setCategory} 
        selectedCategory={category} 
        favoritesCount={favorites.length} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        user={user} onLogout={onLogout}
      />

      <Box
        sx={{
          minHeight: '65vh', width: '100vw', position: 'relative', left: '50%', right: '50%',
          marginLeft: '-50vw', marginRight: '-50vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, rgba(15, 68, 158, 0.45) 0%, rgba(0, 0, 0, 0.7) 100%), url('https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&auto=format&fit=crop&w=1500&q=80') center/cover no-repeat fixed`,
          mb: 6, boxShadow: 'inset 0px -20px 30px -10px #F9FAFB', 
        }}
      >
        <Box sx={{ textAlign: 'center', color: '#fff', zIndex: 2, px: 3, maxWidth: '900px' }}>
          <Typography
            variant='h1'
            sx={{
              fontWeight: 900, fontSize: { xs: '2.8rem', sm: '4rem', md: '5.5rem' },
              letterSpacing: '-0.03em', lineHeight: 1.1, textTransform: 'uppercase', mb: 2,
              fontFamily: '"Montserrat", "Roboto", sans-serif', textShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            Раскрой свой <br /> потенциал
          </Typography>
          
          <Typography
            sx={{
              fontSize: { xs: '1rem', md: '1.3rem' }, fontWeight: 400, mb: 4, opacity: 0.9,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)', maxWidth: '600px', mx: 'auto'
            }}
          >
            Лучшая экипировка для твоих новых спортивных рекордов с доставкой до двери.
          </Typography>

          <Button
            variant='contained'
            onClick={handleScrollToCatalog}
            sx={{
              borderRadius: '50px', bgcolor: '#fff', color: '#0f449e', fontWeight: 800,
              fontSize: { xs: 15, md: 17 }, px: 6, py: 2, boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
              textTransform: 'uppercase', transition: 'all 0.3s ease',
              '&:hover': { bgcolor: '#0f449e', color: '#fff', boxShadow: '0 15px 25px rgba(15, 68, 158, 0.3)', transform: 'translateY(-3px)' },
              '&:active': { transform: 'translateY(-1px)' }
            }}
          >
            Перейти к покупкам
          </Button>
        </Box>
      </Box>

      <Container maxWidth='xl' sx={{ mb: 10, flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress size={50} thickness={4} sx={{ color: '#0f449e' }} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', mt: 8, p: 5, bgcolor: '#FFF5F5', borderRadius: '12px' }}>
            <Typography variant='h5' sx={{ color: '#E53E3E', fontWeight: 700, mb: 1 }}>
              Упс! Что-то пошло не так
            </Typography>
            <Typography sx={{ color: '#718096' }}>{error.message}</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
            
            <Box sx={{ width: '280px', flexShrink: 0, display: { xs: 'none', lg: 'block' }, position: 'sticky', top: '20px' }}>
              <Sidebar
                minPrice={minPrice} maxPrice={maxPrice} priceRange={priceRange}
                onPriceChange={handlePriceChange} brands={allBrands} selectedBrands={selectedBrands}
                onBrandChange={handleBrandChange} products={data}
              />
            </Box>

            <Box ref={catalogRef} sx={{ flex: 1, minWidth: 0 }}>
              
              {allProducts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A202C', mb: 1 }}>
                    Ничего не найдено 😢
                  </Typography>
                  <Typography sx={{ color: '#718096' }}>
                    Попробуйте изменить запрос или сбросить фильтры.
                  </Typography>
                </Box>
              ) : isSidebarFiltered ? (
                <Box sx={{ mb: 8 }}>
                  <Typography variant='h4' sx={{ fontWeight: 800, color: '#1A202C', mb: 1, textAlign: 'left' }}>
                    Результаты фильтрации
                  </Typography>
                  <Typography sx={{ color: '#718096', mb: 4 }}>
                    Найдено товаров: <b>{allProducts.length}</b>
                  </Typography>
                  <ProductGrid products={allProducts} favorites={favorites} onToggleFavorite={toggleFavorite} onOrder={handleOrderAttempt} />
                </Box>
              ) : (
                <>
                  {(category === 'all' || category === 'Shoes' || category === 'Clothes' || category === 'Bags') && (
                    <Box sx={{ mb: 8 }}>
                      <Typography variant='h4' sx={{ fontWeight: 800, color: '#1A202C', mb: 4, textAlign: 'left', position: 'relative',
                        '&:after': { content: '""', display: 'block', width: '50px', height: '4px', bgcolor: '#0f449e', borderRadius: '2px', mt: 1 }
                      }}>
                        {getCatalogTitle()}
                      </Typography>
                      
                      <ProductGrid products={allProducts.slice(0, 8)} favorites={favorites} onToggleFavorite={toggleFavorite} onOrder={handleOrderAttempt} />

                      <Box sx={{ mt: 8, p: 4, bgcolor: '#FFF', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <RecommendedSwiper products={swiperProducts} title="Рекомендуем также 🔥" onToggleFavorite={toggleFavorite} onOrder={handleOrderAttempt} />
                      </Box>
                    </Box>
                  )}

                  {category === 'New' && (
                    <Box sx={{ mb: 8 }}>
                      <Typography variant='h4' sx={{ fontWeight: 800, color: '#1A202C', mb: 4, textAlign: 'left', position: 'relative',
                        '&:after': { content: '""', display: 'block', width: '50px', height: '4px', bgcolor: '#FFB800', borderRadius: '2px', mt: 1 }
                      }}>
                        🔥 Свежие поступления
                      </Typography>
                      <ProductGrid products={newProducts} favorites={favorites} onToggleFavorite={toggleFavorite} onOrder={handleOrderAttempt} />
                    </Box>
                  )}

                  {category === 'Sale' && (
                    <Box sx={{ mb: 8 }}>
                      <Typography variant='h4' sx={{ fontWeight: 800, color: '#1A202C', mb: 4, textAlign: 'left', position: 'relative',
                        '&:after': { content: '""', display: 'block', width: '50px', height: '4px', bgcolor: '#E53E3E', borderRadius: '2px', mt: 1 }
                      }}>
                        🏷️ Лучшие скидки
                      </Typography>
                      <ProductGrid products={allProducts} favorites={favorites} onToggleFavorite={toggleFavorite} onOrder={handleOrderAttempt} />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        )}
      </Container>

      <Footer />

      <Snackbar open={openSnackbar} autoHideDuration={2500} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={handleCloseSnackbar} severity="success"
          sx={{ 
            width: '100%', bgcolor: '#1A202C', color: '#fff', fontWeight: 600, borderRadius: '12px', px: 3, py: 1.5,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)', '& .MuiAlert-icon': { color: '#48BB78' }, '& .MuiAlert-action': { color: '#fff' }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* --- МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ --- */}
      <Dialog open={authModalOpen} onClose={handleCloseModal} PaperProps={{ sx: { borderRadius: '20px', p: 1, maxWidth: '400px', position: 'relative' } }}>
        <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', right: 12, top: 12, color: '#718096' }}>
          <CloseIcon />
        </IconButton>

        <DialogContent sx={{ textAlign: 'center', mt: 3, mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A202C', mb: 1 }}>
            Привет, {user?.username || 'в SportShop'}! 👋
          </Typography>
          
          <Typography sx={{ color: '#718096', mb: 4, fontSize: '0.95rem' }}>
            Чтобы совершать покупки, отслеживать заказы и получать персональные скидки, войдите в аккаунт.
          </Typography>

          <Button
            variant="contained" fullWidth
            onClick={() => { setAuthModalOpen(false); navigate('/login'); }}
            sx={{ bgcolor: '#0f449e', fontWeight: 700, py: 1.5, borderRadius: '10px', mb: 2, '&:hover': { bgcolor: '#0b337a' } }}
          >
            Войти в аккаунт
          </Button>

          <Button
            variant="outlined" fullWidth
            onClick={() => { setAuthModalOpen(false); navigate('/register'); }}
            sx={{ borderColor: '#0f449e', color: '#0f449e', fontWeight: 700, py: 1.5, borderRadius: '10px', borderWidth: '2px', '&:hover': { borderWidth: '2px', borderColor: '#0b337a', color: '#0b337a' } }}
          >
            Создать профиль
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default HomePage;