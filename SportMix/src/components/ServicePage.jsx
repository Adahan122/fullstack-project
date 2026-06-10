import { Box, Button, Chip, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMemo, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Footer = lazy(() => import('./Footer'));
import Header from './Header';
import { servicePages } from '../lib/shop-content';

function ServicePage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const page = useMemo(() => servicePages[slug] || servicePages.delivery, [slug]);

  return (
    <Box sx={{ bgcolor: '#eef4fb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Container maxWidth='lg' sx={{ py: { xs: 3, md: 5 }, flex: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ color: '#0f449e', textTransform: 'none', fontWeight: 800, mb: 3 }}
        >
          Назад к покупкам
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: '32px',
            border: '1px solid rgba(148,163,184,0.14)',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
            boxShadow: '0 24px 60px rgba(15,23,42,0.06)',
            mb: 3,
          }}
        >
          <Chip
            label={page.eyebrow}
            sx={{
              mb: 2,
              bgcolor: 'rgba(15,68,158,0.08)',
              color: '#0f449e',
              fontWeight: 900,
              borderRadius: '999px',
            }}
          />
          <Typography
            variant='h2'
            sx={{
              fontWeight: 900,
              color: '#0f172a',
              fontSize: { xs: '2.2rem', md: '3.4rem' },
              letterSpacing: '-0.05em',
              mb: 1.2,
            }}
          >
            {page.title}
          </Typography>
          <Typography sx={{ color: '#64748b', lineHeight: 1.8, maxWidth: 760 }}>
            {page.description}
          </Typography>
        </Paper>

        <Grid container spacing={2.5}>
          {page.highlights.map((highlight) => (
            <Grid item xs={12} md={4} key={highlight}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.2,
                  height: '100%',
                  borderRadius: '24px',
                  border: '1px solid rgba(148,163,184,0.14)',
                  bgcolor: '#fff',
                }}
              >
                <Typography sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.5 }}>
                  {highlight}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Stack spacing={2.5} sx={{ mt: 3 }}>
          {page.sections.map((section) => (
            <Paper
              key={section.title}
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: '28px',
                border: '1px solid rgba(148,163,184,0.14)',
                bgcolor: '#fff',
              }}
            >
              <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.3rem', mb: 1 }}>
                {section.title}
              </Typography>
              <Typography sx={{ color: '#475569', lineHeight: 1.85 }}>{section.body}</Typography>
            </Paper>
          ))}
        </Stack>
      </Container>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </Box>
  );
}

export default ServicePage;
