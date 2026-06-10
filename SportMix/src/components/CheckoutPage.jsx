import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useNavigate } from 'react-router-dom';

const LazyFooter = lazy(() => import('./Footer'));
import Header from './Header';
import { useApp } from '../context/app-context';

const initialCardDraft = {
  number: '4242 4242 4242 4242',
  holder: 'SPORTMIX CUSTOMER',
  expiry: '12/30',
  cvc: '123',
};

const checkoutPaymentOptions = [
  {
    value: 'card',
    label: 'Карта онлайн',
    caption: 'SportPay',
    description: 'Быстрый платеж картой без реального списания.',
  },
  {
    value: 'cash',
    label: 'При получении',
    caption: 'Резерв',
    description: 'Заказ бронируется, оплата после передачи товара.',
  },
  {
    value: 'sbp',
    label: 'СБП / QR',
    caption: 'QR-счет',
    description: 'Оплата через банковское приложение по QR-коду.',
  },
];

const paymentSteps = {
  card: ['Проверка карты', '3-D Secure', 'Авторизация'],
  sbp: ['Создание счета', 'Подтверждение QR', 'Статус банка'],
  cash: ['Резерв заказа', 'Подготовка чека', 'Оплата при получении'],
};

const paymentStatusMeta = {
  paid: { label: 'Оплачено', color: '#15803d', bg: 'rgba(21,128,61,0.10)' },
  pending: { label: 'Ожидает оплаты', color: '#b45309', bg: 'rgba(245,158,11,0.12)' },
};

const paymentAccent = {
  card: '#0f449e',
  cash: '#0f172a',
  sbp: '#7c3aed',
};

