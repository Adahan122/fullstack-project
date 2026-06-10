import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useNavigate } from 'react-router-dom';

import { useApp } from '../context/app-context';
import { fetchOrders, fetchProfile, updateProfile } from '../lib/api';
import { formatCurrency } from '../lib/format';

const emptyProfile = {
  username: '',
  email: '',
  phone: '',
  address: '',
  avatar: '',
  role: 'customer',
  createdAt: '',
};

const statusMeta = {
  processing: {
    label: 'В обработке',
    color: 'info',
    icon: <ShoppingBagOutlinedIcon />,
  },
  shipped: {
    label: 'В пути',
    color: 'warning',
    icon: <LocalShippingOutlinedIcon />,
  },
  delivered: {
    label: 'Доставлен',
    color: 'success',
    icon: <CheckCircleOutlineIcon />,
  },
};

function getRoleLabel(role) {
  return role === 'admin' ? 'Администратор' : 'Покупатель';
}

function formatMemberSince(createdAt) {
  if (!createdAt) {
    return 'Недавно';
  }

  return new Date(createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ProfilePage() {
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const { setUser, showToast, token, user } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({
    ...emptyProfile,
    username: user?.username || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchProfile(token)
      .then((data) => {
        const nextProfile = {
          username: data.username || user?.username || '',
          email: data.email || user?.email || '',
          phone: data.phone || '',
          address: data.address || '',
          avatar: data.avatar || '',
          role: data.role || 'customer',
          createdAt: data.created_at || '',
        };

        setProfile(nextProfile);
      })
      .catch((error) => {
        console.error('Ошибка загрузки профиля:', error);
      });
  }, [token, user?.email, user?.username]);

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchOrders(token)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error('Ошибка загрузки заказов:', error);
        setOrders([]);
      });
  }, [token]);

  const recentOrders = useMemo(
    () =>
      orders.slice(0, 3).map((order) => ({
        ...order,
        ...(statusMeta[order.status] || statusMeta.processing),
      })),
    [orders],
  );

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders],
  );

  const deliveredOrdersCount = useMemo(
    () => orders.filter((order) => order.status === 'delivered').length,
    [orders],
  );

  const profileCompletion = useMemo(() => {
    const fields = [profile.username, profile.email, profile.phone, profile.address];
    const filled = fields.filter((value) => String(value || '').trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile.address, profile.email, profile.phone, profile.username]);

  const roleLabel = useMemo(() => getRoleLabel(profile.role), [profile.role]);
  const memberSinceLabel = useMemo(() => formatMemberSince(profile.createdAt), [profile.createdAt]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((currentProfile) => ({ ...currentProfile, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const savedProfile = await updateProfile(token, {
        username: profile.username,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        avatar: profile.avatar,
      });

      setProfile((currentProfile) => ({
        ...currentProfile,
        username: savedProfile.username || '',
        email: savedProfile.email || '',
        phone: savedProfile.phone || '',
        address: savedProfile.address || '',
        avatar: savedProfile.avatar || '',
        role: savedProfile.role || currentProfile.role || 'customer',
        createdAt: savedProfile.created_at || currentProfile.createdAt || '',
      }));
      setUser((currentUser) => ({
        ...(currentUser || {}),
        username: savedProfile.username,
        email: savedProfile.email,
      }));
      setIsEditing(false);
      showToast('Профиль сохранён');
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
      showToast(error.message || 'Не удалось сохранить профиль', 'error');
    }
  };

  const readImageFile = (file, onLoad) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => onLoad(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAvatarChange = (event) => {
    readImageFile(event.target.files?.[0], (result) => {
      setProfile((currentProfile) => ({ ...currentProfile, avatar: result }));
    });
  };

  return (
    <Box sx={{ bgcolor: '#f7fbff', minHeight: '100vh' }}>
      <Container maxWidth='md' sx={{ py: { xs: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ color: '#0f449e', textTransform: 'none', fontWeight: 800 }}
          >
            Назад
          </Button>
          <Typography variant='h5' sx={{ fontWeight: 900, color: '#0f172a' }}>
            Мой профиль
          </Typography>
        </Box>

        {/* Main Grid: Profile Card Left, Info Right */}
        <Grid container spacing={3}>
          {/* Left: Profile Card */}
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: '20px',
                bgcolor: '#fff',
                border: '1px solid rgba(148,163,184,0.12)',
                boxShadow: '0 12px 24px rgba(15,23,42,0.06)',
              }}
            >
              {/* Avatar */}
              <Box sx={{ textAlign: 'center', mb: 3, position: 'relative' }}>
                <Box
                  onClick={() => avatarInputRef.current?.click()}
                  sx={{
                    position: 'relative',
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover .avatar-overlay': { opacity: 1 },
                  }}
                >
                  <Avatar
                    src={profile.avatar}
                    sx={{
                      width: '100%',
                      height: '100%',
                      bgcolor: '#0f449e',
                      fontSize: '2.5rem',
                      border: '3px solid #fff',
                      boxShadow: '0 8px 16px rgba(15,23,42,0.12)',
                    }}
                  >
                    {!profile.avatar && (profile.username ? profile.username.charAt(0) : 'U')}
                  </Avatar>
                  <Box
                    className='avatar-overlay'
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      bgcolor: 'rgba(15,23,42,0.5)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: '1.5rem' }} />
                  </Box>
                </Box>

                <input
                  type='file'
                  ref={avatarInputRef}
                  style={{ display: 'none' }}
                  accept='image/*'
                  onChange={handleAvatarChange}
                />

                <Typography
                  sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.25rem', mb: 0.3 }}
                >
                  {profile.username || 'Без имени'}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                  {profile.email}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Stats */}
              <Stack spacing={1.5} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Заказов</Typography>
                  <Typography sx={{ color: '#0f172a', fontWeight: 900 }}>
                    {orders.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Доставлено</Typography>
                  <Typography sx={{ color: '#0f172a', fontWeight: 900 }}>
                    {deliveredOrdersCount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Потрачено</Typography>
                  <Typography sx={{ color: '#0f172a', fontWeight: 900 }}>
                    {formatCurrency(totalSpent)}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Role & Completion */}
              <Stack direction='row' spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label={roleLabel}
                  size='small'
                  sx={{ bgcolor: '#eff6ff', color: '#0f449e', fontWeight: 700 }}
                />
                <Chip
                  label={`${profileCompletion}% заполнен`}
                  size='small'
                  sx={{
                    bgcolor: profileCompletion === 100 ? '#dcfce7' : '#fff7ed',
                    color: profileCompletion === 100 ? '#15803d' : '#ea580c',
                    fontWeight: 700,
                  }}
                />
              </Stack>

              {/* Edit Button */}
              <Button
                variant='contained'
                fullWidth
                startIcon={isEditing ? <SaveOutlinedIcon /> : <EditOutlinedIcon />}
                onClick={() => {
                  if (isEditing) handleSaveProfile();
                  else setIsEditing(true);
                }}
                sx={{
                  bgcolor: isEditing ? '#15803d' : '#0f449e',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: '12px',
                  py: 1.2,
                  mb: isEditing ? 1 : 0,
                  '&:hover': { bgcolor: isEditing ? '#166534' : '#0b3376' },
                }}
              >
                {isEditing ? 'Сохранить' : 'Редактировать'}
              </Button>

              {isEditing && (
                <Button
                  variant='text'
                  fullWidth
                  onClick={() => setIsEditing(false)}
                  sx={{ color: '#64748b', textTransform: 'none', fontWeight: 700, mt: 1 }}
                >
                  Отменить
                </Button>
              )}
            </Paper>
          </Grid>

          {/* Right: Info & Orders */}
          <Grid item xs={12} sm={8}>
            {/* Profile Info */}
            <Paper
              sx={{
                p: 3,
                borderRadius: '20px',
                bgcolor: '#fff',
                border: '1px solid rgba(148,163,184,0.12)',
                boxShadow: '0 12px 24px rgba(15,23,42,0.06)',
                mb: 3,
              }}
            >
              <Typography variant='h6' sx={{ fontWeight: 900, color: '#0f172a', mb: 2 }}>
                Информация
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2}>
                {/* Username & Email */}
                {!isEditing ? (
                  <>
                    <Box>
                      <Typography
                        sx={{
                          color: '#94a3b8',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          mb: 0.5,
                        }}
                      >
                        Имя
                      </Typography>
                      <Typography sx={{ color: '#0f172a', fontWeight: 600 }}>
                        {profile.username || '—'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          color: '#94a3b8',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          mb: 0.5,
                        }}
                      >
                        Email
                      </Typography>
                      <Typography
                        sx={{ color: '#0f172a', fontWeight: 600, wordBreak: 'break-word' }}
                      >
                        {profile.email || '—'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          color: '#94a3b8',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          mb: 0.5,
                        }}
                      >
                        Роль
                      </Typography>
                      <Typography sx={{ color: '#0f172a', fontWeight: 600 }}>
                        {roleLabel}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          color: '#94a3b8',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          mb: 0.5,
                        }}
                      >
                        В системе с
                      </Typography>
                      <Typography sx={{ color: '#0f172a', fontWeight: 600 }}>
                        {memberSinceLabel}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <TextField
                      label='Имя'
                      fullWidth
                      name='username'
                      value={profile.username}
                      onChange={handleChange}
                      size='small'
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField
                      label='Email'
                      fullWidth
                      name='email'
                      value={profile.email}
                      onChange={handleChange}
                      size='small'
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField
                      label='Телефон'
                      fullWidth
                      name='phone'
                      value={profile.phone}
                      onChange={handleChange}
                      size='small'
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </>
                )}
              </Stack>
            </Paper>

            {/* Delivery & Contact */}
            <Paper
              sx={{
                p: 3,
                borderRadius: '20px',
                bgcolor: '#fff',
                border: '1px solid rgba(148,163,184,0.12)',
                boxShadow: '0 12px 24px rgba(15,23,42,0.06)',
                mb: 3,
              }}
            >
              <Typography variant='h6' sx={{ fontWeight: 900, color: '#0f172a', mb: 2 }}>
                Доставка
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              {!isEditing ? (
                <Box>
                  <Typography
                    sx={{
                      color: '#94a3b8',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      mb: 0.5,
                    }}
                  >
                    Адрес
                  </Typography>
                  <Typography
                    sx={{
                      color: '#0f172a',
                      fontWeight: 500,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {profile.address || 'Не указан'}
                  </Typography>
                </Box>
              ) : (
                <TextField
                  label='Адрес для доставки'
                  fullWidth
                  name='address'
                  value={profile.address}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  size='small'
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              )}
            </Paper>

            {/* Recent Orders */}
            <Paper
              sx={{
                p: 3,
                borderRadius: '20px',
                bgcolor: '#fff',
                border: '1px solid rgba(148,163,184,0.12)',
                boxShadow: '0 12px 24px rgba(15,23,42,0.06)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant='h6' sx={{ fontWeight: 900, color: '#0f172a' }}>
                  Последние заказы
                </Typography>
                <Button
                  size='small'
                  onClick={() => navigate('/orders')}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Все
                </Button>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              {recentOrders.length === 0 ? (
                <Typography sx={{ color: '#64748b', textAlign: 'center', py: 3 }}>
                  Здесь появятся ваши заказы
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {recentOrders.map((order) => (
                    <Box
                      key={order.id}
                      onClick={() => navigate('/orders')}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: '#f8fafc',
                        border: '1px solid rgba(148,163,184,0.12)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: '#eef4fb', borderColor: '#0f449e' },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          gap: 2,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 800, color: '#0f172a', mb: 0.4 }}>
                            Заказ {order.orderNumber}
                          </Typography>
                          <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')} •{' '}
                            {formatCurrency(order.total)}
                          </Typography>
                        </Box>
                        <Chip
                          icon={order.icon}
                          label={order.label}
                          color={order.color}
                          size='small'
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ProfilePage;
