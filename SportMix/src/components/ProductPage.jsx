import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Rating,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';

const Footer = lazy(() => import('./Footer'));
import Header from './Header';
import ProductGrid from './ProductGrid';
import { useApp } from '../context/app-context';
import {
  createProductReview,
  deleteProductReview,
  fetchProductReviews,
  reportProductReview,
  toggleProductReviewLike,
  updateProductReview,
} from '../lib/api';
import { useProducts } from '../hooks/useProducts';
import { calculateDiscount, formatCurrency } from '../lib/format';
import { getProductMaterial, getSizeGuide } from '../lib/shop-content';

const REVIEWS_PAGE_SIZE = 4;

const reviewSortOptions = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'popular', label: 'Сначала полезные' },
  { value: 'highest', label: 'С высокой оценкой' },
  { value: 'lowest', label: 'С низкой оценкой' },
  { value: 'oldest', label: 'Сначала старые' },
];

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, token, user, requireAuth, recentlyViewed, markProductViewed } = useApp();
  const { products, loading } = useProducts();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false);
  const [reviewsHasMore, setReviewsHasMore] = useState(false);
  const [reviewSort, setReviewSort] = useState('newest');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reportingReviewId, setReportingReviewId] = useState(null);

  const product = useMemo(
    () => products.find((item) => String(item.id) === String(id)),
    [id, products],
  );

  useEffect(() => {
    if (product) {
      markProductViewed(product);
    }
  }, [markProductViewed, product]);

  const similarProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products
      .filter(
        (item) =>
          item.id !== product.id &&
          (item.category === product.category || item.brand === product.brand),
      )
      .slice(0, 4);
  }, [product, products]);

  const recentlyViewedProducts = useMemo(
    () => recentlyViewed.filter((item) => String(item.id) !== String(id)).slice(0, 4),
    [id, recentlyViewed],
  );

  const recommendedForYou = useMemo(() => {
    if (!product) {
      return [];
    }

    const recentSignals = recentlyViewed.map((item) => `${item.brand}-${item.category}`);

    return products
      .filter((item) => item.id !== product.id)
      .sort((a, b) => {
        const aScore =
          (a.brand === product.brand ? 4 : 0) +
          (a.category === product.category ? 3 : 0) +
          (recentSignals.includes(`${a.brand}-${a.category}`) ? 2 : 0) +
          Number(a.rating || 0);
        const bScore =
          (b.brand === product.brand ? 4 : 0) +
          (b.category === product.category ? 3 : 0) +
          (recentSignals.includes(`${b.brand}-${b.category}`) ? 2 : 0) +
          Number(b.rating || 0);
        return bScore - aScore;
      })
      .slice(0, 4);
  }, [product, products, recentlyViewed]);

  const loadReviews = useCallback(
    async ({ reset = false, offset: nextOffset } = {}) => {
      if (!id) {
        return;
      }

      const offset = reset ? 0 : (nextOffset ?? 0);

      if (reset) {
        setReviewsLoading(true);
      } else {
        setReviewsLoadingMore(true);
      }

      try {
        const data = await fetchProductReviews(id, token, {
          sort: reviewSort,
          limit: REVIEWS_PAGE_SIZE,
          offset,
        });
        const nextItems = Array.isArray(data?.items) ? data.items : [];

        setReviews((currentReviews) => (reset ? nextItems : [...currentReviews, ...nextItems]));
        setReviewsHasMore(Boolean(data?.hasMore));
      } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        if (reset) {
          setReviews([]);
        }
        setReviewsHasMore(false);
      } finally {
        if (reset) {
          setReviewsLoading(false);
        } else {
          setReviewsLoadingMore(false);
        }
      }
    },
    [id, reviewSort, token],
  );

  useEffect(() => {
    setReviews([]);
    setReviewsHasMore(false);
    loadReviews({ reset: true });
  }, [loadReviews]);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
      >
        <CircularProgress size={60} sx={{ color: '#0f449e' }} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant='h5'>Товар не найден</Typography>
        <Button onClick={() => navigate('/')} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Вернуться на главную
        </Button>
      </Container>
    );
  }

  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
  const stock = Number(product.stock || 0);
  const isOutOfStock = stock <= 0;
  const discount = calculateDiscount(product.price, product.oldPrice || product.old_price);
  const productGallery = [
    product.image,
    ...(Array.isArray(product.gallery) ? product.gallery : []),
  ].filter((image, index, array) => image && array.indexOf(image) === index);
  const selectedImage = productGallery[selectedGalleryIndex] || product.image;
  const materialDescription = getProductMaterial(product);
  const sizeGuide = getSizeGuide(product);

  const specItems = [
    { label: 'Бренд', value: product.brand || 'Не указан' },
    { label: 'Категория', value: product.category || 'Не указана' },
    { label: 'Подкатегория', value: product.subcategory || 'Не указана' },
    { label: 'Раздел', value: product.gender || 'Универсальный' },
    {
      label: 'В наличии',
      value: isOutOfStock ? 'Нет в наличии' : stock <= 3 ? `Осталось ${stock} шт.` : `${stock} шт.`,
    },
    { label: 'Размеры', value: hasSizes ? product.sizes.join(', ') : 'Один размер' },
    { label: 'Рейтинг', value: `${product.rating || 0} / 5` },
  ];

  const descriptionBlocks = [
    {
      title: 'О модели',
      text:
        product.description ||
        'Эта модель создана для тех, кто хочет сочетать спортивную практичность, уверенный силуэт и комфорт в повседневном ритме.',
    },
    {
      title: 'Почему стоит взять',
      text: 'Продуманная форма, актуальная посадка и универсальность позволяют носить вещь как в активном режиме, так и в городском сценарии каждый день.',
    },
    {
      title: 'Как носить',
      text: 'Сочетается с базовой спортивной одеждой, свободными брюками, худи и минималистичными аксессуарами без перегруза.',
    },
  ];

  const handleAddToCartClick = () => {
    if (hasSizes && !selectedSize) {
      setErrorMessage('Пожалуйста, выберите размер.');
      return;
    }

    const result = addToCart(product, selectedSize);

    if (result?.requiresAuth) {
      return;
    }

    if (result?.success) {
      setSuccessMessage(`"${product.name}" добавлен в корзину`);
      return;
    }

    setErrorMessage(result?.error || 'Не удалось добавить товар в корзину');
  };

  const handleSubmitReview = async () => {
    if (!user || !token) {
      requireAuth();
      return;
    }

    if (reviewComment.trim().length < 8) {
      setErrorMessage('Отзыв должен быть не короче 8 символов.');
      return;
    }

    setIsSubmittingReview(true);

    try {
      const nextPayload = {
        rating: reviewRating,
        comment: reviewComment.trim(),
      };

      if (editingReviewId) {
        await updateProductReview(token, product.id, editingReviewId, nextPayload);
        setSuccessMessage('Отзыв обновлён.');
      } else {
        await createProductReview(token, product.id, nextPayload);
        setSuccessMessage('Спасибо, отзыв опубликован.');
      }

      setReviewComment('');
      setReviewRating(5);
      setEditingReviewId(null);
      setReviews([]);
      setReviewsHasMore(false);
      await loadReviews({ reset: true });
    } catch (error) {
      setErrorMessage(error.message || 'Не удалось отправить отзыв.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteProductReview(token, product.id, reviewId);
      if (editingReviewId === reviewId) {
        setEditingReviewId(null);
        setReviewComment('');
        setReviewRating(5);
      }
      setReviews([]);
      setReviewsHasMore(false);
      await loadReviews({ reset: true });
      setSuccessMessage('Отзыв удалён.');
    } catch (error) {
      setErrorMessage(error.message || 'Не удалось удалить отзыв.');
    }
  };

  const handleToggleLike = async (reviewId) => {
    if (!user || !token) {
      requireAuth();
      return;
    }

    try {
      const result = await toggleProductReviewLike(token, product.id, reviewId);
      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                likedByMe: result.liked,
                likesCount: result.likesCount,
              }
            : review,
        ),
      );
    } catch (error) {
      setErrorMessage(error.message || 'Не удалось обновить лайк.');
    }
  };

  const handleReportReview = async (reviewId) => {
    if (!user || !token) {
      requireAuth();
      return;
    }

    setReportingReviewId(reviewId);

    try {
      await reportProductReview(token, product.id, reviewId, { reason: 'inappropriate' });
      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                reportedByMe: true,
              }
            : review,
        ),
      );
      setSuccessMessage('Жалоба отправлена на модерацию.');
    } catch (error) {
      setErrorMessage(error.message || 'Не удалось отправить жалобу.');
    } finally {
      setReportingReviewId(null);
    }
  };

  const handleLoadMoreReviews = async () => {
    await loadReviews({ offset: reviews.length });
  };

  return (
    <Box sx={{ bgcolor: '#eef4fb', minHeight: '100vh' }}>
      <Header />

      <Container
        maxWidth='xl'
        sx={{ mt: { xs: 1.5, md: 3 }, mb: { xs: 4, md: 8 }, px: { xs: 1.5, sm: 2 } }}
      >
        <Button
          onClick={() => navigate('/')}
          startIcon={<ArrowBackIcon />}
          sx={{ color: '#1a1a1a', fontWeight: 800, mb: 3, textTransform: 'none' }}
        >
          Назад к покупкам
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2.5, md: 4 },
            borderRadius: { xs: '20px', md: '32px' },
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
            border: '1px solid rgba(148,163,184,0.14)',
            boxShadow: '0 24px 60px rgba(15,23,42,0.08)',
          }}
        >
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 5 }}>
            <Grid item xs={12} md={6.3}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: { xs: '22px', md: '28px' },
                    overflow: 'hidden',
                    minHeight: { xs: 220, sm: 340, md: 480 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 1.5, md: 4 },
                    background: 'linear-gradient(180deg, #f8fafc 0%, #eef4fb 100%)',
                  }}
                >
                  {discount && (
                    <Chip
                      label={discount}
                      sx={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        zIndex: 2,
                        bgcolor: '#dc2626',
                        color: '#fff',
                        fontWeight: 900,
                        borderRadius: '999px',
                        boxShadow: '0 14px 28px rgba(220,38,38,0.24)',
                      }}
                    />
                  )}
                  <img
                    src={selectedImage}
                    alt={product.name}
                    loading='lazy'
                    decoding='async'
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 22px 28px rgba(15,23,42,0.10))',
                    }}
                  />
                </Box>

                <Stack direction='row' spacing={1.25} flexWrap='wrap' useFlexGap>
                  {productGallery.map((image, index) => (
                    <Box
                      key={`${image}-${index}`}
                      onClick={() => setSelectedGalleryIndex(index)}
                      sx={{
                        width: { xs: 60, sm: 80 },
                        height: { xs: 60, sm: 80 },
                        borderRadius: '14px',
                        border:
                          index === selectedGalleryIndex
                            ? '2px solid #0f449e'
                            : '1px solid rgba(148,163,184,0.14)',
                        bgcolor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1.2,
                        cursor: 'pointer',
                        boxShadow:
                          index === selectedGalleryIndex
                            ? '0 16px 28px rgba(15,68,158,0.16)'
                            : 'none',
                      }}
                    >
                      <img
                        src={image}
                        alt={`${product.name}-${index + 1}`}
                        loading='lazy'
                        decoding='async'
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5.7}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap sx={{ mb: 1.6 }}>
                  <Chip
                    label={product.brand || 'Brand'}
                    sx={{
                      bgcolor: '#eff6ff',
                      color: '#0f449e',
                      fontWeight: 900,
                      borderRadius: '999px',
                    }}
                  />
                  <Chip
                    label={product.category || 'Sport'}
                    sx={{
                      bgcolor: '#f8fafc',
                      color: '#334155',
                      fontWeight: 800,
                      borderRadius: '999px',
                    }}
                  />
                  {product.subcategory ? (
                    <Chip
                      label={product.subcategory}
                      sx={{
                        bgcolor: '#eff6ff',
                        color: '#0f449e',
                        fontWeight: 800,
                        borderRadius: '999px',
                      }}
                    />
                  ) : null}
                </Stack>

                <Typography
                  variant='h3'
                  sx={{
                    fontWeight: 900,
                    color: '#0f172a',
                    mb: 0.8,
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '3rem' },
                    letterSpacing: '-0.05em',
                    lineHeight: 1.1,
                  }}
                >
                  {product.name}
                </Typography>

                <Stack
                  direction='row'
                  spacing={1}
                  alignItems='center'
                  flexWrap='wrap'
                  useFlexGap
                  sx={{ mb: 2.2 }}
                >
                  <Rating
                    value={parseFloat(product.rating) || 0}
                    precision={0.1}
                    readOnly
                    sx={{ color: '#f59e0b' }}
                  />
                  <Typography sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {product.rating || 0}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontWeight: 700 }}>
                    · {product.reviews || 0} отзывов
                  </Typography>
                </Stack>

                <Stack
                  direction='row'
                  spacing={1.2}
                  alignItems='baseline'
                  flexWrap='wrap'
                  useFlexGap
                  sx={{ mb: 2.5 }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: '#0f172a',
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
                      letterSpacing: '-0.05em',
                    }}
                  >
                    {formatCurrency(product.price)}
                  </Typography>
                  {discount && (
                    <Typography
                      sx={{
                        textDecoration: 'line-through',
                        color: '#94a3b8',
                        fontWeight: 800,
                        fontSize: '1rem',
                      }}
                    >
                      {formatCurrency(product.oldPrice || product.old_price)}
                    </Typography>
                  )}
                </Stack>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.2,
                    borderRadius: '22px',
                    background:
                      'linear-gradient(135deg, rgba(15,68,158,0.06) 0%, rgba(14,165,233,0.08) 100%)',
                    border: '1px solid rgba(59,130,246,0.12)',
                    mb: 2.8,
                  }}
                >
                  <Stack direction='row' spacing={1.25} alignItems='flex-start'>
                    <VerifiedIcon sx={{ color: '#0f449e', mt: 0.2 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 900, color: '#0f172a', mb: 0.4 }}>
                        Проверенный товар
                      </Typography>
                      <Typography sx={{ color: '#475569', lineHeight: 1.7, fontSize: '14px' }}>
                        Актуальный ассортимент, быстрая доставка и уверенный повседневный комфорт.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                {hasSizes && (
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontWeight: 900, mb: 1.2, color: '#0f172a' }}>
                      Выберите размер
                    </Typography>
                    <Stack direction='row' spacing={1.2} flexWrap='wrap' useFlexGap>
                      {product.sizes.map((size) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? 'contained' : 'outlined'}
                          onClick={() => setSelectedSize(size)}
                          sx={{
                            minWidth: { xs: '56px', md: '64px' },
                            height: '48px',
                            borderRadius: '16px',
                            borderColor:
                              selectedSize === size ? '#0f449e' : 'rgba(148,163,184,0.24)',
                            bgcolor: selectedSize === size ? '#0f449e' : '#fff',
                            color: selectedSize === size ? '#fff' : '#0f172a',
                            fontWeight: 900,
                            '&:hover': {
                              borderColor: '#0f449e',
                              bgcolor: selectedSize === size ? '#0b3376' : '#f8fafc',
                            },
                          }}
                        >
                          {size}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                )}

                <Button
                  variant='contained'
                  size='large'
                  startIcon={<LocalMallIcon />}
                  disabled={isOutOfStock}
                  onClick={handleAddToCartClick}
                  sx={{
                    bgcolor: isOutOfStock ? '#cbd5e1' : '#0f449e',
                    color: '#fff',
                    py: { xs: 1.2, md: 1.7 },
                    px: { xs: 1.5, md: 2 },
                    borderRadius: '16px',
                    fontWeight: 900,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    textTransform: 'none',
                    boxShadow: isOutOfStock ? 'none' : '0 18px 32px rgba(15,68,158,0.22)',
                    '&:hover': { bgcolor: isOutOfStock ? '#cbd5e1' : '#0b3376' },
                    width: { xs: '100%', md: '320px' },
                    mb: 2,
                  }}
                >
                  {isOutOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
                </Button>

                <Grid container spacing={1.5}>
                  {specItems.map((item) => (
                    <Grid item xs={12} sm={6} key={item.label}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.8,
                          borderRadius: '20px',
                          bgcolor: '#fff',
                          border: '1px solid rgba(148,163,184,0.12)',
                        }}
                      >
                        <Typography
                          sx={{
                            color: '#94a3b8',
                            fontSize: '12px',
                            fontWeight: 900,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            mb: 0.5,
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography sx={{ color: '#0f172a', fontWeight: 800 }}>
                          {item.value}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Paper
                  elevation={0}
                  sx={{
                    mt: 2.5,
                    p: 2.2,
                    borderRadius: '22px',
                    bgcolor: '#fff',
                    border: '1px solid rgba(148,163,184,0.12)',
                  }}
                >
                  <Typography sx={{ fontWeight: 900, color: '#0f172a', mb: 0.8 }}>
                    Размеры, доставка и возврат
                  </Typography>
                  <Typography sx={{ color: '#475569', lineHeight: 1.8, mb: 0.8 }}>
                    Материал: {materialDescription}
                  </Typography>
                  <Typography sx={{ color: '#475569', lineHeight: 1.8, mb: 0.8 }}>
                    Доставка: курьер 1-2 дня, самовывоз или экспресс в день заказа.
                  </Typography>
                  <Typography sx={{ color: '#475569', lineHeight: 1.8 }}>
                    Если размер не подошёл, обмен или возврат можно согласовать через поддержку и
                    раздел сервиса магазина.
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: '28px',
                border: '1px solid rgba(148,163,184,0.14)',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                boxShadow: '0 24px 60px rgba(15,23,42,0.06)',
              }}
            >
              <Typography
                variant='h5'
                sx={{ fontWeight: 900, color: '#0f172a', mb: 2.5, letterSpacing: '-0.03em' }}
              >
                Описание и детали
              </Typography>
              <Stack spacing={2.2}>
                {descriptionBlocks.map((block) => (
                  <Box key={block.title}>
                    <Typography sx={{ fontWeight: 900, color: '#0f172a', mb: 0.7 }}>
                      {block.title}
                    </Typography>
                    <Typography sx={{ color: '#475569', lineHeight: 1.85 }}>
                      {block.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>

            {sizeGuide && (
              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: '28px',
                  border: '1px solid rgba(148,163,184,0.14)',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                  boxShadow: '0 24px 60px rgba(15,23,42,0.06)',
                }}
              >
                <Typography
                  variant='h5'
                  sx={{ fontWeight: 900, color: '#0f172a', mb: 0.8, letterSpacing: '-0.03em' }}
                >
                  {sizeGuide.title}
                </Typography>
                <Typography sx={{ color: '#64748b', mb: 2.2, lineHeight: 1.75 }}>
                  Таблица размеров помогает быстрее выбрать вещь и уменьшает шанс возврата из-за
                  промаха с посадкой.
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 360 }}>
                    <TableHead>
                      <TableRow>
                        {sizeGuide.columns.map((column) => (
                          <TableCell
                            key={column}
                            sx={{
                              fontWeight: 900,
                              color: '#0f172a',
                              borderBottomColor: 'rgba(148,163,184,0.18)',
                            }}
                          >
                            {column}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sizeGuide.rows.map((row) => (
                        <TableRow key={row.join('-')}>
                          {row.map((value) => (
                            <TableCell
                              key={value}
                              sx={{ color: '#475569', borderBottomColor: 'rgba(148,163,184,0.12)' }}
                            >
                              {value}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
                <Typography sx={{ color: '#64748b', mt: 2, lineHeight: 1.75 }}>
                  {sizeGuide.note}
                </Typography>
              </Paper>
            )}
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: '28px',
                  border: '1px solid rgba(148,163,184,0.14)',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                  boxShadow: '0 24px 60px rgba(15,23,42,0.06)',
                }}
              >
                <Typography
                  variant='h5'
                  sx={{ fontWeight: 900, color: '#0f172a', mb: 2.2, letterSpacing: '-0.03em' }}
                >
                  Оставить отзыв
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography sx={{ color: '#64748b', fontSize: '14px', mb: 0.6 }}>
                      Ваша оценка
                    </Typography>
                    <Rating
                      value={reviewRating}
                      precision={1}
                      onChange={(_, value) => setReviewRating(value || 5)}
                      sx={{ color: '#f59e0b' }}
                    />
                  </Box>
                  <TextField
                    multiline
                    minRows={4}
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder='Поделитесь впечатлением о товаре'
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '18px', bgcolor: '#fff' } }}
                  />
                  <Stack direction='row' spacing={1.2} flexWrap='wrap' useFlexGap>
                    <Button
                      variant='contained'
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview}
                      sx={{
                        bgcolor: '#0f449e',
                        textTransform: 'none',
                        borderRadius: '999px',
                        fontWeight: 900,
                        alignSelf: 'flex-start',
                      }}
                    >
                      {isSubmittingReview
                        ? 'Отправляем...'
                        : editingReviewId
                          ? 'Сохранить изменения'
                          : 'Опубликовать отзыв'}
                    </Button>
                    {editingReviewId && (
                      <Button
                        variant='outlined'
                        onClick={() => {
                          setEditingReviewId(null);
                          setReviewComment('');
                          setReviewRating(5);
                        }}
                        sx={{ textTransform: 'none', borderRadius: '999px', fontWeight: 900 }}
                      >
                        Отмена
                      </Button>
                    )}
                  </Stack>
                  <Typography sx={{ color: '#64748b', fontSize: '13px' }}>
                    Отзыв может оставить только пользователь, который уже покупал этот товар.
                  </Typography>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: '28px',
                  border: '1px solid rgba(148,163,184,0.14)',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                  boxShadow: '0 24px 60px rgba(15,23,42,0.06)',
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent='space-between'
                  spacing={1.5}
                  sx={{ mb: 2.5 }}
                >
                  <Box>
                    <Typography
                      variant='h5'
                      sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}
                    >
                      Отзывы
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '14px', mt: 0.4 }}>
                      Сортируй отзывы по свежести, пользе или оценке.
                    </Typography>
                  </Box>
                  <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                    {reviewSortOptions.map((option) => (
                      <Chip
                        key={option.value}
                        label={option.label}
                        onClick={() => setReviewSort(option.value)}
                        clickable
                        sx={{
                          borderRadius: '999px',
                          fontWeight: 800,
                          bgcolor: reviewSort === option.value ? '#0f449e' : '#fff',
                          color: reviewSort === option.value ? '#fff' : '#334155',
                          border:
                            reviewSort === option.value
                              ? 'none'
                              : '1px solid rgba(148,163,184,0.18)',
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>

                {reviewsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={28} sx={{ color: '#0f449e' }} />
                  </Box>
                ) : reviews.length === 0 ? (
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: '#0f172a', mb: 0.6 }}>
                      Пока нет отзывов
                    </Typography>
                    <Typography sx={{ color: '#64748b', lineHeight: 1.7 }}>
                      Будьте первым, кто поделится впечатлением об этом товаре.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {reviews.map((review, index) => (
                      <Box key={review.id}>
                        {index > 0 && <Divider sx={{ mb: 2 }} />}
                        <Stack direction='row' spacing={1.4} alignItems='flex-start'>
                          <Avatar sx={{ bgcolor: '#0f449e', fontWeight: 900 }}>
                            {String(review.author || 'U')
                              .charAt(0)
                              .toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              justifyContent='space-between'
                              spacing={1}
                              flexWrap='wrap'
                              useFlexGap
                            >
                              <Stack
                                direction='row'
                                spacing={1}
                                alignItems='center'
                                flexWrap='wrap'
                                useFlexGap
                              >
                                <Typography sx={{ fontWeight: 900, color: '#0f172a' }}>
                                  {review.author}
                                </Typography>
                                {review.isVerifiedPurchase && (
                                  <Chip
                                    icon={<VerifiedIcon />}
                                    label='Проверенная покупка'
                                    size='small'
                                    sx={{
                                      borderRadius: '999px',
                                      bgcolor: 'rgba(15,68,158,0.08)',
                                      color: '#0f449e',
                                      fontWeight: 900,
                                      '& .MuiChip-icon': { color: '#0f449e' },
                                    }}
                                  />
                                )}
                              </Stack>
                              <Stack
                                direction='row'
                                spacing={0.5}
                                alignItems='center'
                                flexWrap='wrap'
                                useFlexGap
                              >
                                <Typography
                                  sx={{ color: '#94a3b8', fontSize: '12px', fontWeight: 800 }}
                                >
                                  {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                                </Typography>
                                {review.isOwn && (
                                  <>
                                    <IconButton
                                      size='small'
                                      onClick={() => handleEditReview(review)}
                                      sx={{ color: '#0f449e' }}
                                    >
                                      <EditOutlinedIcon fontSize='inherit' />
                                    </IconButton>
                                    <IconButton
                                      size='small'
                                      onClick={() => handleDeleteReview(review.id)}
                                      sx={{ color: '#dc2626' }}
                                    >
                                      <DeleteOutlineIcon fontSize='inherit' />
                                    </IconButton>
                                  </>
                                )}
                              </Stack>
                            </Stack>
                            <Rating
                              value={review.rating}
                              precision={0.5}
                              readOnly
                              size='small'
                              sx={{ color: '#f59e0b', my: 0.8 }}
                            />
                            <Typography
                              sx={{ color: '#475569', lineHeight: 1.8, fontSize: '14px' }}
                            >
                              {review.comment}
                            </Typography>
                            <Stack
                              direction='row'
                              spacing={1.2}
                              flexWrap='wrap'
                              useFlexGap
                              sx={{ mt: 1.1 }}
                            >
                              <Button
                                onClick={() => handleToggleLike(review.id)}
                                startIcon={
                                  review.likedByMe ? <FavoriteIcon /> : <FavoriteBorderIcon />
                                }
                                sx={{
                                  color: review.likedByMe ? '#dc2626' : '#64748b',
                                  textTransform: 'none',
                                  fontWeight: 800,
                                  alignSelf: 'flex-start',
                                  px: 0,
                                }}
                              >
                                {review.likesCount || 0} лайков
                              </Button>
                              {!review.isOwn && (
                                <Button
                                  onClick={() => handleReportReview(review.id)}
                                  disabled={reportingReviewId === review.id || review.reportedByMe}
                                  startIcon={<FlagOutlinedIcon />}
                                  sx={{
                                    color: review.reportedByMe ? '#0f449e' : '#64748b',
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    alignSelf: 'flex-start',
                                    px: 0,
                                  }}
                                >
                                  {review.reportedByMe ? 'Жалоба отправлена' : 'Пожаловаться'}
                                </Button>
                              )}
                            </Stack>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                    {reviewsHasMore && (
                      <Button
                        variant='outlined'
                        onClick={handleLoadMoreReviews}
                        disabled={reviewsLoadingMore}
                        sx={{
                          alignSelf: 'flex-start',
                          mt: 0.5,
                          textTransform: 'none',
                          borderRadius: '999px',
                          fontWeight: 900,
                        }}
                      >
                        {reviewsLoadingMore ? 'Загружаем...' : 'Показать ещё'}
                      </Button>
                    )}
                  </Stack>
                )}
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {recommendedForYou.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: '28px',
                border: '1px solid rgba(148,163,184,0.14)',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                boxShadow: '0 24px 60px rgba(15,23,42,0.06)',
              }}
            >
              <Typography
                variant='h4'
                sx={{ fontWeight: 900, color: '#0f172a', mb: 3, letterSpacing: '-0.04em' }}
              >
                Рекомендуем посмотреть
              </Typography>
              <ProductGrid products={recommendedForYou} />
            </Paper>
          </Box>
        )}

        {recentlyViewedProducts.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: '28px',
                border: '1px solid rgba(148,163,184,0.14)',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                boxShadow: '0 24px 60px rgba(15,23,42,0.06)',
              }}
            >
              <Typography
                variant='h4'
                sx={{ fontWeight: 900, color: '#0f172a', mb: 3, letterSpacing: '-0.04em' }}
              >
                Недавно просмотренные
              </Typography>
              <ProductGrid products={recentlyViewedProducts} />
            </Paper>
          </Box>
        )}

        {similarProducts.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: '28px',
                border: '1px solid rgba(148,163,184,0.14)',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                boxShadow: '0 24px 60px rgba(15,23,42,0.06)',
              }}
            >
              <Typography
                variant='h4'
                sx={{ fontWeight: 900, color: '#0f172a', mb: 3, letterSpacing: '-0.04em' }}
              >
                Похожие товары
              </Typography>
              <ProductGrid products={similarProducts} />
            </Paper>
          </Box>
        )}
      </Container>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={2200}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity='success' sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={2200}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMessage('')} severity='warning' sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </Box>
  );
}

export default ProductPage;