const fieldSx = {
  '& .MuiInputLabel-root': {
    fontWeight: 700,
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    bgcolor: '#fff',
  },
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('ru-RU')} ₽`;
}

function formatCardNumber(value) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value) {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function passesLuhn(value) {
  const digits = onlyDigits(value);
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return digits.length >= 12 && sum % 10 === 0;
}

function getCardBrand(number) {
  const digits = onlyDigits(number);

  if (digits.startsWith('4')) {
    return 'Visa';
  }

  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) {
    return 'Mastercard';
  }

  if (digits.startsWith('2')) {
    return 'МИР';
  }

  return 'Bank card';
}

function validatePayment(paymentMethod, cardDraft) {
  if (paymentMethod !== 'card') {
    return '';
  }

  const cardNumber = onlyDigits(cardDraft.number);
  const cvc = onlyDigits(cardDraft.cvc);
  const [monthRaw, yearRaw] = String(cardDraft.expiry || '').split('/');
  const month = Number(monthRaw);
  const year = Number(`20${yearRaw || ''}`);
  const expiryDate = new Date(year, month, 0);
  const now = new Date();

  if (cardNumber.length !== 16 || !passesLuhn(cardNumber)) {
    return 'Проверьте номер карты. Для демо можно оставить 4242 4242 4242 4242.';
  }

  if (String(cardDraft.holder || '').trim().length < 3) {
    return 'Укажите имя владельца карты.';
  }

  if (
    !month ||
    month < 1 ||
    month > 12 ||
    !yearRaw ||
    expiryDate < new Date(now.getFullYear(), now.getMonth(), 1)
  ) {
    return 'Укажите срок действия карты в формате MM/YY.';
  }

  if (cvc.length < 3) {
    return 'Укажите CVC из 3 цифр.';
  }

  if (cardNumber.endsWith('0002')) {
    return 'Банк отклонил платеж. Используйте тестовую успешную карту 4242 4242 4242 4242.';
  }

  return '';
}

function createPaymentReference(method) {
  return `SM-${method.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function createQrCells(seed) {
  const size = 17;
  const text = String(seed || 'sportmix');
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  const isFinder = (x, y, startX, startY) => {
    const localX = x - startX;
    const localY = y - startY;

    if (localX < 0 || localY < 0 || localX > 4 || localY > 4) {
      return null;
    }

    return (
      localX === 0 || localY === 0 || localX === 4 || localY === 4 || (localX === 2 && localY === 2)
    );
  };

  return Array.from({ length: size * size }, (_, index) => {
    const x = index % size;
    const y = Math.floor(index / size);
    const finder = isFinder(x, y, 1, 1) ?? isFinder(x, y, 11, 1) ?? isFinder(x, y, 1, 11);

    if (finder !== null) {
      return finder;
    }

    return (x * 13 + y * 17 + hash + ((hash >> ((x + y) % 8)) & 1)) % 5 < 2;
  });
}

function formatTimer(seconds) {
  const safeSeconds = Math.max(Number(seconds || 0), 0);
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

function getPaymentIcon(method, color = '#0f449e') {
  const iconSx = { color, fontSize: 23 };

  if (method === 'cash') {
    return <AccountBalanceWalletOutlinedIcon sx={iconSx} />;
  }

  if (method === 'sbp') {
    return <QrCode2OutlinedIcon sx={iconSx} />;
  }

  return <CreditCardOutlinedIcon sx={iconSx} />;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartSubtotal,
    isPlacingOrder,
    placeOrder,
    removeFromCart,
    updateCartQuantity,
    showToast,
    user,
  } = useApp();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState('');
  const [cardDraft, setCardDraft] = useState(initialCardDraft);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentStepIndex, setPaymentStepIndex] = useState(-1);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [sbpExpiresIn, setSbpExpiresIn] = useState(600);

  const total = Math.max(cartSubtotal, 0);
  const activePaymentSteps = paymentSteps[paymentMethod] || paymentSteps.card;
  const activePaymentOption =
    checkoutPaymentOptions.find((option) => option.value === paymentMethod) ||
    checkoutPaymentOptions[0];
  const activeAccent = paymentAccent[paymentMethod] || paymentAccent.card;
  const cardBrand = getCardBrand(cardDraft.number);
  const cardNumberPreview = formatCardNumber(cardDraft.number).padEnd(19, '*');
  const paymentProgress = paymentReceipt
    ? 100
    : paymentStepIndex >= 0
      ? ((paymentStepIndex + 1) / activePaymentSteps.length) * 100
      : 0;
  const qrCells = useMemo(
    () => createQrCells(`${user?.email || 'guest'}-${total}-${cart.length}`),
    [cart.length, total, user?.email],
  );
  const currentPaymentStatus = paymentReceipt
    ? paymentStatusMeta[paymentReceipt.status] || paymentStatusMeta.pending
    : null;

  useEffect(() => {
    setPaymentReceipt(null);
    setPaymentStepIndex(-1);
    setSbpExpiresIn(600);
    setError('');
  }, [paymentMethod, total]);

  useEffect(() => {
    if (paymentMethod !== 'sbp') {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSbpExpiresIn((currentSeconds) => Math.max(currentSeconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [paymentMethod]);

  const handleCardDraftChange = (field) => (event) => {
    const value = event.target.value;

    setPaymentReceipt(null);
    setPaymentStepIndex(-1);
    setCardDraft((currentDraft) => ({
      ...currentDraft,
      [field]:
        field === 'number'
          ? formatCardNumber(value)
          : field === 'expiry'
            ? formatExpiry(value)
            : field === 'cvc'
              ? onlyDigits(value).slice(0, 3)
              : value.toUpperCase(),
    }));
  };

  const runPaymentSimulation = async () => {
    const validationError = validatePayment(paymentMethod, cardDraft);

    if (validationError) {
      setError(validationError);
      return null;
    }

    setIsPaymentProcessing(true);
    setPaymentReceipt(null);
    setPaymentStepIndex(0);

    try {
      for (let index = 0; index < activePaymentSteps.length; index += 1) {
        setPaymentStepIndex(index);
        await wait(paymentMethod === 'cash' ? 420 : 720);
      }

      const receipt = {
        method: paymentMethod,
        status: paymentMethod === 'cash' ? 'pending' : 'paid',
        reference: createPaymentReference(paymentMethod),
        provider:
          paymentMethod === 'card'
            ? `SportPay Demo / ${cardBrand}`
            : paymentMethod === 'sbp'
              ? 'СБП Demo Gateway'
              : 'Оплата при получении',
        cardLast4: paymentMethod === 'card' ? onlyDigits(cardDraft.number).slice(-4) : '',
        authorizedAt: new Date().toISOString(),
      };

      setPaymentReceipt(receipt);
      setPaymentStepIndex(activePaymentSteps.length - 1);
      return receipt;
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleSubmitOrder = async () => {
    setError('');

    if (cart.length === 0) {
      setError('Корзина пуста. Добавьте товары перед оформлением.');
      return;
    }

    const simulatedPayment = await runPaymentSimulation();

    if (!simulatedPayment) {
      return;
    }

    const result = await placeOrder({
      shippingAddress: user?.address || '',
      paymentMethod,
      deliveryMethod: 'pickup',
      deliveryFee: 0,
      customerNote: '',
      promoCode: '',
      discountAmount: 0,
      paymentStatus: simulatedPayment.status,
      paymentReference: simulatedPayment.reference,
      paymentProvider: simulatedPayment.provider,
      paymentCardLast4: simulatedPayment.cardLast4,
    });

    if (!result.success) {
      setError(result.error || 'Не удалось оформить заказ.');
      return;
    }

    showToast?.(`Заказ ${result.order.orderNumber} успешно оформлен`, 'success');
    navigate('/orders');
  };

  const submitButtonLabel = isPaymentProcessing
    ? 'Проверяем оплату...'
    : isPlacingOrder
      ? 'Создаем заказ...'
      : paymentMethod === 'cash'
        ? 'Зарезервировать заказ'
        : 'Оплатить и оформить';

  return (
    <Box
      sx={{
        bgcolor: '#eef4fb',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #f7f9fd 0%, #eef4fb 100%)',
      }}
    >
      <Header />

      <Container
        maxWidth='xl'
        sx={{ py: { xs: 1.6, md: 4 }, px: { xs: 1, sm: 2, md: 3 }, flex: 1 }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{
            color: '#0f449e',
            textTransform: 'none',
            fontWeight: 900,
            mb: { xs: 1.5, md: 2.5 },
            px: { xs: 0.5, sm: 1 },
          }}
        >
          Вернуться в каталог
        </Button>

        <Stack spacing={{ xs: 2, md: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
              alignItems: { xs: 'start', md: 'center' },
              gap: 1.5,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 900,
                  color: '#0f172a',
                  fontSize: { xs: '1.65rem', sm: '2rem', md: '2.35rem' },
                  letterSpacing: 0,
                  lineHeight: 1.1,
                }}
              >
                Оформление заказа
              </Typography>
              <Typography sx={{ color: '#64748b', mt: 0.8, maxWidth: 680, lineHeight: 1.7 }}>
                Проверьте корзину, выберите оплату и подтвердите заказ без лишних шагов.
              </Typography>
            </Box>

            <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              <Chip
                icon={<LockOutlinedIcon sx={{ fontSize: '17px !important' }} />}
                label='Demo checkout'
                sx={{
                  bgcolor: '#eff6ff',
                  color: '#0f449e',
                  fontWeight: 900,
                  borderRadius: '999px',
                }}
              />
              <Chip
                icon={<LocalShippingOutlinedIcon sx={{ fontSize: '17px !important' }} />}
                label='Самовывоз 0 ₽'
                sx={{
                  bgcolor: '#f8fafc',
                  color: '#334155',
                  fontWeight: 900,
                  borderRadius: '999px',
                }}
              />
            </Stack>
          </Box>

          {error ? (
            <Alert severity='error' sx={{ borderRadius: '16px', fontWeight: 700 }}>
              {error}
            </Alert>
          ) : null}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 390px' },
              gap: { xs: 2, lg: 3 },
              alignItems: 'start',
            }}
          >
            <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ minWidth: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.6, sm: 2.2, md: 3 },
                  borderRadius: { xs: '20px', md: '28px' },
                  border: '1px solid rgba(148,163,184,0.16)',
                  bgcolor: '#fff',
                  boxShadow: '0 24px 60px rgba(15,23,42,0.06)',
                  overflow: 'hidden',
                }}
              >
                <Stack
                  direction='row'
                  spacing={1.1}
                  alignItems='center'
                  sx={{ mb: { xs: 1.5, md: 2 } }}
                >
                  <PaymentOutlinedIcon sx={{ color: '#0f449e' }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: '#0f172a',
                        fontSize: { xs: '1.12rem', md: '1.28rem' },
                      }}
                    >
                      Способ оплаты
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '13px', mt: 0.2 }}>
                      {activePaymentOption.description}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ overflowX: 'visible', pb: { xs: 0.5, md: 0 } }}>
                  <Box
                    sx={{
                      minWidth: 0,
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                      gap: { xs: 0.9, sm: 1.2 },
                    }}
                  >
                    {checkoutPaymentOptions.map((option) => {
                      const isActive = paymentMethod === option.value;
                      const color = paymentAccent[option.value] || paymentAccent.card;

                      return (
                        <Box
                          component='button'
                          type='button'
                          key={option.value}
                          onClick={() => setPaymentMethod(option.value)}
                          sx={{
                            appearance: 'none',
                            textAlign: 'left',
                            p: { xs: 1.15, sm: 1.4, md: 1.65 },
                            minHeight: { xs: 94, md: 132 },
                            cursor: 'pointer',
                            borderRadius: '18px',
                            border: isActive
                              ? `2px solid ${color}`
                              : '1px solid rgba(148,163,184,0.18)',
                            bgcolor: isActive ? 'rgba(248,250,252,0.98)' : '#fff',
                            boxShadow: isActive
                              ? `0 14px 30px ${color}22`
                              : '0 8px 18px rgba(15,23,42,0.035)',
                            transition:
                              'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              borderColor: `${color}66`,
                              boxShadow: `0 16px 30px ${color}1f`,
                            },
                          }}
                        >
                          <Stack spacing={{ xs: 0.8, md: 1.1 }} sx={{ height: '100%' }}>
                            <Stack
                              direction='row'
                              justifyContent='space-between'
                              alignItems='center'
                              spacing={1}
                            >
                              <Box
                                sx={{
                                  width: { xs: 36, md: 42 },
                                  height: { xs: 36, md: 42 },
                                  borderRadius: { xs: '12px', md: '14px' },
                                  display: 'grid',
                                  placeItems: 'center',
                                  bgcolor: isActive ? `${color}14` : '#f8fafc',
                                  flexShrink: 0,
                                }}
                              >
                                {getPaymentIcon(option.value, color)}
                              </Box>
                              <Chip
                                size='small'
                                label={option.caption}
                                sx={{
                                  bgcolor: isActive ? `${color}14` : '#f8fafc',
                                  color,
                                  fontWeight: 900,
                                  borderRadius: '999px',
                                }}
                              />
                            </Stack>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontWeight: 900,
                                  color: '#0f172a',
                                  mb: 0.4,
                                  fontSize: { xs: '0.95rem', md: '1rem' },
                                }}
                              >
                                {option.label}
                              </Typography>
                              <Typography
                                sx={{
                                  color: '#64748b',
                                  fontSize: { xs: '12px', md: '13px' },
                                  lineHeight: 1.55,
                                  display: '-webkit-box',
                                  WebkitLineClamp: { xs: 2, md: 3 },
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {option.description}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                <Box sx={{ mt: { xs: 2, md: 2.6 } }}>
                  {paymentMethod === 'card' ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          md: 'minmax(250px, 320px) minmax(0, 1fr)',
                        },
                        gap: { xs: 1.8, md: 2.4 },
                        alignItems: 'stretch',
                      }}
                    >
                      <Box
                        sx={{
                          minHeight: { xs: 170, sm: 220 },
                          p: { xs: 1.6, sm: 2.4 },
                          borderRadius: '24px',
                          color: '#fff',
                          background:
                            'linear-gradient(135deg, #0f172a 0%, #0f449e 58%, #7c3aed 100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          overflow: 'hidden',
                          position: 'relative',
                          isolation: 'isolate',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            background:
                              'linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 100%)',
                            backgroundSize: '28px 28px',
                            opacity: 0.16,
                            zIndex: -1,
                          }}
                        />
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                          <CreditCardOutlinedIcon />
                          <Chip
                            label='DEMO'
                            size='small'
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.16)',
                              color: '#fff',
                              fontWeight: 900,
                              borderRadius: '999px',
                            }}
                          />
                        </Stack>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: { xs: '1rem', sm: '1.28rem' },
                            letterSpacing: 0,
                            wordBreak: 'break-word',
                          }}
                        >
                          {cardNumberPreview}
                        </Typography>
                        <Stack direction='row' justifyContent='space-between' spacing={1.5}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '11px', opacity: 0.72, fontWeight: 800 }}>
                              CARD HOLDER
                            </Typography>
                            <Typography sx={{ fontWeight: 900, wordBreak: 'break-word' }}>
                              {cardDraft.holder || 'SPORTMIX CUSTOMER'}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                            <Typography sx={{ fontSize: '11px', opacity: 0.72, fontWeight: 800 }}>
                              {cardBrand}
                            </Typography>
                            <Typography sx={{ fontWeight: 900 }}>
                              {cardDraft.expiry || 'MM/YY'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                          gap: 1.4,
                          alignContent: 'start',
                        }}
                      >
                        <TextField
                          label='Номер карты'
                          value={cardDraft.number}
                          onChange={handleCardDraftChange('number')}
                          fullWidth
                          inputProps={{ inputMode: 'numeric', maxLength: 19 }}
                          sx={{ ...fieldSx, gridColumn: '1 / -1' }}
                        />
                        <TextField
                          label='Владелец карты'
                          value={cardDraft.holder}
                          onChange={handleCardDraftChange('holder')}
                          fullWidth
                          sx={{ ...fieldSx, gridColumn: '1 / -1' }}
                        />
                        <TextField
                          label='MM/YY'
                          value={cardDraft.expiry}
                          onChange={handleCardDraftChange('expiry')}
                          fullWidth
                          inputProps={{ inputMode: 'numeric', maxLength: 5 }}
                          sx={fieldSx}
                        />
                        <TextField
                          label='CVC'
                          value={cardDraft.cvc}
                          onChange={handleCardDraftChange('cvc')}
                          fullWidth
                          inputProps={{ inputMode: 'numeric', maxLength: 3 }}
                          sx={fieldSx}
                        />
                      </Box>
                    </Box>
                  ) : null}

                  {paymentMethod === 'sbp' ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '220px minmax(0, 1fr)' },
                        gap: 2,
                        alignItems: 'stretch',
                        p: { xs: 1.4, md: 1.8 },
                        borderRadius: '24px',
                        border: '1px solid rgba(124,58,237,0.14)',
                        bgcolor: '#fbfaff',
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.4,
                          borderRadius: '22px',
                          border: '1px solid rgba(124,58,237,0.16)',
                          bgcolor: '#fff',
                          width: '100%',
                          maxWidth: { xs: 220, sm: 'none' },
                          mx: { xs: 'auto', sm: 0 },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(17, 1fr)',
                            gap: '3px',
                            p: 1,
                            borderRadius: '16px',
                            bgcolor: '#fff',
                          }}
                        >
                          {qrCells.map((active, index) => (
                            <Box
                              key={index}
                              sx={{
                                aspectRatio: '1 / 1',
                                borderRadius: '2px',
                                bgcolor: active ? '#0f172a' : '#fff',
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      <Stack spacing={1.3} justifyContent='center' sx={{ minWidth: 0 }}>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <QrCode2OutlinedIcon sx={{ color: '#7c3aed' }} />
                          <Typography sx={{ fontWeight: 900, color: '#0f172a' }}>
                            Счет SportMix Pay
                          </Typography>
                        </Stack>
                        <Box>
                          <Typography sx={{ color: '#64748b', fontWeight: 800 }}>
                            К оплате
                          </Typography>
                          <Typography
                            sx={{
                              color: '#7c3aed',
                              fontWeight: 900,
                              fontSize: { xs: '1.55rem', md: '1.8rem' },
                            }}
                          >
                            {formatMoney(total)}
                          </Typography>
                        </Box>
                        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                          <Chip
                            label={`Действует ${formatTimer(sbpExpiresIn)}`}
                            sx={{
                              bgcolor: '#fff7ed',
                              color: '#c2410c',
                              fontWeight: 900,
                              borderRadius: '999px',
                            }}
                          />
                          <Chip
                            label='QR-SM-PAY'
                            sx={{
                              bgcolor: '#f3e8ff',
                              color: '#7c3aed',
                              fontWeight: 900,
                              borderRadius: '999px',
                            }}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  ) : null}

                  {paymentMethod === 'cash' ? (
                    <Box
                      sx={{
                        p: { xs: 1.6, md: 2.2 },
                        borderRadius: '24px',
                        border: '1px solid rgba(148,163,184,0.16)',
                        bgcolor: '#f8fbff',
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.4}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                      >
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '16px',
                            bgcolor: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <AccountBalanceWalletOutlinedIcon sx={{ color: '#0f172a' }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 900, color: '#0f172a' }}>
                            Оплата при получении
                          </Typography>
                          <Typography sx={{ color: '#64748b', lineHeight: 1.7 }}>
                            Сумма фиксируется в заказе, а платеж остается в ожидании до передачи
                            товара.
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ) : null}
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.6, sm: 2.2, md: 2.6 },
                  borderRadius: { xs: '20px', md: '26px' },
                  border: '1px solid rgba(148,163,184,0.16)',
                  bgcolor: '#fff',
                  boxShadow: '0 20px 44px rgba(15,23,42,0.05)',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.2}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent='space-between'
                >
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '14px',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: `${activeAccent}12`,
                        flexShrink: 0,
                      }}
                    >
                      <ShieldOutlinedIcon sx={{ color: activeAccent }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 900, color: '#0f172a' }}>
                        SportPay Demo
                      </Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '13px' }}>
                        Платежная симуляция без реального списания
                      </Typography>
                    </Box>
                  </Stack>

                  {currentPaymentStatus ? (
                    <Chip
                      label={currentPaymentStatus.label}
                      sx={{
                        bgcolor: currentPaymentStatus.bg,
                        color: currentPaymentStatus.color,
                        fontWeight: 900,
                        borderRadius: '999px',
                      }}
                    />
                  ) : (
                    <Chip
                      label='Готов к проверке'
                      sx={{
                        bgcolor: `${activeAccent}12`,
                        color: activeAccent,
                        fontWeight: 900,
                        borderRadius: '999px',
                      }}
                    />
                  )}
                </Stack>

                <LinearProgress
                  variant='determinate'
                  value={paymentProgress}
                  sx={{
                    my: 1.6,
                    height: 8,
                    borderRadius: '999px',
                    bgcolor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': { bgcolor: activeAccent },
                  }}
                />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                    gap: 1,
                  }}
                >
                  {activePaymentSteps.map((step, index) => {
                    const isCompleted = Boolean(paymentReceipt) || index < paymentStepIndex;
                    const isCurrent = isPaymentProcessing && index === paymentStepIndex;

                    return (
                      <Box
                        key={step}
                        sx={{
                          minHeight: 46,
                          px: 1.2,
                          py: 1,
                          borderRadius: '14px',
                          border: '1px solid rgba(148,163,184,0.16)',
                          bgcolor: isCompleted || isCurrent ? `${activeAccent}0f` : '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.9,
                          minWidth: 0,
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircleOutlineIcon
                            sx={{ color: '#15803d', fontSize: 19, flexShrink: 0 }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 19,
                              height: 19,
                              borderRadius: '50%',
                              border: `2px solid ${isCurrent ? activeAccent : '#cbd5e1'}`,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <Typography
                          sx={{
                            color: isCompleted || isCurrent ? activeAccent : '#64748b',
                            fontWeight: 900,
                            fontSize: '13px',
                            lineHeight: 1.35,
                          }}
                        >
                          {step}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>

                {paymentReceipt ? (
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    sx={{ mt: 1.6, color: '#15803d' }}
                  >
                    <ReceiptLongOutlinedIcon />
                    <Typography sx={{ fontWeight: 900, wordBreak: 'break-word' }}>
                      Транзакция {paymentReceipt.reference}
                      {paymentReceipt.cardLast4 ? `, карта **** ${paymentReceipt.cardLast4}` : ''}
                    </Typography>
                  </Stack>
                ) : null}
              </Paper>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.6, sm: 2.2, md: 2.6 },
                borderRadius: { xs: '20px', md: '28px' },
                border: '1px solid rgba(148,163,184,0.16)',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                boxShadow: '0 24px 60px rgba(15,23,42,0.07)',
                position: { lg: 'sticky' },
                top: { lg: 132 },
                minWidth: 0,
              }}
            >
              <Stack
                direction='row'
                spacing={1}
                alignItems='center'
                justifyContent='space-between'
                sx={{ mb: 1.8 }}
              >
                <Stack direction='row' spacing={1} alignItems='center'>
                  <ShoppingBagOutlinedIcon sx={{ color: '#0f449e' }} />
                  <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.2rem' }}>
                    Ваш заказ
                  </Typography>
                </Stack>
                <Chip
                  label={`${cart.length} поз.`}
                  size='small'
                  sx={{
                    bgcolor: '#eff6ff',
                    color: '#0f449e',
                    fontWeight: 900,
                    borderRadius: '999px',
                  }}
                />
              </Stack>

              {cart.length === 0 ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '18px',
                    bgcolor: '#f8fafc',
                    border: '1px solid rgba(148,163,184,0.14)',
                  }}
                >
                  <Typography sx={{ color: '#64748b', lineHeight: 1.7 }}>
                    Корзина пуста. Вернитесь в каталог, чтобы выбрать товары.
                  </Typography>
                </Box>
              ) : (
                <Stack
                  spacing={1.2}
                  sx={{
                    maxHeight: { lg: 'calc(100vh - 410px)' },
                    overflowY: { lg: 'auto' },
                    pr: { lg: 0.5 },
                  }}
                >
                  {cart.map((item, index) => (
                    <Box
                      key={`${item.id}-${item.selectedSize}-${index}`}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '64px minmax(0, 1fr)',
                          sm: '70px minmax(0, 1fr) auto',
                        },
                        gap: 1.2,
                        alignItems: 'center',
                        p: 1.2,
                        borderRadius: '18px',
                        border: '1px solid rgba(148,163,184,0.14)',
                        bgcolor: '#fff',
                        boxShadow: '0 10px 22px rgba(15,23,42,0.035)',
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 64, sm: 70 },
                          height: { xs: 64, sm: 70 },
                          borderRadius: '14px',
                          bgcolor: '#f8fafc',
                          display: 'grid',
                          placeItems: 'center',
                          p: 0.6,
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            color: '#0f172a',
                            fontSize: '14px',
                            lineHeight: 1.35,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          sx={{ color: '#64748b', fontSize: '12px', mt: 0.45, fontWeight: 700 }}
                        >
                          {item.selectedSize ? `Размер: ${item.selectedSize}, ` : ''}
                          {formatMoney(item.price)}
                        </Typography>
                      </Box>

                      <Stack
                        direction='row'
                        spacing={0.6}
                        alignItems='center'
                        justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
                        sx={{
                          gridColumn: { xs: '1 / -1', sm: 'auto' },
                          pl: { xs: 0, sm: 0.4 },
                        }}
                      >
                        <Stack
                          direction='row'
                          spacing={0.25}
                          alignItems='center'
                          sx={{ bgcolor: '#f8fafc', borderRadius: '999px', p: 0.35 }}
                        >
                          <Tooltip title='Уменьшить'>
                            <IconButton
                              size='small'
                              onClick={() =>
                                updateCartQuantity(item.id, item.selectedSize, item.quantity - 1)
                              }
                              sx={{ color: '#475569', width: 30, height: 30 }}
                            >
                              <RemoveIcon fontSize='inherit' />
                            </IconButton>
                          </Tooltip>
                          <Typography
                            sx={{
                              fontWeight: 900,
                              minWidth: 22,
                              textAlign: 'center',
                              fontSize: '13px',
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <Tooltip title='Увеличить'>
                            <IconButton
                              size='small'
                              onClick={() =>
                                updateCartQuantity(item.id, item.selectedSize, item.quantity + 1)
                              }
                              sx={{ color: '#0f449e', width: 30, height: 30 }}
                            >
                              <AddIcon fontSize='inherit' />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        <Tooltip title='Удалить'>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                            sx={{ width: 34, height: 34 }}
                          >
                            <DeleteOutlineIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography sx={{ color: '#64748b', fontWeight: 800 }}>Товары</Typography>
                  <Typography sx={{ fontWeight: 900, color: '#0f172a' }}>
                    {formatMoney(cartSubtotal)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography sx={{ color: '#64748b', fontWeight: 800 }}>Самовывоз</Typography>
                  <Typography sx={{ fontWeight: 900, color: '#15803d' }}>Бесплатно</Typography>
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 900, color: '#0f172a' }}>Итого</Typography>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: '#0f449e',
                      fontSize: { xs: '1.45rem', md: '1.65rem' },
                    }}
                  >
                    {formatMoney(total)}
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant='contained'
                fullWidth
                disabled={isPlacingOrder || isPaymentProcessing || cart.length === 0}
                onClick={handleSubmitOrder}
                sx={{
                  mt: 2.3,
                  py: { xs: 1.55, md: 1.75 },
                  borderRadius: '16px',
                  fontWeight: 900,
                  bgcolor: '#0f449e',
                  textTransform: 'none',
                  boxShadow: '0 18px 34px rgba(15,68,158,0.24)',
                  '&:hover': { bgcolor: '#0b337a' },
                }}
              >
                {submitButtonLabel}
              </Button>
            </Paper>
          </Box>
        </Stack>
      </Container>

      <Suspense fallback={null}>
        <LazyFooter />
      </Suspense>
    </Box>
  );
}

export default CheckoutPage;
