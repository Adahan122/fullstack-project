import { useEffect, useState } from "react";

import { AppContext } from "./app-context";
import {
  removeStoredValue,
  readJson,
  readString,
  storageKeys,
  writeJson,
  writeString,
} from "../lib/storage";
import { createOrder } from "../lib/api";

function getInitialCart() {
  const cart = readJson(storageKeys.cart, []);
  return Array.isArray(cart) ? cart : [];
}

function getInitialFavorites() {
  const favorites = readJson(storageKeys.favorites, []);
  return Array.isArray(favorites) ? favorites : [];
}

function getInitialUser() {
  return readJson(storageKeys.user, null);
}

function getInitialToken() {
  return readString(storageKeys.token, "");
}

export function AppProvider({ children }) {
  const [cart, setCart] = useState(getInitialCart);
  const [favorites, setFavorites] = useState(getInitialFavorites);
  const [user, setUser] = useState(getInitialUser);
  const [token, setToken] = useState(getInitialToken);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hasSeenAuthPrompt, setHasSeenAuthPrompt] = useState(
    readString(storageKeys.authPromptSeen, "") === "true",
  );
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    writeJson(storageKeys.cart, cart);
  }, [cart]);

  useEffect(() => {
    writeJson(storageKeys.favorites, favorites);
  }, [favorites]);

  useEffect(() => {
    if (user) {
      writeJson(storageKeys.user, user);
    } else {
      removeStoredValue(storageKeys.user);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      writeString(storageKeys.token, token);
    } else {
      removeStoredValue(storageKeys.token);
    }
  }, [token]);

  const requireAuth = () => {
    setIsAuthModalOpen(true);
    return false;
  };

  const markAuthPromptSeen = () => {
    writeString(storageKeys.authPromptSeen, "true");
    setHasSeenAuthPrompt(true);
  };

  const completeAuth = (authPayload) => {
    setToken(authPayload.token);
    setUser(authPayload.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setToken("");
    setCart([]);
    setFavorites([]);
    removeStoredValue(storageKeys.cart);
    removeStoredValue(storageKeys.favorites);
  };

  const addToCart = (product, size = null) => {
    if (!user) {
      requireAuth();
      return { success: false, requiresAuth: true };
    }

    if (!product?.id) {
      return { success: false, error: "Товар не найден" };
    }

    const availableStock = Number(product.stock || 0);
    if (availableStock <= 0) {
      return { success: false, error: "Товара сейчас нет в наличии" };
    }

    const selectedSize = size || product.selectedSize || null;
    let result = { success: true };

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id && item.selectedSize === selectedSize,
      );

      if (existingItem) {
        if (existingItem.quantity >= availableStock) {
          result = {
            success: false,
            error:
              availableStock > 0
                ? `Доступно только ${availableStock} шт.`
                : "Товара сейчас нет в наличии",
          };
          return currentCart;
        }

        return currentCart.map((item) =>
          item.id === product.id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentCart, { ...product, selectedSize, quantity: 1 }];
    });

    return result;
  };

  const removeFromCart = (productId, size = null) => {
    setCart((currentCart) =>
      currentCart.filter((item) => !(item.id === productId && item.selectedSize === size)),
    );
  };

  const toggleFavorite = (productId) => {
    if (!user) {
      return { changed: false, isFavorite: false, requiresAuth: true };
    }

    const nextFavoriteState = !favorites.includes(productId);

    setFavorites((currentFavorites) =>
      nextFavoriteState
        ? [...currentFavorites, productId]
        : currentFavorites.filter((id) => id !== productId),
    );

    return { changed: true, isFavorite: nextFavoriteState, requiresAuth: false };
  };

  const placeOrder = async ({ shippingAddress, paymentMethod = "card" } = {}) => {
    if (!user || !token) {
      requireAuth();
      return { success: false, requiresAuth: true };
    }

    if (cart.length === 0) {
      return { success: false, error: "Корзина пуста" };
    }

    setIsPlacingOrder(true);

    try {
      const order = await createOrder(token, {
        items: cart,
        shippingAddress: shippingAddress || user.address || "",
        paymentMethod,
      });

      setCart([]);
      return { success: true, order };
    } catch (error) {
      return { success: false, error: error.message || "Не удалось оформить заказ" };
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const value = {
    cart,
    cartItemsCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    cartTotal: cart.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0),
    favorites,
    isFavorite: (productId) => favorites.includes(productId),
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === "admin",
    isAuthModalOpen,
    setIsAuthModalOpen,
    hasSeenAuthPrompt,
    isPlacingOrder,
    markAuthPromptSeen,
    requireAuth,
    completeAuth,
    setUser,
    addToCart,
    removeFromCart,
    toggleFavorite,
    placeOrder,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
