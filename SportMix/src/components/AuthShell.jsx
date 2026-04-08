import { Box, Container, Paper, Typography } from "@mui/material";

function AuthShell({ eyebrow, title, subtitle, children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 4, md: 8 },
        background:
          "radial-gradient(circle at top left, rgba(96,165,250,0.18) 0%, transparent 24%), linear-gradient(180deg, #f7fbff 0%, #eef4fb 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
            gap: 3,
            alignItems: "stretch",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: "36px",
              overflow: "hidden",
              position: "relative",
              background:
                "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(15,68,158,0.90) 52%, rgba(37,99,235,0.84) 100%)",
              color: "#fff",
              minHeight: { xs: 280, md: 620 },
              p: { xs: 3, md: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 30px 80px rgba(15,23,42,0.18)",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.68)", mb: 1.2 }}>
                {eyebrow}
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: "2.4rem", md: "4.2rem" }, lineHeight: 0.95, letterSpacing: "-0.06em", fontFamily: '"Montserrat", sans-serif', mb: 2 }}>
                SPORT
                <br />
                MIX
              </Typography>
              <Typography sx={{ maxWidth: 420, color: "rgba(255,255,255,0.82)", lineHeight: 1.8, fontSize: "1rem" }}>
                Четкий интерфейс, быстрый поиск и покупки без хаоса. Мы собрали для тебя более чистый и цельный опыт.
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 4,
                p: 2.5,
                borderRadius: "24px",
                backgroundColor: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography sx={{ fontWeight: 900, mb: 0.75 }}>Почему стало лучше</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.7, fontSize: "14px" }}>
                Один сильный стиль, меньше визуального шума, понятнее действия и заметно более аккуратная логика переходов.
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: "36px",
              p: { xs: 3, md: 5 },
              background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
              border: "1px solid rgba(148,163,184,0.16)",
              boxShadow: "0 30px 80px rgba(15,23,42,0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0f449e", mb: 1 }}>
              {eyebrow}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", mb: 1.2 }}>
              {title}
            </Typography>
            <Typography sx={{ color: "#64748b", lineHeight: 1.7, mb: 3 }}>
              {subtitle}
            </Typography>
            {children}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default AuthShell;
