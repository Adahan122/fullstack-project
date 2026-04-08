import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

function AdminSidebar({
  sections,
  activeSection,
  onSectionChange,
  onRefresh,
  isRefreshing,
  user,
  adminEmail,
}) {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.4,
        borderRadius: "30px",
        border: "1px solid rgba(148,163,184,0.14)",
        background: "linear-gradient(180deg, #0f172a 0%, #0f449e 100%)",
        color: "#fff",
        position: { lg: "sticky" },
        top: 24,
        overflow: "hidden",
      }}
    >
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/")} sx={{ color: "rgba(255,255,255,0.92)", textTransform: "none", fontWeight: 800, mb: 2 }}>
        Вернуться в магазин
      </Button>

      <Typography sx={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.62)", mb: 1 }}>
        Admin panel
      </Typography>
      <Typography sx={{ fontWeight: 900, fontSize: { xs: "2rem", md: "2.3rem" }, lineHeight: 0.96, letterSpacing: "-0.05em", mb: 1.2 }}>
        SPORTMIX
        <br />
        Control
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7, mb: 2.5, display: { xs: "none", sm: "block" } }}>
        Управляй магазином, каталогом, заказами и аккаунтами из одного сильного пространства.
      </Typography>

      <Paper elevation={0} sx={{ p: 2, borderRadius: "22px", bgcolor: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)", mb: 2.5, display: { xs: "none", md: "block" } }}>
        <Typography sx={{ color: "rgba(255,255,255,0.62)", fontSize: "12px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", mb: 0.7 }}>
          Admin login
        </Typography>
        <Typography sx={{ fontWeight: 900, mb: 0.4 }}>
          {adminEmail || "admin@sportmix.dev"}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: "14px", lineHeight: 1.7 }}>
          Пароль по умолчанию: <b>SportMixAdmin123!</b>
        </Typography>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "1fr" },
          gap: 1,
        }}
      >
        {sections.map((section) => {
          const isActive = activeSection === section.key;
          return (
            <Button
              key={section.key}
              onClick={() => onSectionChange(section.key)}
              startIcon={section.icon}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                borderRadius: "18px",
                px: 2,
                py: 1.2,
                fontWeight: 800,
                color: isActive ? "#0f172a" : "#fff",
                bgcolor: isActive ? "#fff" : "rgba(255,255,255,0.08)",
                "&:hover": { bgcolor: isActive ? "#fff" : "rgba(255,255,255,0.14)" },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                {section.label}
              </Box>
            </Button>
          );
        })}
      </Box>

      <Divider sx={{ my: 2.5, borderColor: "rgba(255,255,255,0.12)", display: { xs: "none", md: "block" } }} />

      <Typography sx={{ fontWeight: 800, display: { xs: "none", md: "block" } }}>
        {user?.username || user?.email}
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: "14px", mb: 1.2, display: { xs: "none", md: "block" } }}>
        Роль: {user?.role || "customer"}
      </Typography>
      <Button variant="contained" onClick={onRefresh} disabled={isRefreshing} sx={{ bgcolor: "#fff", color: "#0f172a", textTransform: "none", borderRadius: "999px", fontWeight: 900, "&:hover": { bgcolor: "#e2e8f0" }, width: { xs: "100%", md: "auto" }, mt: { xs: 1, md: 0 } }}>
        {isRefreshing ? "Обновляем..." : "Обновить данные"}
      </Button>
    </Paper>
  );
}

export default AdminSidebar;
