import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import TelegramIcon from "@mui/icons-material/Telegram";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";

import { useApp } from "../context/app-context";

const serviceLinks = [
  { label: "Доставка и оплата", slug: "delivery" },
  { label: "Оплата", slug: "payment" },
  { label: "Возврат и обмен", slug: "returns" },
  { label: "Контакты", slug: "contacts" },
];

const categoryLinks = [
  { label: "Обувь", category: "Shoes" },
  { label: "Одежда", category: "Clothes" },
  { label: "Сумки и аксессуары", category: "Bags" },
  { label: "Новинки", category: "New" },
  { label: "Скидки", category: "Sale" },
];

const socialLinks = [
  { icon: <FacebookIcon sx={{ fontSize: 20 }} />, href: "https://facebook.com", label: "Facebook" },
  { icon: <InstagramIcon sx={{ fontSize: 20 }} />, href: "https://instagram.com", label: "Instagram" },
  { icon: <TelegramIcon sx={{ fontSize: 20 }} />, href: "https://t.me", label: "Telegram" },
];

const footerFieldStyles = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: 2.5,
    bgcolor: "rgba(255,255,255,0.04)",
    "& fieldset": {
      borderColor: "rgba(148,163,184,0.28)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255,255,255,0.4)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#60A5FA",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#94A3B8",
  },
};

function Footer() {
  const navigate = useNavigate();
  const { user, showToast } = useApp();
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    topic: "",
    message: "",
  });

  const handleCategoryNavigate = (category) => {
    navigate(category ? `/?category=${encodeURIComponent(category)}` : "/");
  };

  const handleInputChange = (field) => (event) => {
    setFormData((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      topic: formData.topic.trim(),
      message: formData.message.trim(),
    };

    if (payload.name.length < 2) {
      setFormError("Укажите имя, чтобы менеджер понял, как к вам обращаться.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setFormError("Укажите корректный email для обратной связи.");
      return;
    }

    if (payload.message.length < 10) {
      setFormError("Сообщение должно быть не короче 10 символов.");
      return;
    }

    const subject = payload.topic || "Сообщение для менеджера SPORTMIX";
    const body = [
      `Имя: ${payload.name}`,
      `Email: ${payload.email}`,
      "",
      payload.message,
    ].join("\n");

    window.location.href = `mailto:manager@sportmix.store?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    showToast?.("Открыли письмо для менеджера", "success");
    setFormData((current) => ({
      ...current,
      topic: "",
      message: "",
    }));
  };

  return (
    <Box
      sx={{
        bgcolor: "#0F172A",
        color: "#fff",
        pt: { xs: 6, md: 8 },
        pb: 4,
        mt: "auto",
        borderTop: "4px solid #0f449e",
        backgroundImage:
          "radial-gradient(circle at top left, rgba(15, 68, 158, 0.28), transparent 32%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.2), transparent 26%)",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid item xs={12} lg={4}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                mb: 2,
                letterSpacing: "0.05em",
                fontFamily: '"Montserrat", sans-serif',
                textTransform: "uppercase",
              }}
            >
              SPORT<span style={{ color: "#0f449e" }}>MIX</span>
            </Typography>

            <Typography variant="body2" sx={{ color: "#94A3B8", mb: 3, lineHeight: 1.8, maxWidth: 420 }}>
              Уже не просто витрина: внизу теперь есть настоящие сервисные разделы, контакты и путь к поддержке, как у полноценного интернет-магазина.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 3 }}>
              <Card sx={{ flex: 1, bgcolor: "rgba(255,255,255,0.04)", color: "#fff", borderRadius: 3 }}>
                <CardContent sx={{ p: 2.25 }}>
                  <WorkspacePremiumOutlinedIcon sx={{ color: "#60A5FA", mb: 1 }} />
                  <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Сервисные страницы</Typography>
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                    Доставка, оплата, возврат и контакты теперь доступны отдельными маршрутами.
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, bgcolor: "rgba(255,255,255,0.04)", color: "#fff", borderRadius: 3 }}>
                <CardContent sx={{ p: 2.25 }}>
                  <SupportAgentOutlinedIcon sx={{ color: "#60A5FA", mb: 1 }} />
                  <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Связь с поддержкой</Typography>
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                    Форма открывает готовое письмо менеджеру по заказу, размеру или наличию.
                  </Typography>
                </CardContent>
              </Card>
            </Stack>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              {socialLinks.map((item) => (
                <IconButton
                  key={item.label}
                  component="a"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  sx={{
                    color: "#94A3B8",
                    bgcolor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    p: 1.2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#fff",
                      bgcolor: "#0f449e",
                      borderColor: "#0f449e",
                      transform: "translateY(-3px)",
                      boxShadow: "0 4px 12px rgba(15, 68, 158, 0.3)",
                    },
                  }}
                >
                  {item.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} lg={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2.5, color: "#fff" }}>
              Покупателям
            </Typography>
            <Stack spacing={1.25}>
              {serviceLinks.map((item) => (
                <Button
                  key={item.slug}
                  variant="text"
                  onClick={() => navigate(`/service/${item.slug}`)}
                  endIcon={<ArrowOutwardIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    justifyContent: "flex-start",
                    color: "#94A3B8",
                    px: 0,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": { color: "#fff", bgcolor: "transparent" },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} lg={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2.5, color: "#fff" }}>
              Каталог
            </Typography>
            <Stack spacing={1.25}>
              {categoryLinks.map((item) => (
                <Button
                  key={item.label}
                  variant="text"
                  onClick={() => handleCategoryNavigate(item.category)}
                  sx={{
                    justifyContent: "flex-start",
                    color: "#94A3B8",
                    px: 0,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": { color: "#fff", bgcolor: "transparent" },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Card sx={{ mt: 3, borderRadius: 3, bgcolor: "rgba(15,68,158,0.18)", color: "#fff" }}>
              <CardContent sx={{ p: 2.25 }}>
                <LocalShippingOutlinedIcon sx={{ color: "#93C5FD", mb: 1 }} />
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Готово к росту</Typography>
                <Typography variant="body2" sx={{ color: "#BFDBFE", lineHeight: 1.6 }}>
                  Отсюда уже удобно развивать акции, бренды, SEO-разделы и поддержку после покупки.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2.5, color: "#fff" }}>
              Написать менеджеру
            </Typography>

            <Stack spacing={1} sx={{ mb: 2.5 }}>
              <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                Телефон: <Link href="tel:+79998887766" sx={{ color: "#fff", textDecoration: "none", fontWeight: 700 }}>+7 (999) 888-77-66</Link>
              </Typography>
              <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                Email: <Link href="mailto:manager@sportmix.store" sx={{ color: "#fff", textDecoration: "none", fontWeight: 700 }}>manager@sportmix.store</Link>
              </Typography>
              <Typography variant="body2" sx={{ color: "#94A3B8", lineHeight: 1.6 }}>
                По форме ниже откроется готовое письмо менеджеру с вашим текстом.
              </Typography>
            </Stack>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 1.5 }}>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Ваше имя"
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={footerFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={footerFieldStyles}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Тема"
                    value={formData.topic}
                    onChange={handleInputChange("topic")}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={footerFieldStyles}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Сообщение"
                value={formData.message}
                onChange={handleInputChange("message")}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={footerFieldStyles}
              />

              {formError ? <Alert severity="error">{formError}</Alert> : null}

              <Button
                type="submit"
                variant="contained"
                endIcon={<SendRoundedIcon />}
                sx={{
                  alignSelf: "flex-start",
                  borderRadius: "999px",
                  px: 3,
                  py: 1.1,
                  fontWeight: 800,
                  bgcolor: "#0f449e",
                  "&:hover": { bgcolor: "#0b3376" },
                }}
              >
                Написать менеджеру
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            mt: 6,
            pt: 3,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.8rem", fontWeight: 500 }}>
            © {new Date().getFullYear()} SPORTMIX. Все права защищены.
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.8rem", fontWeight: 500 }}>
            Отдельные сервисные страницы и полноценный checkout уже встроены в маршрут магазина.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
