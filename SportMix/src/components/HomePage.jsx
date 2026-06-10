import {
  lazy,
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import SouthRoundedIcon from '@mui/icons-material/SouthRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

import Footer from './Footer';
const LazyFooter = lazy(() => import('./Footer'));
import Header from './Header';
import ProductGrid from './ProductGrid';
import Sidebar from './Sidebar';
import { useApp } from '../context/app-context';
import { getRecommendedProducts } from '../lib/catalog';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useProducts } from '../hooks/useProducts';
import { searchProducts } from '../lib/api';
import { homeCampaigns } from '../lib/shop-content';

const RecommendedSwiper = lazy(() => import('./RecommendedSwiper'));

function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogRef = useRef(null);
  const filtersHydratedRef = useRef(false);
  const { hasSeenAuthPrompt, markAuthPromptSeen, user } = useApp();
  const { products, loading, error } = useProducts();
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [authPromoOpen, setAuthPromoOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // Server-side search state
  const [serverProducts, setServerProducts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 100);
  const isSearchPending = searchQuery !== debouncedSearchQuery;

  /*
   * URL params are the external source for catalog filters here.
   * This hydration effect intentionally syncs router state into local controls.
   */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (loading) {
      return;
    }

    const categoryParam = searchParams.get('category');
    const queryParam = searchParams.get('q');
    const brandsParam = searchParams.get('brands');
    const gendersParam = searchParams.get('genders');
    const sizesParam = searchParams.get('sizes');
    const stockParam = searchParams.get('stock');
    const sortParam = searchParams.get('sort');

    setCategory(categoryParam || 'all');
    setSearchQuery(queryParam || '');
    setSelectedBrands(brandsParam ? brandsParam.split(',').filter(Boolean) : []);
    setSelectedGenders(gendersParam ? gendersParam.split(',').filter(Boolean) : []);
    setSelectedSizes(sizesParam ? sizesParam.split(',').filter(Boolean) : []);
    setOnlyInStock(stockParam === '1');
    setSortBy(sortParam || 'featured');

    filtersHydratedRef.current = true;
  }, [loading, searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!filtersHydratedRef.current) {
      return;
    }

    const nextParams = new URLSearchParams();

    if (category !== 'all') {
      nextParams.set('category', category);
    }

    if (searchQuery.trim()) {
      nextParams.set('q', searchQuery.trim());
    }

    if (selectedBrands.length > 0) {
      nextParams.set('brands', selectedBrands.join(','));
    }

    if (selectedGenders.length > 0) {
      nextParams.set('genders', selectedGenders.join(','));
    }

    if (selectedSizes.length > 0) {
      nextParams.set('sizes', selectedSizes.join(','));
    }

    if (onlyInStock) {
      nextParams.set('stock', '1');
    }

    if (sortBy !== 'featured') {
      nextParams.set('sort', sortBy);
    }

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    category,
    onlyInStock,
    searchParams,
    searchQuery,
    selectedBrands,
    selectedGenders,
    selectedSizes,
    sortBy,
    setSearchParams,
  ]);

  useEffect(() => {
    if (user || hasSeenAuthPrompt) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setAuthPromoOpen(true);
      markAuthPromptSeen();
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasSeenAuthPrompt, markAuthPromptSeen, user]);

  // Server-side search effect - runs on component mount and when search changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      setSearchLoading(true);
      try {
        const result = await searchProducts(debouncedSearchQuery, 100, 0);
        setServerProducts(result.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setServerProducts([]);
      } finally {
        setSearchLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery]);

  // Client-side filtering of search results
  const filteredProducts = useMemo(() => {
    const normalizedBrands =
      selectedBrands.length > 0
        ? new Set(selectedBrands.map((brand) => brand.toLowerCase()))
        : null;
    const normalizedGenders =
      selectedGenders.length > 0
        ? new Set(selectedGenders.map((gender) => gender.toLowerCase()))
        : null;
    const normalizedSizes =
      selectedSizes.length > 0
        ? new Set(selectedSizes.map((size) => String(size).toLowerCase()))
        : null;

    // Filter server results by client-side filters
    const baseProducts = serverProducts.filter((item) => {
      const itemBrand = item.brand?.toLowerCase() || '';
      const itemGender = item.gender?.toLowerCase() || '';
      const itemSizes = Array.isArray(item.sizes)
        ? item.sizes.map((size) => String(size).toLowerCase())
        : [];

      const matchesBrand = !normalizedBrands || normalizedBrands.has(itemBrand);
      const matchesGender = !normalizedGenders || normalizedGenders.has(itemGender);
      const matchesSize = !normalizedSizes || itemSizes.some((size) => normalizedSizes.has(size));

      return matchesBrand && matchesGender && matchesSize;
    });

    const availableProducts = !onlyInStock
      ? baseProducts
      : baseProducts.filter((item) => Number(item.stock || 0) > 0);

    const sortedProducts = [...availableProducts];

    if (sortBy === 'price_asc') {
      sortedProducts.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === 'price_desc') {
      sortedProducts.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === 'rating') {
      sortedProducts.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === 'newest') {
      sortedProducts.sort((a, b) => Number(Boolean(b.is_new)) - Number(Boolean(a.is_new)));
    } else if (sortBy === 'discount') {
      sortedProducts.sort((a, b) => {
        const discountA = Number(a.oldPrice || a.old_price || 0) - Number(a.price || 0);
        const discountB = Number(b.oldPrice || b.old_price || 0) - Number(b.price || 0);
        return discountB - discountA;
      });
    }

    return sortedProducts;
  }, [onlyInStock, selectedBrands, selectedGenders, selectedSizes, sortBy, serverProducts]);

  const searchSuggestions = [];

  const newProducts = useMemo(
    () => filteredProducts.filter((item) => item.is_new),
    [filteredProducts],
  );
  const recommendedProducts = useMemo(() => getRecommendedProducts(products), [products]);

  const isSidebarFiltered =
    selectedBrands.length > 0 ||
    selectedGenders.length > 0 ||
    selectedSizes.length > 0 ||
    onlyInStock ||
    debouncedSearchQuery.trim().length > 0;

  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (category !== 'all') {
      chips.push({ key: 'category', label: `Категория: ${category}` });
    }

    if (debouncedSearchQuery.trim()) {
      chips.push({ key: 'search', label: `Поиск: ${debouncedSearchQuery.trim()}` });
    }

    if (selectedBrands.length > 0) {
      chips.push(...selectedBrands.map((brand) => ({ key: `brand-${brand}`, label: brand })));
    }

    if (selectedGenders.length > 0) {
      chips.push(
        ...selectedGenders.map((gender) => ({ key: `gender-${gender}`, label: `Пол: ${gender}` })),
      );
    }

    if (selectedSizes.length > 0) {
      chips.push(
        ...selectedSizes.map((size) => ({ key: `size-${size}`, label: `Размер: ${size}` })),
      );
    }

    if (onlyInStock) {
      chips.push({ key: 'stock', label: 'Только в наличии' });
    }

    return chips;
  }, [category, debouncedSearchQuery, onlyInStock, selectedBrands, selectedGenders, selectedSizes]);

  const getCatalogTitle = () => {
    if (category === 'all') return 'Наш лучший выбор';
    if (category === 'Shoes') return 'Спортивная обувь';
    if (category === 'Clothes') return 'Стильная одежда';
    if (category === 'Bags') return 'Аксессуары и сумки';
    if (category === 'New') return 'Свежие поступления';
    if (category === 'Sale') return 'Лучшие скидки';
    return 'Результаты поиска';
  };

  const handleScrollToCatalog = useCallback(() => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleBrandChange = useCallback((brand) => {
    setSelectedBrands((currentBrands) =>
      currentBrands.includes(brand)
        ? currentBrands.filter((currentBrand) => currentBrand !== brand)
        : [...currentBrands, brand],
    );
  }, []);

  const handleGenderChange = useCallback((gender) => {
    setSelectedGenders((currentGenders) =>
      currentGenders.includes(gender)
        ? currentGenders.filter((currentGender) => currentGender !== gender)
        : [...currentGenders, gender],
    );
  }, []);

  const handleAudienceChange = useCallback((audience) => {
    setSelectedGenders(audience === 'all' ? [] : [audience]);
  }, []);

  const handleSizeChange = useCallback((size) => {
    setSelectedSizes((currentSizes) =>
      currentSizes.includes(size)
        ? currentSizes.filter((currentSize) => currentSize !== size)
        : [...currentSizes, size],
    );
  }, []);

  const handleSearchChange = useCallback((value) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  }, []);

  const handleSuggestionSelect = useCallback(
    (suggestion) => {
      setSearchQuery(suggestion.name);
      navigate(`/product/${suggestion.id}`);
    },
    [navigate],
  );

  const resetSearchExperience = useCallback(() => {
    setSearchQuery('');
    setCategory('all');
    setSelectedBrands([]);
    setSelectedGenders([]);
    setSelectedSizes([]);
    setOnlyInStock(false);
    setSortBy('featured');
  }, []);

  const closePromo = useCallback(() => setAuthPromoOpen(false), []);

  return (
    <Box
      sx={{
        bgcolor: '#eef4fb',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header
        onCategoryChange={setCategory}
        onAudienceChange={handleAudienceChange}
        selectedCategory={category}
        selectedAudience={selectedGenders.length === 1 ? selectedGenders[0] : 'all'}
        showCatalogFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchSuggestions={searchSuggestions}
        searchResultsCount={filteredProducts.length}
        searchIsPending={isSearchPending}
        onSuggestionSelect={handleSuggestionSelect}
      />

      <Box
        sx={{
          minHeight: { xs: 190, sm: 280, md: '68vh' },
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            "radial-gradient(circle at 15% 20%, rgba(125,211,252,0.28) 0%, transparent 22%), radial-gradient(circle at 80% 18%, rgba(96,165,250,0.20) 0%, transparent 24%), linear-gradient(125deg, rgba(15,23,42,0.76) 0%, rgba(15,68,158,0.66) 48%, rgba(37,99,235,0.58) 100%), url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&auto=format&fit=crop&w=1600') center/cover no-repeat",
          mb: { xs: 1.5, md: 6 },
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(15,23,42,0.04) 0%, rgba(238,244,251,0.2) 100%)',
          }}
        />

        <Container maxWidth='xl' sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ maxWidth: '760px', px: { xs: 0.5, sm: 1.5, md: 4 }, py: { xs: 1.8, md: 0 } }}>
            <Chip
              icon={<AutoAwesomeIcon sx={{ fontSize: '16px !important' }} />}
              label='Поиск стал быстрее и умнее'
              sx={{
                mb: { xs: 1.2, md: 2.5 },
                display: { xs: 'none', sm: 'inline-flex' },
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.14)',
                backdropFilter: 'blur(10px)',
                fontWeight: 800,
              }}
            />

            <Typography
              variant='h1'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.82rem', sm: '3.4rem', md: '5.7rem' },
                letterSpacing: 0,
                lineHeight: { xs: 1, md: 0.94 },
                color: '#fff',
                mb: { xs: 1.2, md: 2 },
                fontFamily: '"Montserrat", sans-serif',
                textTransform: 'uppercase',
                textShadow: '0 18px 40px rgba(15,23,42,0.34)',
              }}
            >
              Найди
              <br />
              свой ритм
            </Typography>

            <Typography
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontSize: { xs: '0.92rem', md: '1.18rem' },
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.84)',
                maxWidth: '560px',
                mb: 4,
              }}
            >
              Ищи быстрее, фильтруй точнее и переходи к товару без лишнего шума. Мы сделали каталог
              более четким, воздушным и современным.
            </Typography>

            <Stack
              direction={{ xs: 'row', sm: 'row' }}
              spacing={1}
              sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
            >
              <Button
                variant='contained'
                endIcon={<SouthRoundedIcon />}
                onClick={handleScrollToCatalog}
                sx={{
                  borderRadius: '999px',
                  bgcolor: '#fff',
                  color: '#0f172a',
                  fontWeight: 900,
                  px: { xs: 1.6, md: 4.2 },
                  py: { xs: 0.9, md: 1.8 },
                  boxShadow: '0 20px 40px rgba(15,23,42,0.26)',
                  '&:hover': { bgcolor: '#e2e8f0' },
                }}
              >
                Открыть каталог
              </Button>
              <Button
                variant='outlined'
                onClick={() => navigate('/favorites')}
                sx={{
                  borderRadius: '999px',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.28)',
                  fontWeight: 800,
                  px: { xs: 1.6, md: 4.2 },
                  py: { xs: 0.9, md: 1.8 },
                  backdropFilter: 'blur(8px)',
                  '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.06)' },
                }}
              >
                Посмотреть избранное
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth='xl' sx={{ mb: 4, display: { xs: 'none', md: 'block' } }}>
        <Grid container spacing={2.2}>
          {homeCampaigns.map((campaign) => (
            <Grid item xs={12} md={4} key={campaign.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.6,
                  height: '100%',
                  borderRadius: '28px',
                  border: '1px solid rgba(148,163,184,0.14)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
                  boxShadow: '0 24px 60px rgba(15,23,42,0.06)',
                }}
              >
                <Chip
                  label='Campaign'
                  sx={{
                    mb: 1.2,
                    bgcolor: 'rgba(15,68,158,0.08)',
                    color: '#0f449e',
                    fontWeight: 900,
                    borderRadius: '999px',
                  }}
                />
                <Typography
                  sx={{
                    fontWeight: 900,
                    color: '#0f172a',
                    fontSize: '1.4rem',
                    mb: 0.8,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {campaign.title}
                </Typography>
                <Typography sx={{ color: '#64748b', lineHeight: 1.75, mb: 2.2 }}>
                  {campaign.subtitle}
                </Typography>
                <Button
                  variant='contained'
                  onClick={() => setCategory(campaign.category)}
                  sx={{
                    borderRadius: '999px',
                    fontWeight: 900,
                    bgcolor: '#0f449e',
                    textTransform: 'none',
                  }}
                >
                  {campaign.cta}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container maxWidth='xl' sx={{ mb: { xs: 7, md: 10 }, flex: 1, px: { xs: 1, sm: 2, md: 3 } }}>
        {loading ? (
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: 1600,
              bgcolor: '#ffffff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center', px: 3 }}>
              <CircularProgress size={48} thickness={4.4} sx={{ color: '#0f449e', mb: 2.5 }} />
              <Typography
                sx={{
                  color: '#0f172a',
                  fontWeight: 900,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  letterSpacing: '0.06em',
                }}
              >
                SPORTMIX
              </Typography>
              <Typography sx={{ color: '#64748b', mt: 1 }}>Загружаем каталог без рывков</Typography>
            </Box>
          </Box>
        ) : error ? (
          <Paper
            elevation={0}
            sx={{
              textAlign: 'center',
              mt: 8,
              p: 5,
              bgcolor: '#fff5f5',
              borderRadius: '24px',
              border: '1px solid rgba(239,68,68,0.12)',
            }}
          >
            <Typography variant='h5' sx={{ color: '#dc2626', fontWeight: 800, mb: 1 }}>
              Не удалось загрузить каталог
            </Typography>
            <Typography sx={{ color: '#64748b' }}>{error.message}</Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '280px minmax(0, 1fr)' },
              alignItems: 'flex-start',
              gap: { xs: 1.4, lg: 4.5 },
            }}
          >
            <Box
              sx={{
                width: '100%',
                flexShrink: 0,
                display: { xs: 'none', lg: 'block' },
                position: { lg: 'sticky' },
                top: { lg: '24px' },
              }}
            >
              <Sidebar
                selectedBrands={selectedBrands}
                onBrandChange={handleBrandChange}
                selectedGenders={selectedGenders}
                onGenderChange={handleGenderChange}
                selectedSizes={selectedSizes}
                onSizeChange={handleSizeChange}
                products={products}
              />
            </Box>

            <Box ref={catalogRef} sx={{ flex: 1, minWidth: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  mb: { xs: 1.6, md: 4 },
                  p: { xs: 1.35, sm: 2, md: 3 },
                  borderRadius: { xs: '20px', md: '28px' },
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
                  border: '1px solid rgba(148,163,184,0.14)',
                  boxShadow: '0 24px 60px rgba(15,23,42,0.06)',
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={{ xs: 1.25, md: 2 }}
                  justifyContent='space-between'
                  alignItems={{ xs: 'stretch', md: 'center' }}
                >
                  <Box>
                    <Typography
                      variant='h4'
                      sx={{
                        fontWeight: 900,
                        color: '#0f172a',
                        mb: 0.75,
                        letterSpacing: 0,
                        fontSize: { xs: '1.25rem', sm: '1.55rem', md: '2.125rem' },
                        lineHeight: 1.12,
                      }}
                    >
                      {getCatalogTitle()}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: { xs: '13px', md: '1rem' },
                        lineHeight: 1.5,
                      }}
                    >
                      {isSearchPending
                        ? 'Обновляем результаты...'
                        : `Показываем ${filteredProducts.length} товаров по твоему запросу и фильтрам.`}
                    </Typography>
                  </Box>

                  <Stack
                    direction='row'
                    spacing={1}
                    flexWrap={{ xs: 'nowrap', md: 'wrap' }}
                    useFlexGap
                    alignItems='center'
                    sx={{
                      width: { xs: '100%', md: 'auto' },
                      overflowX: { xs: 'auto', md: 'visible' },
                      pb: { xs: 0.25, md: 0 },
                      scrollbarWidth: 'none',
                      '&::-webkit-scrollbar': { display: 'none' },
                    }}
                  >
                    <Button
                      variant='contained'
                      startIcon={<TuneRoundedIcon />}
                      onClick={() => setMobileFiltersOpen(true)}
                      sx={{
                        display: { xs: 'inline-flex', lg: 'none' },
                        flexShrink: 0,
                        borderRadius: '999px',
                        bgcolor: '#0f449e',
                        textTransform: 'none',
                        fontWeight: 900,
                        px: 1.8,
                        py: 0.85,
                        boxShadow: '0 12px 24px rgba(15,68,158,0.18)',
                      }}
                    >
                      Фильтры
                    </Button>
                    <TextField
                      select
                      size='small'
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      sx={{
                        minWidth: { xs: 190, sm: 220 },
                        flexShrink: 0,
                        '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: '#fff' },
                      }}
                    >
                      <MenuItem value='featured'>Сначала рекомендуемые</MenuItem>
                      <MenuItem value='newest'>Сначала новинки</MenuItem>
                      <MenuItem value='rating'>По рейтингу</MenuItem>
                      <MenuItem value='price_asc'>Цена: по возрастанию</MenuItem>
                      <MenuItem value='price_desc'>Цена: по убыванию</MenuItem>
                      <MenuItem value='discount'>По размеру скидки</MenuItem>
                    </TextField>
                    <Chip
                      label='Только в наличии'
                      onClick={() => setOnlyInStock((current) => !current)}
                      clickable
                      sx={{
                        flexShrink: 0,
                        backgroundColor: onlyInStock ? '#0f449e' : '#f8fafc',
                        color: onlyInStock ? '#fff' : '#334155',
                        fontWeight: 800,
                        borderRadius: '999px',
                        border: onlyInStock ? 'none' : '1px solid rgba(148,163,184,0.16)',
                      }}
                    />
                    {activeFilterChips.length > 0 ? (
                      activeFilterChips.map((chip) => (
                        <Chip
                          key={chip.key}
                          label={chip.label}
                          sx={{
                            flexShrink: 0,
                            backgroundColor: '#eff6ff',
                            color: '#0f449e',
                            fontWeight: 800,
                            borderRadius: '999px',
                          }}
                        />
                      ))
                    ) : (
                      <Chip
                        label='Без фильтров'
                        sx={{
                          flexShrink: 0,
                          backgroundColor: '#f8fafc',
                          color: '#64748b',
                          fontWeight: 800,
                          borderRadius: '999px',
                        }}
                      />
                    )}
                  </Stack>
                </Stack>
              </Paper>

              {filteredProducts.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    px: 3,
                    borderRadius: '32px',
                    background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                    border: '1px solid rgba(148,163,184,0.14)',
                    boxShadow: '0 24px 60px rgba(15,23,42,0.06)',
                  }}
                >
                  <Box
                    sx={{
                      width: 92,
                      height: 92,
                      mx: 'auto',
                      mb: 2.5,
                      borderRadius: '28px',
                      display: 'grid',
                      placeItems: 'center',
                      background:
                        'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(14,165,233,0.18) 100%)',
                    }}
                  >
                    <SearchOffIcon sx={{ fontSize: 42, color: '#0f449e' }} />
                  </Box>
                  <Typography variant='h4' sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
                    По этому запросу пока пусто
                  </Typography>
                  <Typography sx={{ color: '#64748b', maxWidth: 520, mx: 'auto', mb: 3 }}>
                    Попробуй убрать часть фильтров, ввести название бренда короче или вернуться к
                    общему каталогу.
                  </Typography>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.25}
                    justifyContent='center'
                  >
                    <Button
                      variant='contained'
                      onClick={resetSearchExperience}
                      sx={{
                        borderRadius: '999px',
                        px: 3.5,
                        py: 1.4,
                        fontWeight: 900,
                        bgcolor: '#0f449e',
                      }}
                    >
                      Сбросить поиск
                    </Button>
                    <Button
                      variant='outlined'
                      onClick={() => setCategory('all')}
                      sx={{ borderRadius: '999px', px: 3.5, py: 1.4, fontWeight: 800 }}
                    >
                      Ко всем товарам
                    </Button>
                  </Stack>
                </Paper>
              ) : isSidebarFiltered ? (
                <ProductGrid products={filteredProducts} />
              ) : (
                <>
                  <ProductGrid products={category === 'New' ? newProducts : filteredProducts} />

                  {(category === 'all' ||
                    category === 'Shoes' ||
                    category === 'Clothes' ||
                    category === 'Bags') && (
                    <Box
                      sx={{
                        mt: 8,
                        p: { xs: 2.2, md: 4 },
                        bgcolor: '#fff',
                        borderRadius: '30px',
                        boxShadow: '0 24px 60px rgba(15,23,42,0.07)',
                        border: '1px solid rgba(148,163,184,0.14)',
                      }}
                    >
                      <Suspense
                        fallback={
                          <Box sx={{ minHeight: 220, display: 'grid', placeItems: 'center' }}>
                            <CircularProgress size={34} thickness={4.5} sx={{ color: '#0f449e' }} />
                          </Box>
                        }
                      >
                        <RecommendedSwiper
                          products={recommendedProducts}
                          title='Рекомендуем также'
                        />
                      </Suspense>
                    </Box>
                  )}

                  {category === 'all' && (
                    <Stack spacing={3} sx={{ mt: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 2.5, md: 3.5 },
                          borderRadius: '30px',
                          border: '1px solid rgba(148,163,184,0.14)',
                          bgcolor: '#fff',
                        }}
                      >
                        <Typography
                          sx={{
                            color: '#94a3b8',
                            fontSize: '12px',
                            fontWeight: 900,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            mb: 0.8,
                          }}
                        >
                          Почему покупать удобно
                        </Typography>
                        <Grid container spacing={2}>
                          {[
                            'Каталог теперь можно сортировать по цене, новинкам, рейтингу и скидке.',
                            'Корзина поддерживает изменение количества и ведёт к отдельному checkout.',
                            'Сервисные страницы помогают магазину выглядеть надёжнее для покупателя.',
                          ].map((item) => (
                            <Grid item xs={12} md={4} key={item}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2.2,
                                  height: '100%',
                                  borderRadius: '22px',
                                  bgcolor: '#f8fbff',
                                  border: '1px solid rgba(148,163,184,0.12)',
                                }}
                              >
                                <Typography
                                  sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.6 }}
                                >
                                  {item}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>

                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 2.5, md: 3.5 },
                          borderRadius: '30px',
                          border: '1px solid rgba(148,163,184,0.14)',
                          bgcolor: '#fff',
                        }}
                      >
                        <Typography
                          sx={{
                            color: '#94a3b8',
                            fontSize: '12px',
                            fontWeight: 900,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            mb: 0.8,
                          }}
                        >
                          Популярные бренды
                        </Typography>
                        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                          {['Nike', 'Adidas', 'Puma', 'New Balance', 'Jordan', 'Reebok'].map(
                            (brand) => (
                              <Chip
                                key={brand}
                                label={brand}
                                sx={{
                                  px: 1,
                                  py: 2.3,
                                  borderRadius: '999px',
                                  bgcolor: '#eff6ff',
                                  color: '#0f449e',
                                  fontWeight: 900,
                                }}
                              />
                            ),
                          )}
                        </Stack>
                      </Paper>
                    </Stack>
                  )}
                </>
              )}
            </Box>
          </Box>
        )}
      </Container>

      <Suspense fallback={null}>
        <LazyFooter />
      </Suspense>

      <Dialog
        open={authPromoOpen}
        onClose={closePromo}
        PaperProps={{ sx: { borderRadius: '24px', p: 1, maxWidth: '420px', position: 'relative' } }}
      >
        <IconButton
          onClick={closePromo}
          sx={{ position: 'absolute', right: 12, top: 12, color: '#718096' }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent sx={{ textAlign: 'center', mt: 3, mb: 1 }}>
          <Typography variant='h5' sx={{ fontWeight: 900, color: '#1A202C', mb: 1 }}>
            Привет, {user?.username || 'гость'}!
          </Typography>

          <Typography sx={{ color: '#718096', mb: 4, fontSize: '0.95rem' }}>
            Чтобы сохранять избранное, оформлять покупки и отслеживать заказы, войди в аккаунт.
          </Typography>

          <Button
            variant='contained'
            fullWidth
            onClick={() => {
              closePromo();
              navigate('/login');
            }}
            sx={{
              bgcolor: '#0f449e',
              fontWeight: 800,
              py: 1.5,
              borderRadius: '14px',
              mb: 2,
              '&:hover': { bgcolor: '#0b337a' },
            }}
          >
            Войти в аккаунт
          </Button>

          <Button
            variant='outlined'
            fullWidth
            onClick={() => {
              closePromo();
              navigate('/register');
            }}
            sx={{
              borderColor: '#0f449e',
              color: '#0f449e',
              fontWeight: 800,
              py: 1.5,
              borderRadius: '14px',
              borderWidth: '2px',
              '&:hover': { borderWidth: '2px', borderColor: '#0b337a', color: '#0b337a' },
            }}
          >
            Создать профиль
          </Button>
        </DialogContent>
      </Dialog>

      <Drawer
        anchor='bottom'
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{
          sx: {
            display: { lg: 'none' },
            maxHeight: '88vh',
            borderRadius: '24px 24px 0 0',
            overflow: 'hidden',
            bgcolor: '#eef4fb',
          },
        }}
      >
        <Box sx={{ p: 1.25, pb: 'calc(12px + env(safe-area-inset-bottom))', overflowY: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1,
              pb: 1,
            }}
          >
            <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.1rem' }}>
              Фильтры каталога
            </Typography>
            <IconButton onClick={() => setMobileFiltersOpen(false)} sx={{ color: '#475569' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Sidebar
            selectedBrands={selectedBrands}
            onBrandChange={handleBrandChange}
            selectedGenders={selectedGenders}
            onGenderChange={handleGenderChange}
            selectedSizes={selectedSizes}
            onSizeChange={handleSizeChange}
            products={products}
          />
        </Box>
      </Drawer>
    </Box>
  );
}

export default HomePage;
