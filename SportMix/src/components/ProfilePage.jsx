import { useEffect, useMemo, useRef, useState } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useNavigate } from "react-router-dom";

import { useApp } from "../context/app-context";
import { fetchOrders, fetchProfile, updateProfile } from "../lib/api";
import { formatCurrency } from "../lib/format";

const emptyProfile = {
  username: "",
  email: "",
  phone: "",
  address: "",
  avatar: "",
  banner: "",
};

const statusMeta = {
  processing: {
    label: "В обработке",
    color: "info",
    icon: <ShoppingBagOutlinedIcon />,
  },
  shipped: {
    label: "В пути",
    color: "warning",
    icon: <LocalShippingOutlinedIcon />,
  },
  delivered: {
    label: "Доставлен",
    color: "success",
    icon: <CheckCircleOutlineIcon />,
  },
};

function ProfilePage() {
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const { setUser, token, user } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({
    ...emptyProfile,
    username: user?.username || "",
    email: user?.email || "",
  });
  const [bannerPreview, setBannerPreview] = useState(
    "linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(15,68,158,0.90) 48%, rgba(37,99,235,0.82) 100%)",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchProfile(token)
      .then((data) => {
        const nextProfile = {
          username: data.username || user?.username || "",
          email: data.email || user?.email || "",
          phone: data.phone || "",
          address: data.address || "",
          avatar: data.avatar || "",
          banner: data.banner || "",
        };

        setProfile(nextProfile);
        if (nextProfile.banner) {
          setBannerPreview(nextProfile.banner);
        }
      })
      .catch((error) => {
        console.error("Ошибка загрузки профиля:", error);
      });
  }, [token, user?.email, user?.username]);

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchOrders(token)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Ошибка загрузки заказов:", error);
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
        banner: profile.banner || bannerPreview,
      });

      setProfile({
        username: savedProfile.username || "",
        email: savedProfile.email || "",
        phone: savedProfile.phone || "",
        address: savedProfile.address || "",
        avatar: savedProfile.avatar || "",
        banner: savedProfile.banner || "",
      });
      setUser((currentUser) => ({
        ...(currentUser || {}),
        username: savedProfile.username,
        email: savedProfile.email,
      }));
      if (savedProfile.banner) {
        setBannerPreview(savedProfile.banner);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка сохранения профиля:", error);
      alert(error.message || "Не удалось сохранить профиль");
    }
  };

  const readImageFile = (file, onLoad) => {
    if (!file || !file.type.startsWith("image/")) {
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

  const handleBannerChange = (event) => {
    readImageFile(event.target.files?.[0], (result) => {
      setBannerPreview(`url(${result})`);
      setProfile((currentProfile) => ({ ...currentProfile, banner: `url(${result})` }));
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        background:
          "radial-gradient(circle at top left, rgba(96,165,250,0.16) 0%, transparent 26%), linear-gradient(180deg, #f7fbff 0%, #eef4fb 100%)",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            minHeight: 280,
            background: profile.banner || bannerPreview,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "36px",
            position: "relative",
            mb: -12,
            overflow: "hidden",
            p: { xs: 2.5, md: 4 },
            boxShadow: "0 30px 80px rgba(15,23,42,0.18)",
          }}
        >
          <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0.10) 0%, rgba(15,23,42,0.34) 100%)" }} />

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ position: "relative", zIndex: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/")}
              sx={{
                color: "#fff",
                textTransform: "none",
                fontWeight: 800,
                bgcolor: "rgba(255, 255, 255, 0.14)",
                backdropFilter: "blur(8px)",
                borderRadius: "16px",
                px: 2.4,
                py: 1.1,
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.22)" },
              }}
            >
              На главную
            </Button>

            <Tooltip title="Изменить обложку профиля" arrow placement="left">
              <Button
                onClick={() => bannerInputRef.current?.click()}
                startIcon={<PhotoCameraIcon />}
                sx={{
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "rgba(15, 23, 42, 0.34)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "16px",
                  px: 2.2,
                  py: 1,
                  "&:hover": { bgcolor: "rgba(15, 23, 42, 0.48)" },
                }}
              >
                Изменить фон
              </Button>
            </Tooltip>
          </Stack>

          <Box sx={{ position: "relative", zIndex: 1, mt: { xs: 6, md: 10 }, maxWidth: 580 }}>
            <Typography sx={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.66)", mb: 1 }}>
              Профиль
            </Typography>
            <Typography sx={{ fontWeight: 900, color: "#fff", fontSize: { xs: "2rem", md: "3.2rem" }, letterSpacing: "-0.06em", lineHeight: 0.95, fontFamily: '"Montserrat", sans-serif', mb: 1.3 }}>
              Управляй
              <br />
              своим стилем
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.8, maxWidth: 460 }}>
              Данные аккаунта, доставка и последние заказы теперь собраны в одном сильном и аккуратном пространстве.
            </Typography>
          </Box>

          <input type="file" ref={bannerInputRef} style={{ display: "none" }} accept="image/*" onChange={handleBannerChange} />
        </Box>

        <Grid container spacing={4} sx={{ position: "relative", zIndex: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "32px",
                textAlign: "center",
                bgcolor: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(148,163,184,0.14)",
                boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
              }}
            >
              <Box onClick={() => avatarInputRef.current?.click()} sx={{ position: "relative", width: 136, height: 136, mx: "auto", mb: 3, cursor: "pointer" }}>
                <Avatar src={profile.avatar} sx={{ width: "100%", height: "100%", bgcolor: "#0f449e", fontSize: "3.8rem", border: "6px solid #fff", boxShadow: "0 20px 36px rgba(15,23,42,0.16)" }}>
                  {!profile.avatar && (profile.username ? profile.username.charAt(0) : "U")}
                </Avatar>
                <Box sx={{ position: "absolute", inset: 0, borderRadius: "50%", bgcolor: "rgba(15,23,42,0.34)", display: "grid", placeItems: "center", color: "#fff", opacity: 0, transition: "opacity 0.24s ease", "&:hover": { opacity: 1 } }}>
                  <PhotoCameraIcon sx={{ fontSize: "2rem" }} />
                </Box>
              </Box>

              <input type="file" ref={avatarInputRef} style={{ display: "none" }} accept="image/*" onChange={handleAvatarChange} />

              {!isEditing ? (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5, letterSpacing: "-0.03em" }}>
                    {profile.username || "Без имени"}
                  </Typography>
                  <Typography sx={{ color: "#0f449e", fontWeight: 700, mb: 2.5 }}>
                    {profile.email || "Email не указан"}
                  </Typography>
                </>
              ) : (
                <Box sx={{ mb: 3 }}>
                  <TextField fullWidth label="Имя" name="username" value={profile.username} onChange={handleChange} size="small" sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "#fff" } }} />
                  <TextField fullWidth label="Email" name="email" value={profile.email} onChange={handleChange} size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "#fff" } }} />
                </Box>
              )}

              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                <Chip label="Premium profile" sx={{ bgcolor: "#eff6ff", color: "#0f449e", fontWeight: 800 }} />
                <Chip label="Sport member" sx={{ bgcolor: "#f8fafc", color: "#334155", fontWeight: 800 }} />
              </Stack>

              <Button
                variant="contained"
                startIcon={isEditing ? <SaveOutlinedIcon /> : <EditOutlinedIcon />}
                fullWidth
                sx={{ bgcolor: isEditing ? "#15803d" : "#0f449e", color: "#fff", textTransform: "none", fontWeight: 900, borderRadius: "18px", py: 1.55, fontSize: "1rem", boxShadow: isEditing ? "0 18px 32px rgba(21,128,61,0.22)" : "0 18px 32px rgba(15,68,158,0.22)", "&:hover": { bgcolor: isEditing ? "#166534" : "#0b3376" } }}
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? "Сохранить профиль" : "Редактировать профиль"}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "32px", mb: 4, border: "1px solid rgba(148,163,184,0.14)", boxShadow: "0 24px 60px rgba(15,23,42,0.08)", background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                <Avatar sx={{ bgcolor: "#e0f2fe", color: "#0f449e" }}><PersonOutlineIcon /></Avatar>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>
                  Личные данные
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <Typography sx={{ color: "#94a3b8", fontWeight: 800, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", mb: 0.6 }}>
                    Телефон
                  </Typography>
                  {!isEditing ? (
                    <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#0f172a" }}>
                      {profile.phone || "Не указан"}
                    </Typography>
                  ) : (
                    <TextField fullWidth name="phone" value={profile.phone} onChange={handleChange} size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "#fff" } }} />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography sx={{ color: "#94a3b8", fontWeight: 800, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", mb: 0.6 }}>
                    Статус
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#0f172a" }}>
                    Активный покупатель
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "32px", mb: 4, border: "1px solid rgba(148,163,184,0.14)", boxShadow: "0 24px 60px rgba(15,23,42,0.08)", background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                <Avatar sx={{ bgcolor: "#dcfce7", color: "#15803d" }}><LocationOnOutlinedIcon /></Avatar>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>
                  Адрес доставки
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              {!isEditing ? (
                <Typography sx={{ color: "#334155", bgcolor: "#fff", p: 2.2, borderRadius: "20px", border: "1px solid rgba(148,163,184,0.12)", lineHeight: 1.8 }}>
                  {profile.address || "Не указан"}
                </Typography>
              ) : (
                <TextField fullWidth name="address" value={profile.address} onChange={handleChange} size="small" multiline rows={3} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "#fff" } }} />
              )}
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "32px", border: "1px solid rgba(148,163,184,0.14)", boxShadow: "0 24px 60px rgba(15,23,42,0.08)", background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                <Avatar sx={{ bgcolor: "#fff7ed", color: "#ea580c" }}><ShoppingBagOutlinedIcon /></Avatar>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>
                  Последние заказы
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              {recentOrders.length === 0 ? (
                <Box sx={{ bgcolor: "#fff", border: "1px solid rgba(148,163,184,0.12)", borderRadius: "20px", p: 2.4 }}>
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 0.6 }}>
                    Пока нет оформленных заказов
                  </Typography>
                  <Typography sx={{ color: "#64748b", lineHeight: 1.7 }}>
                    Как только оформите покупку, здесь появятся последние заказы и их статусы: в обработке, в пути или доставлен.
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {recentOrders.map((order) => (
                    <ListItem key={order.id} sx={{ px: 0, py: 2.2, borderBottom: "1px solid rgba(148,163,184,0.12)", "&:last-child": { borderBottom: "none" }, cursor: "pointer" }} onClick={() => navigate("/orders")}>
                      <ListItemText
                        disableTypography
                        primary={<Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.05rem" }}>Заказ {order.orderNumber}</Typography>}
                        secondary={<Typography component="span" sx={{ color: "#64748b", mt: 0.4, display: "block" }}>Дата: {new Date(order.createdAt).toLocaleDateString("ru-RU")} | Сумма: {formatCurrency(order.total)}</Typography>}
                      />
                      <Tooltip title={`Статус: ${order.label}`} arrow>
                        <Chip icon={order.icon} label={order.label} color={order.color} size="medium" sx={{ fontWeight: 900, borderRadius: "999px", px: 0.6 }} />
                      </Tooltip>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ProfilePage;
