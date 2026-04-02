import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Avatar,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('linear-gradient(135deg, #2b61b3 0%, #0f449e 100%)');
  
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const orders = [
    { id: 'ORD-406171', date: '25.03.2026', total: '12 500 ₽', status: 'В пути', statusColor: 'warning' },
    { id: 'ORD-305122', date: '10.02.2026', total: '8 900 ₽', status: 'Доставлен', statusColor: 'success' },
  ];

  // === 1. ЗАГРУЗКА ДАННЫХ ИЗ БАЗЫ (С токеном!) ===
  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:5000/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}` // Передаем токен серверу
      }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setUser({
            name: data.name || 'Имя не указано',
            email: data.email || 'Email не указан',
            phone: data.phone || '',
            address: data.address || ''
          });
          if (data.avatar) setAvatarPreview(data.avatar);
          if (data.banner) setBannerPreview(data.banner);
        }
      })
      .catch(err => console.error('Ошибка загрузки профиля:', err));
  }, []);

  // === 2. ФУНКЦИЯ СОХРАНЕНИЯ ДАННЫХ В БАЗУ (С токеном!) ===
  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Передаем токен серверу
        },
        body: JSON.stringify({
          ...user,
          avatar: avatarPreview,
          banner: bannerPreview
        }),
      });

      const data = await response.json();
      
      if (!data.error) {
        setIsEditing(false); // Выключаем режим редактирования при успехе
        alert('Профиль успешно сохранен в базе данных!');
      } else {
        alert('Ошибка при сохранении: ' + data.error);
      }
    } catch (err) {
      console.error('Ошибка при отправке данных:', err);
      alert('Не удалось связаться с сервером');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => avatarInputRef.current?.click();
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerClick = () => bannerInputRef.current?.click();
  const handleBannerChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const bgValue = `url(${reader.result})`;
        setBannerPreview(bgValue);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
      {/* Баннер */}
      <Box 
        sx={{ 
          height: 220, background: bannerPreview, backgroundSize: 'cover', backgroundPosition: 'center',
          borderRadius: '16px 16px 0 0', position: 'relative', mb: -10, display: 'flex',
          alignItems: 'flex-start', p: 3, transition: 'background 0.3s ease',
          '&:hover .change-banner-btn': { opacity: 1 }
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ 
            color: '#fff', textTransform: 'none', fontWeight: 'bold', 
            bgcolor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(5px)', 
            borderRadius: '12px', p: '8px 20px',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' }
          }}
        >
          На главную
        </Button>

        <Tooltip title="Изменить обложку профиля" arrow placement="left">
          <Button
            className="change-banner-btn"
            onClick={handleBannerClick}
            startIcon={<PhotoCameraIcon />}
            sx={{ 
              position: 'absolute', bottom: 110, right: 20, opacity: 0, 
              transition: 'opacity 0.2s ease', color: '#fff', textTransform: 'none', fontWeight: '500', 
              bgcolor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(3px)', 
              borderRadius: '20px', p: '6px 16px', fontSize: '0.85rem',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.6)' }
            }}
          >
            Изменить фон
          </Button>
        </Tooltip>
        <input type="file" ref={bannerInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleBannerChange} />
      </Box>

      <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Левая колонка */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 4, border: '1px solid #f0f0f0', borderRadius: '16px', textAlign: 'center', height: 'fit-content', bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <Box onClick={handleAvatarClick} sx={{ position: 'relative', width: 130, height: 130, mx: 'auto', mb: 3, cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.03)' }, '&:hover .camera-icon': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' } }}>
              <Avatar src={avatarPreview} sx={{ width: '100%', height: '100%', bgcolor: '#ff9800', fontSize: '3.5rem', border: '5px solid #fff', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
                {!avatarPreview && (user.name ? user.name.charAt(0) : 'U')}
              </Avatar>
              <Box className="camera-icon" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0, width: '100%', height: '100%', borderRadius: '50%', bgcolor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'all 0.3s ease-in-out', zIndex: 1 }}>
                <PhotoCameraIcon sx={{ fontSize: '2.5rem' }} />
              </Box>
            </Box>

            <input type="file" ref={avatarInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
            
            {!isEditing ? (
              <>
                <Typography variant="h5" sx={{ fontWeight: '900', color: '#1a1a1a', mb: 0.5 }}>{user.name}</Typography>
                <Typography variant="body1" sx={{ color: '#0f449e', fontWeight: '500', mb: 3 }}>{user.email}</Typography>
              </>
            ) : (
              <Box sx={{ mb: 3 }}>
                <TextField fullWidth label="Имя" name="name" value={user.name} onChange={handleChange} size="small" sx={{ mb: 1.5 }} />
                <TextField fullWidth label="Email" name="email" value={user.email} onChange={handleChange} size="small" />
              </Box>
            )}
            
            <Button
              variant="contained"
              startIcon={isEditing ? <SaveOutlinedIcon /> : <EditOutlinedIcon />}
              fullWidth
              sx={{ bgcolor: isEditing ? '#2e7d32' : '#0f449e', color: '#fff', textTransform: 'none', fontWeight: 'bold', borderRadius: '12px', py: 1.5, fontSize: '1rem', boxShadow: isEditing ? '0 4px 12px rgba(46, 125, 50, 0.3)' : '0 4px 12px rgba(15, 68, 158, 0.3)', '&:hover': { bgcolor: isEditing ? '#1b5e20' : '#0b3376', boxShadow: isEditing ? '0 6px 16px rgba(46, 125, 50, 0.4)' : '0 6px 16px rgba(15, 68, 158, 0.4)' } }}
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? 'Сохранить в базу' : 'Редактировать профиль'}
            </Button>
          </Paper>
        </Grid>

        {/* Правая колонка */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 4, border: '1px solid #f0f0f0', borderRadius: '16px', mb: 4, boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Avatar sx={{ bgcolor: '#e3f2fd', color: '#0f449e' }}><PersonOutlineIcon /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Личные данные</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: '500' }}>Телефон</Typography>
                {!isEditing ? (
                  <Typography variant="body1" sx={{ fontWeight: '600', fontSize: '1.1rem' }}>{user.phone || 'Не указан'}</Typography>
                ) : (
                  <TextField fullWidth name="phone" value={user.phone} onChange={handleChange} size="small" />
                )}
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 4, border: '1px solid #f0f0f0', borderRadius: '16px', mb: 4, boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}><LocationOnOutlinedIcon /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Адрес доставки</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            {!isEditing ? (
              <Typography variant="body1" sx={{ color: '#333', bgcolor: '#fbfcfd', p: 2, borderRadius: '8px', border: '1px solid #f0f0f0' }}>{user.address || 'Не указан'}</Typography>
            ) : (
              <TextField fullWidth name="address" value={user.address} onChange={handleChange} size="small" multiline rows={2} />
            )}
          </Paper>

          <Paper elevation={0} sx={{ p: 4, border: '1px solid #f0f0f0', borderRadius: '16px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Avatar sx={{ bgcolor: '#fff3e0', color: '#ff9800' }}><ShoppingBagOutlinedIcon /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Последние заказы</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <List disablePadding>
              {orders.map((order) => (
                <ListItem key={order.id} sx={{ px: 0, py: 2, borderBottom: '1px solid #f5f5f5', '&:last-child': { borderBottom: 'none' }, cursor: 'pointer', '&:hover': { bgcolor: '#fbfcfd', px: 1, borderRadius: '8px' } }} onClick={() => navigate('/orders')}>
                  <ListItemText primary={<Typography sx={{ fontWeight: 'bold', color: '#1a1a1a', fontSize: '1.05rem' }}>Заказ {order.id}</Typography>} secondary={`Дата: ${order.date} — Сумма: ${order.total}`} />
                  <Tooltip title={`Статус: ${order.status}`} arrow><Chip label={order.status} color={order.statusColor} size="medium" sx={{ fontWeight: 'bold', borderRadius: '8px', p: '0 5px' }} /></Tooltip>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProfilePage;