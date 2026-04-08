import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import { useApp } from "../context/app-context";
import AdminSidebar from "./AdminSidebar";
import AdminUsersSection from "./AdminUsersSection";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminDeleteReview,
  adminDeleteUser,
  adminFetchOrders,
  adminFetchOverview,
  adminFetchProducts,
  adminFetchReviewReports,
  adminFetchUsers,
  adminUpdateOrderStatus,
  adminUpdateProduct,
  adminUpdateReviewReportStatus,
  adminUpdateUser,
} from "../lib/api";
import { formatCurrency } from "../lib/format";

const adminSections = [
  { key: "overview", label: "Обзор", icon: <SpaceDashboardOutlinedIcon /> },
  { key: "products", label: "Товары", icon: <Inventory2OutlinedIcon /> },
  { key: "orders", label: "Заказы", icon: <ShoppingBagOutlinedIcon /> },
  { key: "reports", label: "Модерация", icon: <OutlinedFlagIcon /> },
  { key: "users", label: "Пользователи", icon: <GroupOutlinedIcon /> },
];

const emptyProductForm = {
  name: "",
  category: "",
  brand: "",
  gender: "",
  price: "",
  oldPrice: "",
  rating: "",
  reviews: "",
  tag: "",
  stock: "",
  sizes: "",
  colors: "",
  image: "",
  description: "",
  is_featured: false,
  is_new: false,
};

const orderStatusOptions = [
  { value: "processing", label: "В обработке", color: "info" },
  { value: "shipped", label: "В пути", color: "warning" },
  { value: "delivered", label: "Доставлен", color: "success" },
];

function getOrderStatusMeta(status) {
  return orderStatusOptions.find((item) => item.value === status) || orderStatusOptions[0];
}

function getStockMeta(stockValue) {
  const stock = Number(stockValue || 0);

  if (stock <= 0) {
    return { label: "Нет в наличии", color: "error", tone: "#b91c1c", bg: "rgba(239,68,68,0.12)" };
  }

  if (stock <= 3) {
    return { label: `Мало на складе: ${stock}`, color: "warning", tone: "#b45309", bg: "rgba(245,158,11,0.12)" };
  }

  return { label: `В наличии: ${stock}`, color: "success", tone: "#15803d", bg: "rgba(34,197,94,0.12)" };
}

