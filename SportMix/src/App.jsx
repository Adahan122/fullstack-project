import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import FavoritesPage from "./components/FavoritesPage";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import AdminPage from "./components/AdminPage";
import OrdersPage from "./components/OrdersPage";
import ProductPage from "./components/ProductPage";
import ProfilePage from "./components/ProfilePage";
import RegisterPage from "./components/RegisterPage";
import AuthRequiredDialog from "./components/AuthRequiredDialog";
import { AppProvider } from "./context/AppProvider";
import { useApp } from "./context/app-context";

function AppRoutes() {
  const { user } = useApp();
  const isAdmin = user?.role === "admin";

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
        <Route path="/orders" element={user ? <OrdersPage /> : <Navigate to="/login" replace />} />
        <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to={user ? "/" : "/login"} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
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
