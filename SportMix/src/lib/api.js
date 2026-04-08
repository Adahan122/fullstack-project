import { readJson, storageKeys, writeJson } from "./storage";

const rawApiBaseUrl = import.meta.env.VITE_API_URL?.trim() || "/api";
const API_BASE_URL = rawApiBaseUrl.endsWith("/")
  ? rawApiBaseUrl.slice(0, -1)
  : rawApiBaseUrl;

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    const networkError = new Error("Сервер сейчас недоступен.");
    networkError.status = 0;
    throw networkError;
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    const parseError = new Error("Сервер вернул некорректный ответ.");
    parseError.status = response.status;
    throw parseError;
  }

  if (!response.ok) {
    const requestError = new Error(payload?.error || "Ошибка запроса.");
    requestError.status = response.status;
    throw requestError;
  }

  return payload;
}

function withAuth(token, options = {}) {
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };
}

function readLocalOrders() {
  const orders = readJson(storageKeys.orders, []);
  return Array.isArray(orders) ? orders : [];
}

function writeLocalOrders(orders) {
  writeJson(storageKeys.orders, orders);
}

function shouldUseLocalOrdersFallback(error) {
  return error?.status === 0 || error?.status === 404;
}

function createLocalOrder(payload) {
  const items = Array.isArray(payload?.items)
    ? payload.items.map((item, index) => ({
        id: item.id ?? `${Date.now()}-${index}`,
        name: item.name,
        image: item.image,
        brand: item.brand,
        size: item.selectedSize || item.size || null,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
      }))
    : [];

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const localOrder = {
    id: `local-${Date.now()}`,
    orderNumber: `SM-${String(Date.now()).slice(-8)}`,
    status: "processing",
    total,
    shippingAddress: payload?.shippingAddress || "",
    paymentMethod: payload?.paymentMethod || "card",
    createdAt: new Date().toISOString(),
    items,
    isLocalSimulation: true,
  };

  writeLocalOrders([localOrder, ...readLocalOrders()]);
  return localOrder;
}

export function fetchProducts() {
  return request("/data");
}

export function loginUser(credentials) {
  return request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export function registerUser(payload) {
  return request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function fetchProfile(token) {
  return request("/profile", withAuth(token));
}

export function updateProfile(token, profile) {
  return request(
    "/profile",
    withAuth(token, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    }),
  );
}

export function createOrder(token, payload) {
  return request(
    "/orders",
    withAuth(token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  ).catch((error) => {
    if (shouldUseLocalOrdersFallback(error)) {
      return createLocalOrder(payload);
    }

    throw error;
  });
}

export function fetchOrders(token) {
  return request("/orders", withAuth(token)).catch((error) => {
    if (shouldUseLocalOrdersFallback(error)) {
      return readLocalOrders();
    }

    throw error;
  });
}

export function fetchProductReviews(productId, token = "", params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return request(
    `/products/${productId}/reviews${queryString ? `?${queryString}` : ""}`,
    token ? withAuth(token) : undefined,
  );
}

export function createProductReview(token, productId, payload) {
  return request(
    `/products/${productId}/reviews`,
    withAuth(token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export function updateProductReview(token, productId, reviewId, payload) {
  return request(
    `/products/${productId}/reviews/${reviewId}`,
    withAuth(token, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export function deleteProductReview(token, productId, reviewId) {
  return request(
    `/products/${productId}/reviews/${reviewId}`,
    withAuth(token, {
      method: "DELETE",
    }),
  );
}

export function toggleProductReviewLike(token, productId, reviewId) {
  return request(
    `/products/${productId}/reviews/${reviewId}/like`,
    withAuth(token, {
      method: "POST",
    }),
  );
}

export function reportProductReview(token, productId, reviewId, payload) {
  return request(
    `/products/${productId}/reviews/${reviewId}/report`,
    withAuth(token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export function adminFetchOverview(token) {
  return request("/admin/overview", withAuth(token));
}

export function adminFetchUsers(token) {
  return request("/admin/users", withAuth(token));
}

export function adminUpdateUser(token, userId, payload) {
  return request(
    `/admin/users/${userId}`,
    withAuth(token, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export function adminDeleteUser(token, userId) {
  return request(
    `/admin/users/${userId}`,
    withAuth(token, {
      method: "DELETE",
    }),
  );
}

export function adminFetchProducts(token) {
  return request("/admin/products", withAuth(token));
}

export function adminCreateProduct(token, payload) {
  return request(
    "/admin/products",
    withAuth(token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export function adminUpdateProduct(token, productId, payload) {
  return request(
    `/admin/products/${productId}`,
    withAuth(token, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export function adminDeleteProduct(token, productId) {
  return request(
    `/admin/products/${productId}`,
    withAuth(token, {
      method: "DELETE",
    }),
  );
}

export function adminFetchOrders(token) {
  return request("/admin/orders", withAuth(token));
}

export function adminUpdateOrderStatus(token, orderId, status) {
  return request(
    `/admin/orders/${orderId}/status`,
    withAuth(token, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
  );
}

export function adminFetchReviewReports(token) {
  return request("/admin/review-reports", withAuth(token));
}

export function adminUpdateReviewReportStatus(token, reportId, status) {
  return request(
    `/admin/review-reports/${reportId}`,
    withAuth(token, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
  );
}

export function adminDeleteReview(token, reviewId) {
  return request(
    `/admin/reviews/${reviewId}`,
    withAuth(token, {
      method: "DELETE",
    }),
  );
}