function AdminPage() {
  const { token, user } = useApp();
  const [activeSection, setActiveSection] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviewReports, setReviewReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [productStockFilter, setProductStockFilter] = useState("all");

  const stats = useMemo(
    () => [
      { label: "Товары", value: overview?.stats?.products ?? 0, icon: <Inventory2OutlinedIcon sx={{ color: "#0f449e" }} /> },
      { label: "Заказы", value: overview?.stats?.orders ?? 0, icon: <ShoppingBagOutlinedIcon sx={{ color: "#ea580c" }} /> },
      { label: "Жалобы", value: overview?.stats?.pendingReports ?? 0, icon: <OutlinedFlagIcon sx={{ color: "#b45309" }} /> },
      { label: "Пользователи", value: overview?.stats?.users ?? 0, icon: <StorefrontOutlinedIcon sx={{ color: "#7c3aed" }} /> },
      { label: "Выручка", value: formatCurrency(overview?.stats?.revenue ?? 0), icon: <LocalShippingOutlinedIcon sx={{ color: "#15803d" }} /> },
    ],
    [overview],
  );

  const sectionMeta = useMemo(
    () => ({
      overview: {
        title: "Обзор магазина",
        description: "Главные показатели и последние события по магазину в одном экране.",
      },
      products: {
        title: "Гибкое управление товарами",
        description: "Ищи, редактируй и пополняй каталог без лишних переходов.",
      },
      orders: {
        title: "Контроль заказов",
        description: "Следи за статусами и быстро обрабатывай поток заказов.",
      },
      reports: {
        title: "Модерация отзывов",
        description: "Разбирай жалобы, скрывай токсичные отзывы и держи витрину в порядке.",
      },
      users: {
        title: "Пользователи и роли",
        description: "Управляй доступом и быстро находи нужный аккаунт.",
      },
    }),
    [],
  );

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    const searchedProducts = !query
      ? products
      : products.filter((product) =>
      [product.name, product.brand, product.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );

    if (productStockFilter === "in_stock") {
      return searchedProducts.filter((product) => Number(product.stock || 0) > 3);
    }

    if (productStockFilter === "low_stock") {
      return searchedProducts.filter((product) => {
        const stock = Number(product.stock || 0);
        return stock > 0 && stock <= 3;
      });
    }

    if (productStockFilter === "out_of_stock") {
      return searchedProducts.filter((product) => Number(product.stock || 0) <= 0);
    }

    return searchedProducts;
  }, [productSearch, productStockFilter, products]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter((member) =>
      [member.username, member.email, member.phone, member.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [userSearch, users]);

  const filteredReports = useMemo(() => {
    const query = reportSearch.trim().toLowerCase();
    if (!query) {
      return reviewReports;
    }

    return reviewReports.filter((report) =>
      [report.productName, report.reviewAuthor, report.reportAuthor, report.reason, report.comment]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [reportSearch, reviewReports]);

  const loadAdminData = useCallback(async () => {
    const [overviewData, productsData, ordersData, usersData, reportsData] = await Promise.all([
      adminFetchOverview(token),
      adminFetchProducts(token),
      adminFetchOrders(token),
      adminFetchUsers(token),
      adminFetchReviewReports(token),
    ]);

    setOverview(overviewData);
    setProducts(Array.isArray(productsData) ? productsData : []);
    setOrders(Array.isArray(ordersData) ? ordersData : []);
    setUsers(Array.isArray(usersData) ? usersData : []);
    setReviewReports(Array.isArray(reportsData) ? reportsData : []);
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    loadAdminData()
      .catch((requestError) => {
        setError(requestError.message || "Не удалось загрузить админку");
      })
      .finally(() => setLoading(false));
  }, [loadAdminData, token]);

  const refreshAdminData = async () => {
    setIsRefreshing(true);
    setError("");

    try {
      await loadAdminData();
    } catch (requestError) {
      setError(requestError.message || "Не удалось обновить данные админки");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || "",
      category: product.category || "",
      brand: product.brand || "",
      gender: product.gender || "",
      price: product.price ?? "",
      oldPrice: product.oldPrice ?? "",
      rating: product.rating ?? "",
      reviews: product.reviews ?? "",
      tag: product.tag || "",
      stock: product.stock ?? "",
      sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : "",
      colors: Array.isArray(product.colors) ? product.colors.join(", ") : "",
      image: product.image || "",
      description: product.description || "",
      is_featured: Boolean(product.is_featured),
      is_new: Boolean(product.is_new),
    });
    setIsDialogOpen(true);
  };

  const handleProductFieldChange = (event) => {
    const { name, value } = event.target;
    setProductForm((current) => ({ ...current, [name]: value }));
  };

  const handleSaveProduct = async () => {
    setIsSavingProduct(true);
    setError("");

    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price || 0),
        oldPrice: productForm.oldPrice === "" ? null : Number(productForm.oldPrice),
        rating: Number(productForm.rating || 0),
        reviews: Number(productForm.reviews || 0),
        stock: Number(productForm.stock || 0),
      };

      if (editingProductId) {
        await adminUpdateProduct(token, editingProductId, payload);
      } else {
        await adminCreateProduct(token, payload);
      }

      setIsDialogOpen(false);
      await refreshAdminData();
    } catch (requestError) {
      setError(requestError.message || "Не удалось сохранить товар");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await adminDeleteProduct(token, productId);
      await refreshAdminData();
    } catch (requestError) {
      setError(requestError.message || "Не удалось удалить товар");
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      await adminUpdateOrderStatus(token, orderId, status);
      await refreshAdminData();
    } catch (requestError) {
      setError(requestError.message || "Не удалось обновить статус заказа");
    }
  };

  const handleReviewReportStatusChange = async (reportId, status) => {
    try {
      await adminUpdateReviewReportStatus(token, reportId, status);
      await refreshAdminData();
    } catch (requestError) {
      setError(requestError.message || "Не удалось обновить статус жалобы");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await adminDeleteReview(token, reviewId);
      await refreshAdminData();
    } catch (requestError) {
      setError(requestError.message || "Не удалось удалить отзыв");
    }
  };

  const handleUserRoleChange = async (member, role) => {
    try {
      await adminUpdateUser(token, member.id, {
        username: member.username,
        email: member.email,
        phone: member.phone,
        address: member.address,
        role,
      });
      await refreshAdminData();
    } catch (requestError) {
      setError(requestError.message || "Не удалось обновить пользователя");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await adminDeleteUser(token, userId);
      await refreshAdminData();
    } catch (requestError) {
      setError(requestError.message || "Не удалось удалить пользователя");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        background:
          "radial-gradient(circle at top left, rgba(96,165,250,0.16) 0%, transparent 24%), linear-gradient(180deg, #f7fbff 0%, #eef4fb 100%)",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12} lg={3.2}>
            <AdminSidebar
              sections={adminSections}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              onRefresh={refreshAdminData}
              isRefreshing={isRefreshing}
              user={user}
              adminEmail={overview?.adminCredentials?.email}
            />
          </Grid>

          <Grid item xs={12} lg={8.8}>
            <Stack spacing={3}>
              {error && <Alert severity="error" sx={{ borderRadius: "18px" }}>{error}</Alert>}

              <Grid container spacing={2.5}>
                {stats.map((item) => (
                  <Grid item xs={12} sm={6} xl={3} key={item.label}>
                    <Paper elevation={0} sx={{ p: 2.6, borderRadius: "24px", border: "1px solid rgba(148,163,184,0.14)", boxShadow: "0 20px 50px rgba(15,23,42,0.05)", background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography sx={{ color: "#94a3b8", fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", mb: 0.7 }}>
                            {item.label}
                          </Typography>
                          <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.9rem", letterSpacing: "-0.04em" }}>
                            {item.value}
                          </Typography>
                        </Box>
                        <Box sx={{ width: 52, height: 52, borderRadius: "16px", display: "grid", placeItems: "center", bgcolor: "#f8fafc" }}>
                          {item.icon}
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 2.4 },
                  borderRadius: "24px",
                  border: "1px solid rgba(148,163,184,0.14)",
                  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
                  boxShadow: "0 20px 50px rgba(15,23,42,0.04)",
                }}
              >
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography sx={{ color: "#94a3b8", fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", mb: 0.7 }}>
                      Current section
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: { xs: "1.4rem", md: "1.8rem" }, letterSpacing: "-0.04em", mb: 0.5 }}>
                      {sectionMeta[activeSection].title}
                    </Typography>
                    <Typography sx={{ color: "#64748b", maxWidth: 700 }}>
                      {sectionMeta[activeSection].description}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {adminSections.map((section) => (
                      <Chip
                        key={section.key}
                        icon={section.icon}
                        label={section.label}
                        onClick={() => setActiveSection(section.key)}
                        clickable
                        sx={{
                          borderRadius: "999px",
                          fontWeight: 800,
                          px: 0.8,
                          bgcolor: activeSection === section.key ? "#0f449e" : "#fff",
                          color: activeSection === section.key ? "#fff" : "#334155",
                          border: activeSection === section.key ? "none" : "1px solid rgba(148,163,184,0.18)",
                          "& .MuiChip-icon": {
                            color: activeSection === section.key ? "#fff" : "#64748b",
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: "30px", border: "1px solid rgba(148,163,184,0.14)", background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)" }}>
                {loading ? (
                  <Typography sx={{ color: "#64748b" }}>Загружаем админку...</Typography>
                ) : (
                  <>
                    {activeSection === "overview" && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} xl={7}>
                          <Paper elevation={0} sx={{ p: 3, borderRadius: "24px", border: "1px solid rgba(148,163,184,0.12)", bgcolor: "#fff" }}>
                            <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 2 }}>
                              Последние заказы
                            </Typography>
                            <Stack spacing={1.5}>
                              {(overview?.recentOrders || []).map((order) => {
                                const meta = getOrderStatusMeta(order.status);
                                return (
                                  <Box key={order.id} sx={{ p: 1.8, borderRadius: "18px", border: "1px solid rgba(148,163,184,0.12)", bgcolor: "#f8fbff" }}>
                                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                                      <Box>
                                        <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                                          {order.orderNumber}
                                        </Typography>
                                        <Typography sx={{ color: "#64748b", fontSize: "14px" }}>
                                          {order.customerName} · {order.customerEmail}
                                        </Typography>
                                      </Box>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography sx={{ fontWeight: 800, color: "#0f449e" }}>
                                          {formatCurrency(order.total)}
                                        </Typography>
                                        <Chip label={meta.label} color={meta.color} sx={{ fontWeight: 800, borderRadius: "999px" }} />
                                      </Stack>
                                    </Stack>
                                  </Box>
                                );
                              })}
                            </Stack>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} xl={5}>
                          <Paper elevation={0} sx={{ p: 3, borderRadius: "24px", border: "1px solid rgba(148,163,184,0.12)", bgcolor: "#fff", height: "100%" }}>
                            <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 2 }}>
                              Что уже есть
                            </Typography>
                            <Stack spacing={1.2}>
                              <Typography sx={{ color: "#475569" }}>Полноценный sidebar layout для админки.</Typography>
                              <Typography sx={{ color: "#475569" }}>Управление каталогом товаров с созданием и редактированием.</Typography>
                              <Typography sx={{ color: "#475569" }}>Контроль заказов и смена статусов.</Typography>
                              <Typography sx={{ color: "#475569" }}>Управление пользователями и ролями.</Typography>
                            </Stack>
                          </Paper>
                        </Grid>
                      </Grid>
                    )}

                    {activeSection === "products" && (
                      <Box>
                        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
                          <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.4rem" }}>
                            Каталог товаров
                          </Typography>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <TextField
                              size="small"
                              value={productSearch}
                              onChange={(event) => setProductSearch(event.target.value)}
                              placeholder="Поиск по товарам"
                              InputProps={{ startAdornment: <SearchIcon sx={{ color: "#94a3b8", mr: 1 }} /> }}
                              sx={{ minWidth: { sm: 260 }, "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "#fff" } }}
                            />
                            <FormControl size="small" sx={{ minWidth: 210 }}>
                              <InputLabel>Остатки</InputLabel>
                              <Select
                                label="Остатки"
                                value={productStockFilter}
                                onChange={(event) => setProductStockFilter(event.target.value)}
                                sx={{ borderRadius: "16px", bgcolor: "#fff" }}
                              >
                                <MenuItem value="all">Все товары</MenuItem>
                                <MenuItem value="in_stock">Только в наличии</MenuItem>
                                <MenuItem value="low_stock">Мало на складе</MenuItem>
                                <MenuItem value="out_of_stock">Нет в наличии</MenuItem>
                              </Select>
                            </FormControl>
                            <Button variant="contained" onClick={handleOpenCreateDialog} sx={{ bgcolor: "#0f449e", textTransform: "none", borderRadius: "999px", fontWeight: 800 }}>
                              Добавить товар
                            </Button>
                          </Stack>
                        </Stack>

                        <Stack spacing={1.6}>
                          {filteredProducts.length === 0 ? (
                            <Paper elevation={0} sx={{ p: 3, borderRadius: "24px", border: "1px solid rgba(148,163,184,0.12)", bgcolor: "#fff" }}>
                              <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.8 }}>
                                Ничего не нашли
                              </Typography>
                              <Typography sx={{ color: "#64748b", lineHeight: 1.7 }}>
                                Измени запрос поиска по названию, бренду или категории товара.
                              </Typography>
                            </Paper>
                          ) : filteredProducts.map((product) => {
                            const stockMeta = getStockMeta(product.stock);

                            return (
                            <Paper key={product.id} elevation={0} sx={{ p: 2.1, borderRadius: "22px", border: product.stock <= 0 ? "1px solid rgba(239,68,68,0.22)" : product.stock <= 3 ? "1px solid rgba(245,158,11,0.24)" : "1px solid rgba(148,163,184,0.12)", bgcolor: "#fff", boxShadow: product.stock <= 0 ? "0 16px 34px rgba(239,68,68,0.08)" : product.stock <= 3 ? "0 16px 34px rgba(245,158,11,0.08)" : "none" }}>
                              <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between">
                                <Stack direction="row" spacing={1.5}>
                                  <Box sx={{ width: 82, height: 82, borderRadius: "18px", bgcolor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                    {product.image ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <Typography sx={{ color: "#94a3b8", fontSize: "12px" }}>No image</Typography>}
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.4 }}>
                                      {product.name}
                                    </Typography>
                                    <Typography sx={{ color: "#64748b", fontSize: "14px", mb: 0.6 }}>
                                      {product.brand || "Без бренда"} · {product.category || "Без категории"} · остаток {product.stock}
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                      <Chip label={formatCurrency(product.price)} sx={{ fontWeight: 800, borderRadius: "999px" }} />
                                      <Chip label={stockMeta.label} sx={{ fontWeight: 900, borderRadius: "999px", color: stockMeta.tone, bgcolor: stockMeta.bg }} />
                                      {product.is_new && <Chip label="New" color="warning" sx={{ fontWeight: 800, borderRadius: "999px" }} />}
                                      {product.is_featured && <Chip label="Featured" color="success" sx={{ fontWeight: 800, borderRadius: "999px" }} />}
                                    </Stack>
                                  </Box>
                                </Stack>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ sm: "center" }}>
                                  <Button variant="outlined" onClick={() => handleOpenEditDialog(product)} sx={{ textTransform: "none", borderRadius: "999px", fontWeight: 800 }}>
                                    Редактировать
                                  </Button>
                                  <Button variant="outlined" color="error" onClick={() => handleDeleteProduct(product.id)} sx={{ textTransform: "none", borderRadius: "999px", fontWeight: 800 }}>
                                    Удалить
                                  </Button>
                                </Stack>
                              </Stack>
                            </Paper>
                          )})}
                        </Stack>
                      </Box>
                    )}

                    {activeSection === "orders" && (
                      <Stack spacing={1.6}>
                        {orders.map((order) => {
                          const meta = getOrderStatusMeta(order.status);
                          return (
                            <Paper key={order.id} elevation={0} sx={{ p: 2.2, borderRadius: "22px", border: "1px solid rgba(148,163,184,0.12)", bgcolor: "#fff" }}>
                              <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between">
                                <Box>
                                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.8 }}>
                                    <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                                      {order.orderNumber}
                                    </Typography>
                                    <Chip label={meta.label} color={meta.color} size="small" sx={{ fontWeight: 800, borderRadius: "999px" }} />
                                  </Stack>
                                  <Typography sx={{ color: "#64748b", fontSize: "14px", mb: 0.45 }}>
                                    {order.customerName} · {order.customerEmail}
                                  </Typography>
                                  <Typography sx={{ color: "#475569", fontSize: "14px" }}>
                                    {new Date(order.createdAt).toLocaleDateString("ru-RU")} · {order.totalItems} шт. · {formatCurrency(order.total)}
                                  </Typography>
                                </Box>

                                <FormControl size="small" sx={{ minWidth: 220 }}>
                                  <InputLabel>Статус заказа</InputLabel>
                                  <Select label="Статус заказа" value={order.status} onChange={(event) => handleOrderStatusChange(order.id, event.target.value)} sx={{ borderRadius: "16px", bgcolor: "#fff" }}>
                                    {orderStatusOptions.map((status) => (
                                      <MenuItem key={status.value} value={status.value}>
                                        {status.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Stack>

                              {order.items?.length > 0 && (
                                <>
                                  <Divider sx={{ my: 1.8 }} />
                                  <Stack spacing={1}>
                                    {order.items.map((item) => (
                                      <Stack key={item.id} direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                                        <Typography sx={{ color: "#0f172a", fontWeight: 700 }}>
                                          {item.name}
                                        </Typography>
                                        <Typography sx={{ color: "#64748b", fontSize: "14px" }}>
                                          {item.brand || "Без бренда"} · {item.size || "Без размера"} · {item.quantity} шт. · {formatCurrency(item.price)}
                                        </Typography>
                                      </Stack>
                                    ))}
                                  </Stack>
                                </>
                              )}
                            </Paper>
                          );
                        })}
                      </Stack>
                    )}

                    {activeSection === "reports" && (
                      <Box>
                        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
                          <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.4rem" }}>
                            Жалобы на отзывы
                          </Typography>
                          <TextField
                            size="small"
                            value={reportSearch}
                            onChange={(event) => setReportSearch(event.target.value)}
                            placeholder="Поиск по жалобам"
                            InputProps={{ startAdornment: <SearchIcon sx={{ color: "#94a3b8", mr: 1 }} /> }}
                            sx={{ minWidth: { sm: 280 }, "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "#fff" } }}
                          />
                        </Stack>

                        <Stack spacing={1.6}>
                          {filteredReports.length === 0 ? (
                            <Paper elevation={0} sx={{ p: 3, borderRadius: "24px", border: "1px solid rgba(148,163,184,0.12)", bgcolor: "#fff" }}>
                              <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.8 }}>
                                Жалоб пока нет
                              </Typography>
                              <Typography sx={{ color: "#64748b", lineHeight: 1.7 }}>
                                Здесь будут появляться жалобы пользователей на отзывы товаров.
                              </Typography>
                            </Paper>
                          ) : filteredReports.map((report) => (
                            <Paper key={report.id} elevation={0} sx={{ p: 2.2, borderRadius: "22px", border: "1px solid rgba(148,163,184,0.12)", bgcolor: "#fff" }}>
                              <Stack spacing={1.4}>
                                <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
                                  <Box>
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.8 }}>
                                      <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                                        {report.productName}
                                      </Typography>
                                      <Chip
                                        label={report.status === "pending" ? "Новая" : report.status === "reviewed" ? "Рассмотрена" : "Отклонена"}
                                        color={report.status === "pending" ? "warning" : report.status === "reviewed" ? "success" : "default"}
                                        size="small"
                                        sx={{ fontWeight: 800, borderRadius: "999px" }}
                                      />
                                    </Stack>
                                    <Typography sx={{ color: "#64748b", fontSize: "14px", mb: 0.45 }}>
                                      Автор отзыва: {report.reviewAuthor} · Жалобу отправил: {report.reportAuthor}
                                    </Typography>
                                    <Typography sx={{ color: "#475569", fontSize: "14px", mb: 0.45 }}>
                                      Причина: {report.reason}
                                    </Typography>
                                    <Typography sx={{ color: "#0f172a", fontSize: "14px", lineHeight: 1.75 }}>
                                      {report.comment}
                                    </Typography>
                                  </Box>

                                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                                    <FormControl size="small" sx={{ minWidth: 180 }}>
                                      <InputLabel>Статус жалобы</InputLabel>
                                      <Select
                                        label="Статус жалобы"
                                        value={report.status}
                                        onChange={(event) => handleReviewReportStatusChange(report.id, event.target.value)}
                                        sx={{ borderRadius: "16px", bgcolor: "#fff" }}
                                      >
                                        <MenuItem value="pending">Новая</MenuItem>
                                        <MenuItem value="reviewed">Рассмотрена</MenuItem>
                                        <MenuItem value="rejected">Отклонена</MenuItem>
                                      </Select>
                                    </FormControl>
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      onClick={() => handleDeleteReview(report.reviewId)}
                                      sx={{ textTransform: "none", borderRadius: "999px", fontWeight: 800 }}
                                    >
                                      Удалить отзыв
                                    </Button>
                                  </Stack>
                                </Stack>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {activeSection === "users" && (
                      <Box>
                        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
                          <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.4rem" }}>
                            Пользователи магазина
                          </Typography>
                          <TextField
                            size="small"
                            value={userSearch}
                            onChange={(event) => setUserSearch(event.target.value)}
                            placeholder="Поиск по пользователям"
                            InputProps={{ startAdornment: <SearchIcon sx={{ color: "#94a3b8", mr: 1 }} /> }}
                            sx={{ minWidth: { sm: 280 }, "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "#fff" } }}
                          />
                        </Stack>
                        <AdminUsersSection users={filteredUsers} onRoleChange={handleUserRoleChange} onDeleteUser={handleDeleteUser} />
                      </Box>
                    )}
                  </>
                )}
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 900 }}>
          {editingProductId ? "Редактировать товар" : "Новый товар"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField label="Название" name="name" value={productForm.name} onChange={handleProductFieldChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Бренд" name="brand" value={productForm.brand} onChange={handleProductFieldChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Категория" name="category" value={productForm.category} onChange={handleProductFieldChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Пол" name="gender" value={productForm.gender} onChange={handleProductFieldChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Тег" name="tag" value={productForm.tag} onChange={handleProductFieldChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Цена" name="price" type="number" value={productForm.price} onChange={handleProductFieldChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Старая цена" name="oldPrice" type="number" value={productForm.oldPrice} onChange={handleProductFieldChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Рейтинг" name="rating" type="number" value={productForm.rating} onChange={handleProductFieldChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Отзывы" name="reviews" type="number" value={productForm.reviews} onChange={handleProductFieldChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Остаток" name="stock" type="number" value={productForm.stock} onChange={handleProductFieldChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Размеры" name="sizes" value={productForm.sizes} onChange={handleProductFieldChange} helperText="Через запятую" fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Цвета" name="colors" value={productForm.colors} onChange={handleProductFieldChange} helperText="Через запятую" fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="URL изображения" name="image" value={productForm.image} onChange={handleProductFieldChange} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Описание" name="description" value={productForm.description} onChange={handleProductFieldChange} multiline rows={4} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Показывать в featured</InputLabel>
                <Select label="Показывать в featured" name="is_featured" value={String(productForm.is_featured)} onChange={(event) => setProductForm((current) => ({ ...current, is_featured: event.target.value === "true" }))}>
                  <MenuItem value="false">Нет</MenuItem>
                  <MenuItem value="true">Да</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Новинка</InputLabel>
                <Select label="Новинка" name="is_new" value={String(productForm.is_new)} onChange={(event) => setProductForm((current) => ({ ...current, is_new: event.target.value === "true" }))}>
                  <MenuItem value="false">Нет</MenuItem>
                  <MenuItem value="true">Да</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsDialogOpen(false)} sx={{ textTransform: "none", fontWeight: 800 }}>
            Отмена
          </Button>
          <Button onClick={handleSaveProduct} variant="contained" disabled={isSavingProduct} sx={{ bgcolor: "#0f449e", textTransform: "none", borderRadius: "999px", fontWeight: 800 }}>
            {isSavingProduct ? "Сохраняем..." : "Сохранить"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPage;
