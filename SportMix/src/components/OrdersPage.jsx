import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Chip,
  Grid,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

function OrdersPage() {
  const navigate = useNavigate();

  // Имитация данных заказов
  const orders = [
    {
      id: 'ORD-406171',
      date: '25.03.2026',
      total: '12 500 ₽',
      status: 'В пути',
      statusColor: 'warning',
      icon: <LocalShippingOutlinedIcon sx={{ color: '#ffa726' }} />,
      items: [
        { id: 1, name: 'Кроссовки Nike Air Max', size: '42', price: '8 500 ₽', quantity: 1, image: 'https://via.placeholder.com/60' },
        { id: 2, name: 'Спортивная футболка Adidas', size: 'M', price: '4 000 ₽', quantity: 1, image: 'https://via.placeholder.com/60' }
      ]
    },
    {
      id: 'ORD-305122',
      date: '10.02.2026',
      total: '8 900 ₽',
      status: 'Доставлен',
      statusColor: 'success',
      icon: <CheckCircleOutlineIcon sx={{ color: '#66bb6a' }} />,
      items: [
        { id: 3, name: 'Спортивный костюм Puma', size: 'L', price: '8 900 ₽', quantity: 1, image: 'https://via.placeholder.com/60' }
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      {/* Кнопка возврата в профиль */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/profile')}
        sx={{ color: '#0f449e', textTransform: 'none', fontWeight: 'bold', mb: 3 }}
      >
        Назад в профиль
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a1a1a', mb: 4 }}>
        Мои заказы
      </Typography>

      {orders.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid #eaeaea', borderRadius: '12px' }}>
          <ShoppingBagOutlinedIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#555', mb: 1 }}>Вы еще не делали заказов</Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ bgcolor: '#0f449e', color: '#fff', textTransform: 'none', borderRadius: '6px', mt: 1 }}
          >
            Перейти к покупкам
          </Button>
        </Paper>
      ) : (
        <Box>
          {orders.map((order) => (
            <Accordion 
              key={order.id} 
              elevation={0} 
              sx={{ 
                border: '1px solid #eaeaea', 
                borderRadius: '12px !important', // Важно для перебивания дефолтных стилей MUI
                mb: 2,
                '&:before': { display: 'none' } // Убираем дефолтную серую полоску аккордеона
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid container alignItems="center" spacing={2} sx={{ py: 1 }}>
                  {/* Иконка статуса */}
                  <Grid item xs={12} sm={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                    {order.icon}
                  </Grid>

                  {/* Номер и дата */}
                  <Grid item xs={12} sm={4}>
                    <Typography sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>Заказ {order.id}</Typography>
                    <Typography variant="caption" sx={{ color: '#888' }}>от {order.date}</Typography>
                  </Grid>

                  {/* Сумма заказа */}
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" sx={{ color: '#888' }}>Сумма заказа</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: '#0f449e' }}>{order.total}</Typography>
                  </Grid>

                  {/* Статус в виде чипа */}
                  <Grid item xs={6} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' }, pr: { sm: 2 } }}>
                    <Chip 
                      label={order.status} 
                      color={order.statusColor} 
                      size="small" 
                      sx={{ fontWeight: 'bold', borderRadius: '6px' }} 
                    />
                  </Grid>
                </Grid>
              </AccordionSummary>
              
              <Divider />
              
              <AccordionDetails sx={{ p: 3, bgcolor: '#fbfbfc' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#555' }}>
                  Состав заказа:
                </Typography>
                <List disablePadding>
                  {order.items.map((item) => (
                    <ListItem 
                      key={item.id} 
                      sx={{ 
                        px: 0, 
                        py: 2, 
                        borderBottom: '1px solid #eaeaea',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      {/* Картинка товара */}
                      <Box sx={{ width: 60, height: 60, bgcolor: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', mr: 2, overflow: 'hidden' }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </Box>

                      {/* Информация о товаре */}
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>{item.name}</Typography>}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#777' }}>Размер: <b>{item.size}</b></Typography>
                            <Typography variant="caption" sx={{ color: '#777' }}>Кол-во: <b>{item.quantity} шт.</b></Typography>
                          </Box>
                        }
                      />

                      {/* Цена */}
                      <Typography sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
                        {item.price}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default OrdersPage;