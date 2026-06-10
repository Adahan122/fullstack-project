import { lazy, Suspense } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./components/HomePage";
import MobileBottomNav from "./components/MobileBottomNav";
import AuthRequiredDialog from "./components/AuthRequiredDialog";
import { AppProvider } from "./context/AppProvider";
import { useApp } from "./context/app-context";

const FavoritesPage = lazy(() => import("./components/FavoritesPage"));
const LoginPage = lazy(() => import("./components/LoginPage"));
const AdminPage = lazy(() => import("./components/AdminPage"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));
const OrdersPage = lazy(() => import("./components/OrdersPage"));
const ProductPage = lazy(() => import("./components/ProductPage"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const RegisterPage = lazy(() => import("./components/RegisterPage"));
const ServicePage = lazy(() => import("./components/ServicePage"));

function RouteFallback() {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "grid",
        placeItems: "center",
        bgcolor: "#ffffff",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress size={44} thickness={4.2} sx={{ color: "#0f449e", mb: 2 }} />
        <Box sx={{ color: "#0f172a", fontWeight: 800, letterSpacing: "0.08em" }}>SPORTMIX</Box>
      </Box>
    </Box>
  );
}

function AppRoutes() {
  const { user } = useApp();
  const isAdmin = user?.role === "admin";

  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/checkout" element={user ? <CheckoutPage /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/orders" element={user ? <OrdersPage /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to={user ? "/" : "/login"} replace />} />
          <Route path="/service/:slug" element={<ServicePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Suspense>
      <MobileBottomNav />
      <AuthRequiredDialog />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
