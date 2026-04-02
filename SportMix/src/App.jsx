import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import HomePage from "./components/HomePage";
import ProductPage from "./components/ProductPage";
import FavoritesPage from "./components/FavoritesPage"; 
import ProfilePage from "./components/ProfilePage";
import OrdersPage from "./components/OrdersPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";

export const CartContext = createContext();

function App() {
  // --- СОСТОЯНИЕ КОРЗИНЫ ---
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
      console.error("Ошибка при чтении cart из localStorage:", error);
      return []; 
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // --- СОСТОЯНИЕ АВТОРИЗАЦИИ ---
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });

  // --- СОСТОЯНИЕ МОДАЛЬНОГО ОКНА ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // --- ДОБАВЛЕНИЕ В КОРЗИНУ (С жесткой блокировкой) ---
  const addToCart = (product, size = null) => {
    // 1. ЖЕСТКИЙ БАН: Если юзера нет, открываем модалку и НАМЕРТВО стопим функцию
    if (!user) {
      setIsAuthModalOpen(true);
      return false; // <--- ВОЗВРАЩАЕМ false (товар НЕ добавлен)
    }

    // 2. Код ниже сработает, только если условие выше не выполнилось (юзер вошел)
    setCart((prevCart) => {
      const targetSize = size || product.selectedSize || null;
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.selectedSize === targetSize
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && item.selectedSize === targetSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevCart, { ...product, selectedSize: targetSize, quantity: 1 }];
    });

    return true; // <--- ВОЗВРАЩАЕМ true (товар успешно добавлен!)
  };

  const removeFromCart = (productId, size = null) => {
    setCart((prevCart) => 
      prevCart.filter((item) => !(item.id === productId && item.selectedSize === size))
    );
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage user={user} onLogout={logout} />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/favorites" element={<FavoritesPage />} /> 
          
          {/* Страницы профиля и заказов защищены редиректом */}
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/orders" element={user ? <OrdersPage /> : <Navigate to="/login" />} />
          
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
        </Routes>
      </Router>

      {/* ============================================================ */}
      {/* ГЛОБАЛЬНОЕ ОКНО ТРЕБОВАНИЯ АВТОРИЗАЦИИ */}
      {/* ============================================================ */}
      <Dialog 
        open={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        PaperProps={{
          sx: { borderRadius: '16px', p: 2, maxWidth: '400px' }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
          <Box sx={{ 
            display: 'inline-flex', 
            bgcolor: '#fff3e0', 
            color: '#ff9800', 
            p: 1.5, 
            borderRadius: '50%',
            mb: 2 
          }}>
            <LockOutlinedIcon sx={{ fontSize: 30 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A202C' }}>
            Требуется авторизация
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: '#718096', mt: 1 }}>
            Чтобы добавлять товары в корзину и совершать покупки, пожалуйста, войдите в свой аккаунт.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 2 }}>
          <Button 
            variant="contained" 
            fullWidth
            href="/login"
            sx={{ 
              bgcolor: '#0f449e', 
              borderRadius: '50px', 
              fontWeight: 'bold',
              py: 1.2,
              '&:hover': { bgcolor: '#0b3376' }
            }}
          >
            Войти
          </Button>
          <Button 
            variant="text" 
            fullWidth
            href="/register"
            sx={{ color: '#718096', fontWeight: '600', textTransform: 'none' }}
          >
            Ещё нет аккаунта? Зарегистрироваться
          </Button>
          <Button 
            variant="standard" 
            fullWidth
            onClick={() => setIsAuthModalOpen(false)}
            sx={{ color: '#A0AEC0', textTransform: 'none', fontSize: '0.9rem' }}
          >
            Продолжить просмотр
          </Button>
        </DialogActions>
      </Dialog>
    </CartContext.Provider>
  );
}

export default App;