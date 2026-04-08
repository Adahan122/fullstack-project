import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useNavigate } from "react-router-dom";

import { useApp } from "../context/app-context";
import { fetchOrders } from "../lib/api";
import { formatCurrency } from "../lib/format";

const statusMeta = {
  processing: {
    label: "В обработке",
    color: "info",
    icon: <ShoppingBagOutlinedIcon sx={{ color: "#2563eb" }} />,
  },
  shipped: {
    label: "В пути",
    color: "warning",
    icon: <LocalShippingOutlinedIcon sx={{ color: "#f59e0b" }} />,
  },
  delivered: {
    label: "Доставлен",
    color: "success",
    icon: <CheckCircleOutlineIcon sx={{ color: "#16a34a" }} />,
  },
};

function OrdersPage() {
  const navigate = useNavigate();
  const { token } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders(token)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [token]);

  const normalizedOrders = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        ...statusMeta[order.status],
      })),
    [orders],
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        background:
          "radial-gradient(circle at top left, rgba(96,165,250,0.16) 0%, transparent 26%), linear-gradient(180deg, #f7fbff 0%, #eef4fb 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/profile")} sx={{ color: "#0f449e", textTransform: "none", fontWeight: 800, mb: 3 }}>
          Назад в профиль
        </Button>

        <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", mb: 1, letterSpacing: "-0.04em" }}>
          Мои заказы
        </Typography>
        <Typography sx={{ color: "#64748b", mb: 4 }}>
          Здесь хранится реальная история оформленных заказов по твоему аккаунту.
        </Typography>

        {loading ? (
          <Box sx={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress sx={{ color: "#0f449e" }} />
          </Box>
        ) : error ? (
          <Paper elevation={0} sx={{ p: 4, borderRadius: "24px", border: "1px solid rgba(239,68,68,0.12)", bgcolor: "#fff5f5" }}>
            <Typography sx={{ fontWeight: 800, color: "#dc2626", mb: 0.5 }}>Не удалось загрузить заказы</Typography>
            <Typography sx={{ color: "#64748b" }}>{error}</Typography>
          </Paper>
        ) : normalizedOrders.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: "24px", border: "1px solid rgba(148,163,184,0.14)", background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)" }}>
            <ShoppingBagOutlinedIcon sx={{ fontSize: 60, color: "#cbd5e1", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#0f172a", fontWeight: 900, mb: 1 }}>
              У тебя пока нет оформленных заказов
            </Typography>
            <Typography sx={{ color: "#64748b", mb: 2 }}>
              Добавь товары в корзину и оформи первую покупку.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/")} sx={{ bgcolor: "#0f449e", textTransform: "none", borderRadius: "999px", fontWeight: 900, px: 3 }}>
              Перейти к покупкам
            </Button>
          </Paper>
        ) : (
          <Box>
            {normalizedOrders.map((order) => (
              <Accordion key={order.id} elevation={0} sx={{ border: "1px solid rgba(148,163,184,0.14)", borderRadius: "24px !important", mb: 2, overflow: "hidden", background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)", boxShadow: "0 16px 40px rgba(15,23,42,0.05)", "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: { xs: "1fr", md: "80px 1.5fr 1fr 1fr" }, gap: 2, alignItems: "center", py: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "center" } }}>{order.icon}</Box>
                    <Box>
                      <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>Заказ {order.orderNumber}</Typography>
                      <Typography sx={{ color: "#64748b", fontSize: "13px" }}>
                        {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: "#94a3b8", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                        Сумма
                      </Typography>
                      <Typography sx={{ fontWeight: 900, color: "#0f449e" }}>
                        {formatCurrency(order.total)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                      <Chip label={order.label} color={order.color} sx={{ fontWeight: 900, borderRadius: "999px" }} />
                    </Box>
                  </Box>
                </AccordionSummary>

                <Divider />

                <AccordionDetails sx={{ p: 3, bgcolor: "rgba(248,250,252,0.72)" }}>
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 1.5 }}>
                    Состав заказа
                  </Typography>
                  <List disablePadding>
                    {order.items.map((item) => (
                      <ListItem key={item.id} sx={{ px: 0, py: 2, borderBottom: "1px solid rgba(148,163,184,0.12)", "&:last-child": { borderBottom: "none" } }}>
                        <Box sx={{ width: 68, height: 68, bgcolor: "#fff", border: "1px solid rgba(148,163,184,0.12)", borderRadius: "16px", mr: 2, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </Box>
                        <ListItemText
                          disableTypography
                          primary={<Typography sx={{ fontWeight: 800, color: "#0f172a" }}>{item.name}</Typography>}
                          secondary={
                            <Box component="span" sx={{ display: "flex", gap: 2, mt: 0.5, flexWrap: "wrap" }}>
                              {item.brand && <Typography component="span" variant="caption" sx={{ color: "#64748b" }}>Бренд: <b>{item.brand}</b></Typography>}
                              {item.size && <Typography component="span" variant="caption" sx={{ color: "#64748b" }}>Размер: <b>{item.size}</b></Typography>}
                              <Typography component="span" variant="caption" sx={{ color: "#64748b" }}>Кол-во: <b>{item.quantity} шт.</b></Typography>
                            </Box>
                          }
                        />
                        <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                          {formatCurrency(item.price)}
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
    </Box>
  );
}

export default OrdersPage;
