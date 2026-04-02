import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RegisterPage = ({ setUser }) => { // <-- Принимаем setUser
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при регистрации');
      }

      // Сохраняем токен и перекидываем на главную
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Магически обновляем стейт юзера
      setUser(data.user);

      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 10 }}>
      <Paper elevation={0} sx={{ p: 5, borderRadius: '16px', border: '1px solid #EDF2F7', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, textAlign: 'center', color: '#1A202C' }}>
          РЕГИСТРАЦИЯ
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Имя пользователя"
            name="username"
            fullWidth
            required
            value={formData.username}
            onChange={handleChange}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          <TextField
            label="E-mail"
            name="email"
            type="email"
            fullWidth
            required
            value={formData.email}
            onChange={handleChange}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          <TextField
            label="Пароль"
            name="password"
            type="password"
            fullWidth
            required
            value={formData.password}
            onChange={handleChange}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#0f449e',
              py: 1.5,
              borderRadius: '50px',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(15, 68, 158, 0.2)',
              '&:hover': { bgcolor: '#0b3376' }
            }}
          >
            Создать аккаунт
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={() => navigate('/login')}
            sx={{ color: '#718096', fontWeight: 600, textTransform: 'none' }}
          >
            Уже есть аккаунт? Войти
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;