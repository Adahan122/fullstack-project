import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';

const Footer = () => {
  return (
    <Box sx={{ 
      bgcolor: '#0F172A', // Насыщенный благородный темный цвет
      color: '#fff', 
      pt: 8, 
      pb: 4, 
      mt: 'auto',
      borderTop: '4px solid #0f449e' // Яркий акцент сверху, связывающий футер с сайтом
    }}>
      <Container maxWidth="xl">
        <Grid container spacing={5}>
          
          {/* Колонка 1: О магазине */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 900, 
                mb: 2, 
                letterSpacing: '0.05em', 
                fontFamily: '"Montserrat", sans-serif',
                textTransform: 'uppercase'
              }}
            >
              SPORT<span style={{ color: '#0f449e' }}>MIX</span>
            </Typography>
            
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, lineHeight: 1.8, maxWidth: '340px' }}>
              Твой гид в мире спортивной одежды и аксессуаров. Только оригинальные бренды и лучшие цены для твоих побед.
            </Typography>
            
            {/* Стильные иконки соцсетей */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[
                { icon: <FacebookIcon sx={{ fontSize: 20 }} />, link: '#' },
                { icon: <InstagramIcon sx={{ fontSize: 20 }} />, link: '#' },
                { icon: <TelegramIcon sx={{ fontSize: 20 }} />, link: '#' }
              ].map((item, index) => (
                <IconButton 
                  key={index}
                  href={item.link}
                  sx={{ 
                    color: '#94A3B8', 
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    p: 1.2,
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      color: '#fff', 
                      bgcolor: '#0f449e',
                      borderColor: '#0f449e',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 4px 12px rgba(15, 68, 158, 0.3)'
                    } 
                  }}
                >
                  {item.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Колонка 2: Покупателям */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: '#fff', position: 'relative' }}>
              Покупателям
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {['Доставка', 'Оплата', 'Возврат товара', 'Частые вопросы'].map((text) => (
                <Link 
                  key={text}
                  href="#" 
                  underline="none" 
                  sx={{ 
                    color: '#94A3B8', 
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    '&:hover': { color: '#fff', transform: 'translateX(4px)' },
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {text}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Колонка 3: Категории */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: '#fff' }}>
              Категории
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {['Обувь', 'Одежда', 'Аксессуары', 'Новинки'].map((text) => (
                <Link 
                  key={text}
                  href="#" 
                  underline="none" 
                  sx={{ 
                    color: '#94A3B8', 
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    '&:hover': { color: '#fff', transform: 'translateX(4px)' }
                  }}
                >
                  {text}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Колонка 4: Контакты */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: '#fff' }}>
              Контакты
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                Телефон: <Link href="tel:+79998887766" sx={{ color: '#fff', textDecoration: 'none', fontWeight: 600, '&:hover': { color: '#0f449e' } }}>+7 (999) 888-77-66</Link>
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                Email: <Link href="mailto:info@sportshop.ru" sx={{ color: '#fff', textDecoration: 'none', fontWeight: 600, '&:hover': { color: '#0f449e' } }}>info@sportshop.ru</Link>
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Адрес: <span style={{ color: '#fff' }}>г. Москва, ул. Спортивная, д. 10</span>
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Нижняя копирайт-панель */}
        <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', mt: 6, pt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500 }}>
            © {new Date().getFullYear()} SPORTMIX. Все права защищены.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
