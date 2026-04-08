require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123";
const isProduction = process.env.NODE_ENV === "production";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@sportmix.dev").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "SportMixAdmin123!";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "SportMix Admin";
const corsOriginEnv = process.env.CORS_ORIGIN || "";
const allowedOrigins = corsOriginEnv
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const starterProducts = [
  {
    name: "Nike Air Zoom Pegasus 41",
    category: "Shoes",
    brand: "Nike",
    gender: "Unisex",
    price: 12990,
    oldPrice: 14990,
    rating: 4.8,
    reviews: 124,
    tag: "Top",
    stock: 14,
    sizes: ["40", "41", "42", "43", "44"],
    colors: ["Black", "White", "Volt"],
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    description: "Легкие беговые кроссовки для ежедневных тренировок и городского ритма.",
    is_featured: true,
    is_new: true,
  },
  {
    name: "Adidas Ultraboost Light",
    category: "Shoes",
    brand: "Adidas",
    gender: "Unisex",
    price: 13990,
    oldPrice: 16990,
    rating: 4.7,
    reviews: 96,
    tag: "Sale",
    stock: 10,
    sizes: ["39", "40", "41", "42", "43"],
    colors: ["White", "Gray"],
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80",
    description: "Амортизирующие кроссовки с мягкой посадкой для длинных дистанций.",
    is_featured: true,
    is_new: false,
  },
  {
    name: "Puma Teamgoal Hoodie",
    category: "Clothes",
    brand: "Puma",
    gender: "Men",
    price: 5990,
    oldPrice: 7490,
    rating: 4.6,
    reviews: 41,
    tag: "Sale",
    stock: 20,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy"],
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    description: "Теплое худи для тренировок, прогулок и повседневного спортивного образа.",
    is_featured: false,
    is_new: false,
  },
  {
    name: "Under Armour HeatGear Tee",
    category: "Clothes",
    brand: "Under Armour",
    gender: "Men",
    price: 3490,
    oldPrice: null,
    rating: 4.5,
    reviews: 58,
    tag: "New",
    stock: 18,
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Blue"],
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    description: "Дышащая футболка для зала и активного дня с быстрым отводом влаги.",
    is_featured: true,
    is_new: true,
  },
  {
    name: "Reebok Training Shorts",
    category: "Clothes",
    brand: "Reebok",
    gender: "Women",
    price: 2890,
    oldPrice: 3590,
    rating: 4.4,
    reviews: 33,
    tag: "Fit",
    stock: 22,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Pink", "Black"],
    image: "https://images.unsplash.com/photo-1506629905607-d9c297d6f61f?auto=format&fit=crop&w=900&q=80",
    description: "Эластичные шорты для фитнеса, бега и летних тренировок.",
    is_featured: false,
    is_new: true,
  },
  {
    name: "Asics Gel-Kayano 31",
    category: "Shoes",
    brand: "Asics",
    gender: "Unisex",
    price: 15990,
    oldPrice: 17990,
    rating: 4.9,
    reviews: 72,
    tag: "Pro",
    stock: 9,
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: ["Blue", "Orange"],
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=900&q=80",
    description: "Стабильные премиальные кроссовки для бега с усиленной поддержкой стопы.",
    is_featured: true,
    is_new: true,
  },
  {
    name: "Nike Brasilia Duffel Bag",
    category: "Bags",
    brand: "Nike",
    gender: "Unisex",
    price: 4290,
    oldPrice: null,
    rating: 4.7,
    reviews: 51,
    tag: "Gym",
    stock: 16,
    sizes: ["One Size"],
    colors: ["Black"],
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
    description: "Вместительная спортивная сумка для формы, обуви и ежедневных тренировок.",
    is_featured: true,
    is_new: false,
  },
  {
    name: "Adidas Classic Backpack",
    category: "Bags",
    brand: "Adidas",
    gender: "Unisex",
    price: 3790,
    oldPrice: 4590,
    rating: 4.5,
    reviews: 38,
    tag: "City",
    stock: 19,
    sizes: ["One Size"],
    colors: ["Black", "Green"],
    image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=900&q=80",
    description: "Городской рюкзак в спортивном стиле для учебы, работы и поездок.",
    is_featured: false,
    is_new: false,
  },
  {
    name: "New Balance 574 Core",
    category: "Shoes",
    brand: "New Balance",
    gender: "Unisex",
    price: 9990,
    oldPrice: 11990,
    rating: 4.6,
    reviews: 67,
    tag: "Classic",
    stock: 12,
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Gray", "Black"],
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80",
    description: "Универсальные кроссовки в ретро-стиле для города и активного отдыха.",
    is_featured: true,
    is_new: false,
  },
  {
    name: "Jordan Essentials Track Jacket",
    category: "Clothes",
    brand: "Jordan",
    gender: "Men",
    price: 8490,
    oldPrice: 9990,
    rating: 4.8,
    reviews: 29,
    tag: "Premium",
    stock: 11,
    sizes: ["M", "L", "XL"],
    colors: ["Red", "Black"],
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    description: "Легкая олимпийка в баскетбольной эстетике для спорта и streetwear-образов.",
    is_featured: true,
    is_new: true,
  },
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/myshop",
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      avatar TEXT,
      banner TEXT,
      role VARCHAR(20) NOT NULL DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'customer';
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      brand VARCHAR(100),
      gender VARCHAR(50),
      price DECIMAL(10, 2) NOT NULL,
      old_price DECIMAL(10, 2),
      rating DECIMAL(3, 2) DEFAULT 0,
      reviews INTEGER DEFAULT 0,
      tag VARCHAR(50),
      stock INTEGER DEFAULT 0,
      sizes TEXT[],
      colors TEXT[],
      image TEXT,
      description TEXT,
      is_featured BOOLEAN DEFAULT false,
      is_new BOOLEAN DEFAULT false
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_number VARCHAR(40) UNIQUE NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'processing',
      total NUMERIC(10, 2) NOT NULL DEFAULT 0,
      total_items INTEGER NOT NULL DEFAULT 0,
      shipping_address TEXT,
      payment_method VARCHAR(40) DEFAULT 'card',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name VARCHAR(255) NOT NULL,
      product_image TEXT,
      brand VARCHAR(100),
      size VARCHAR(40),
      price NUMERIC(10, 2) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS review_likes (
      id SERIAL PRIMARY KEY,
      review_id INTEGER NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(review_id, user_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS review_reports (
      id SERIAL PRIMARY KEY,
      review_id INTEGER NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(review_id, user_id)
    );
  `);

  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const existingAdmin = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [ADMIN_EMAIL]);

  if (existingAdmin.rows.length === 0) {
    await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')`,
      [ADMIN_USERNAME, ADMIN_EMAIL, adminPasswordHash],
    );
  } else {
    await pool.query(
      `UPDATE users
       SET username = $1, password_hash = $2, role = 'admin'
       WHERE LOWER(email) = $3`,
      [ADMIN_USERNAME, adminPasswordHash, ADMIN_EMAIL],
    );
  }

  const productsCountResult = await pool.query("SELECT COUNT(*)::int AS count FROM products");
  const productsCount = Number(productsCountResult.rows[0]?.count || 0);

  if (productsCount === 0) {
    for (const product of starterProducts) {
      await pool.query(
        `INSERT INTO products
         (name, category, brand, gender, price, old_price, rating, reviews, tag, stock, sizes, colors, image, description, is_featured, is_new)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          product.name,
          product.category,
          product.brand,
          product.gender,
          product.price,
          product.oldPrice,
          product.rating,
          product.reviews,
          product.tag,
          product.stock,
          product.sizes,
          product.colors,
          product.image,
          product.description,
          product.is_featured,
          product.is_new,
        ],
      );
    }
  }
}

function generateOrderNumber() {
  return `SM-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role || "customer",
    phone: row.phone || "",
    address: row.address || "",
    createdAt: row.created_at || row.createdAt || null,
  };
}

function normalizeArrayInput(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    gender: row.gender,
    price: Number(row.price || 0),
    oldPrice: row.oldPrice == null ? null : Number(row.oldPrice),
    rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0),
    tag: row.tag,
    stock: Number(row.stock || 0),
    sizes: row.sizes || [],
    colors: row.colors || [],
    image: row.image,
    description: row.description,
    is_featured: Boolean(row.is_featured),
    is_new: Boolean(row.is_new),
  };
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Доступ запрещен. Вы не авторизованы." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.userId = verified.id;
    req.userRole = verified.role || "customer";
    next();
  } catch (error) {
    return res.status(400).json({ error: "Неверный токен" });
  }
}

function optionalAuthMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    next();
    return;
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.userId = verified.id;
    req.userRole = verified.role || "customer";
  } catch {
    req.userId = undefined;
    req.userRole = undefined;
  }

  next();
}

function adminOnlyMiddleware(req, res, next) {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Недостаточно прав для доступа к админке" });
  }

  next();
}

function mapOrderStatus(status) {
  const statusMap = {
    processing: "processing",
    shipped: "shipped",
    delivered: "delivered",
  };

  return statusMap[status] || "processing";
}

function normalizeOrderStatus(status) {
  const nextStatus = String(status || "").trim().toLowerCase();
  return mapOrderStatus(nextStatus);
}

function mapReviewSort(sort) {
  const normalizedSort = String(sort || "").trim().toLowerCase();

  switch (normalizedSort) {
    case "oldest":
      return { value: "oldest", orderBy: 'pr.created_at ASC' };
    case "highest":
      return { value: "highest", orderBy: 'pr.rating DESC, pr.created_at DESC' };
    case "lowest":
      return { value: "lowest", orderBy: 'pr.rating ASC, pr.created_at DESC' };
    case "popular":
      return { value: "popular", orderBy: 'COUNT(rl.id) DESC, pr.created_at DESC' };
    default:
      return { value: "newest", orderBy: 'pr.created_at DESC' };
  }
}

function mapReviewReportStatus(status) {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  if (["pending", "reviewed", "rejected"].includes(normalizedStatus)) {
    return normalizedStatus;
  }

  return "pending";
}

async function getOrdersWithItems(whereSql = "", params = []) {
  const ordersResult = await pool.query(
    `SELECT o.id, o.user_id AS "userId", o.order_number AS "orderNumber", o.status, o.total,
            o.total_items AS "totalItems", o.shipping_address AS "shippingAddress",
            o.payment_method AS "paymentMethod", o.created_at AS "createdAt",
            u.username AS "customerName", u.email AS "customerEmail"
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ${whereSql}
     ORDER BY o.created_at DESC`,
    params,
  );

  const orderIds = ordersResult.rows.map((order) => order.id);
  let itemsByOrderId = {};

  if (orderIds.length > 0) {
    const itemsResult = await pool.query(
      `SELECT id, order_id AS "orderId", product_id AS "productId", product_name AS "name",
              product_image AS "image", brand, size, price, quantity
       FROM order_items
       WHERE order_id = ANY($1::int[])
       ORDER BY id ASC`,
      [orderIds],
    );

    itemsByOrderId = itemsResult.rows.reduce((acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = [];
      }
      acc[item.orderId].push({
        ...item,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
      });
      return acc;
    }, {});
  }

  return ordersResult.rows.map((order) => ({
    ...order,
    total: Number(order.total || 0),
    totalItems: Number(order.totalItems || 0),
    status: mapOrderStatus(order.status),
    items: itemsByOrderId[order.id] || [],
  }));
}

async function refreshProductReviewStats(productId) {
  await pool.query(
    `UPDATE products
     SET rating = COALESCE(review_stats.avg_rating, 0),
         reviews = COALESCE(review_stats.review_count, 0)
     FROM (
       SELECT product_id,
              ROUND(AVG(rating)::numeric, 1) AS avg_rating,
              COUNT(*)::int AS review_count
       FROM product_reviews
       WHERE product_id = $1
       GROUP BY product_id
     ) AS review_stats
     WHERE products.id = review_stats.product_id`,
    [productId],
  );

  await pool.query(
    `UPDATE products
     SET rating = 0,
         reviews = 0
     WHERE id = $1
       AND NOT EXISTS (
         SELECT 1
         FROM product_reviews
         WHERE product_id = $1
       )`,
    [productId],
  );
}

async function hasPurchasedProduct(userId, productId) {
  const result = await pool.query(
    `SELECT 1
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = $1 AND oi.product_id = $2
     LIMIT 1`,
    [userId, productId],
  );

  return result.rows.length > 0;
}

app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    const userExists = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [normalizedEmail]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Пользователь с таким email уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, 'customer') RETURNING id, username, email, role, phone, address, created_at",
      [username, normalizedEmail, hashedPassword],
    );

    const newUser = sanitizeUser(result.rows[0]);
    const token = createToken(newUser);

    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Ошибка на сервере" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    const result = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [normalizedEmail]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Неверный email или пароль" });
    }

    const dbUser = result.rows[0];
    const isMatch = await bcrypt.compare(password, dbUser.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: "Неверный email или пароль" });
    }

    const user = sanitizeUser(dbUser);
    res.json({ token: createToken(user), user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Ошибка на сервере" });
  }
});

app.get("/api/data", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, category, brand, gender, price, old_price AS "oldPrice", rating, reviews, tag, stock, sizes, colors, image, description, is_featured, is_new FROM products ORDER BY id ASC',
    );
    res.json(result.rows.map(mapProduct));
  } catch (error) {
    console.error("Products error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:id/reviews", optionalAuthMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { value: sort, orderBy } = mapReviewSort(req.query.sort);
    const limit = Math.min(Math.max(Number(req.query.limit) || 4, 1), 20);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const countResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM product_reviews WHERE product_id = $1",
      [productId],
    );

    const result = await pool.query(
      `SELECT pr.id,
              pr.product_id AS "productId",
              pr.user_id AS "userId",
              pr.rating,
              pr.comment,
              pr.created_at AS "createdAt",
              u.username AS author,
              COUNT(rl.id)::int AS "likesCount",
              COALESCE(BOOL_OR(rl.user_id = $2), false) AS "likedByMe",
              COALESCE(MAX(rr_self.id) IS NOT NULL, false) AS "reportedByMe"
       FROM product_reviews pr
       JOIN users u ON u.id = pr.user_id
       LEFT JOIN review_likes rl ON rl.review_id = pr.id
       LEFT JOIN review_reports rr_self ON rr_self.review_id = pr.id AND rr_self.user_id = $2
       WHERE pr.product_id = $1
       GROUP BY pr.id, u.username
       ORDER BY ${orderBy}
       LIMIT $3 OFFSET $4`,
      [productId, req.userId || null, limit, offset],
    );

    const items = result.rows.map((row) => ({
        ...row,
        rating: Number(row.rating || 0),
        likesCount: Number(row.likesCount || 0),
        likedByMe: Boolean(row.likedByMe),
        reportedByMe: Boolean(row.reportedByMe),
        isOwn: req.userId ? Number(row.userId) === Number(req.userId) : false,
        isVerifiedPurchase: true,
      }));

    const total = Number(countResult.rows[0]?.count || 0);

    res.json({
      items,
      total,
      limit,
      offset,
      sort,
      hasMore: offset + items.length < total,
    });
  } catch (error) {
    console.error("Product reviews fetch error:", error);
    res.status(500).json({ error: "Не удалось загрузить отзывы" });
  }
});

app.post("/api/products/:id/reviews", authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { rating, comment } = req.body;
    const normalizedComment = String(comment || "").trim();
    const normalizedRating = Number(rating);

    if (!normalizedComment || normalizedComment.length < 8) {
      return res.status(400).json({ error: "Комментарий должен быть не короче 8 символов" });
    }

    if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ error: "Оценка должна быть от 1 до 5" });
    }

    const productExists = await pool.query("SELECT id FROM products WHERE id = $1", [productId]);
    if (productExists.rows.length === 0) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    const purchased = await hasPurchasedProduct(req.userId, productId);
    if (!purchased) {
      return res.status(403).json({ error: "Оставить отзыв можно только после покупки товара" });
    }

    const existingReview = await pool.query(
      "SELECT id FROM product_reviews WHERE product_id = $1 AND user_id = $2",
      [productId, req.userId],
    );
    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: "Вы уже оставляли отзыв на этот товар" });
    }

    const result = await pool.query(
      `INSERT INTO product_reviews (product_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING id, product_id AS "productId", user_id AS "userId", rating, comment, created_at AS "createdAt"`,
      [productId, req.userId, normalizedRating, normalizedComment],
    );

    await refreshProductReviewStats(productId);

    const userResult = await pool.query("SELECT username FROM users WHERE id = $1", [req.userId]);
    res.status(201).json({
      ...result.rows[0],
      rating: Number(result.rows[0].rating || 0),
      author: userResult.rows[0]?.username || "Пользователь",
      likesCount: 0,
      likedByMe: false,
      reportedByMe: false,
      isOwn: true,
      isVerifiedPurchase: true,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ error: "Не удалось отправить отзыв" });
  }
});

app.put("/api/products/:productId/reviews/:reviewId", authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const reviewId = Number(req.params.reviewId);
    const { rating, comment } = req.body;
    const normalizedComment = String(comment || "").trim();
    const normalizedRating = Number(rating);

    if (!normalizedComment || normalizedComment.length < 8) {
      return res.status(400).json({ error: "Комментарий должен быть не короче 8 символов" });
    }

    if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ error: "Оценка должна быть от 1 до 5" });
    }

    const result = await pool.query(
      `UPDATE product_reviews
       SET rating = $1, comment = $2
       WHERE id = $3 AND product_id = $4 AND user_id = $5
       RETURNING id, product_id AS "productId", user_id AS "userId", rating, comment, created_at AS "createdAt"`,
      [normalizedRating, normalizedComment, reviewId, productId, req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Отзыв не найден или недоступен для редактирования" });
    }

    await refreshProductReviewStats(productId);

    const userResult = await pool.query("SELECT username FROM users WHERE id = $1", [req.userId]);
    const likesResult = await pool.query("SELECT COUNT(*)::int AS count FROM review_likes WHERE review_id = $1", [reviewId]);

    res.json({
      ...result.rows[0],
      rating: Number(result.rows[0].rating || 0),
      author: userResult.rows[0]?.username || "Пользователь",
      likesCount: Number(likesResult.rows[0]?.count || 0),
      likedByMe: false,
      reportedByMe: false,
      isOwn: true,
      isVerifiedPurchase: true,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ error: "Не удалось обновить отзыв" });
  }
});

app.delete("/api/products/:productId/reviews/:reviewId", authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const reviewId = Number(req.params.reviewId);

    const result = await pool.query(
      "DELETE FROM product_reviews WHERE id = $1 AND product_id = $2 AND user_id = $3 RETURNING id",
      [reviewId, productId, req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Отзыв не найден или недоступен для удаления" });
    }

    await refreshProductReviewStats(productId);

    res.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ error: "Не удалось удалить отзыв" });
  }
});

app.post("/api/products/:productId/reviews/:reviewId/like", authMiddleware, async (req, res) => {
  try {
    const reviewId = Number(req.params.reviewId);
    const productId = Number(req.params.productId);

    const reviewExists = await pool.query(
      "SELECT id FROM product_reviews WHERE id = $1 AND product_id = $2",
      [reviewId, productId],
    );
    if (reviewExists.rows.length === 0) {
      return res.status(404).json({ error: "Отзыв не найден" });
    }

    const existingLike = await pool.query(
      "SELECT id FROM review_likes WHERE review_id = $1 AND user_id = $2",
      [reviewId, req.userId],
    );

    let liked;
    if (existingLike.rows.length > 0) {
      await pool.query("DELETE FROM review_likes WHERE review_id = $1 AND user_id = $2", [
        reviewId,
        req.userId,
      ]);
      liked = false;
    } else {
      await pool.query("INSERT INTO review_likes (review_id, user_id) VALUES ($1, $2)", [
        reviewId,
        req.userId,
      ]);
      liked = true;
    }

    const likesResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM review_likes WHERE review_id = $1",
      [reviewId],
    );

    res.json({
      reviewId,
      liked,
      likesCount: Number(likesResult.rows[0]?.count || 0),
    });
  } catch (error) {
    console.error("Toggle review like error:", error);
    res.status(500).json({ error: "Не удалось обновить лайк" });
  }
});

app.post("/api/products/:productId/reviews/:reviewId/report", authMiddleware, async (req, res) => {
  try {
    const reviewId = Number(req.params.reviewId);
    const productId = Number(req.params.productId);
    const reason = String(req.body?.reason || "").trim() || "spam";

    const reviewResult = await pool.query(
      `SELECT id, user_id AS "userId"
       FROM product_reviews
       WHERE id = $1 AND product_id = $2`,
      [reviewId, productId],
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: "РћС‚Р·С‹РІ РЅРµ РЅР°Р№РґРµРЅ" });
    }

    if (Number(reviewResult.rows[0].userId) === Number(req.userId)) {
      return res.status(400).json({ error: "РќРµР»СЊР·СЏ РїРѕР¶Р°Р»РѕРІР°С‚СЊСЃСЏ РЅР° СЃРІРѕР№ РѕС‚Р·С‹РІ" });
    }

    const result = await pool.query(
      `INSERT INTO review_reports (review_id, user_id, reason, status)
       VALUES ($1, $2, $3, 'pending')
       ON CONFLICT (review_id, user_id)
       DO UPDATE SET reason = EXCLUDED.reason, status = 'pending'
       RETURNING id, review_id AS "reviewId", reason, status, created_at AS "createdAt"`,
      [reviewId, req.userId, reason],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Report review error:", error);
    res.status(500).json({ error: "РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РїСЂР°РІРёС‚СЊ Р¶Р°Р»РѕР±Сѓ" });
  }
});

app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, phone, address, avatar, banner, role, created_at FROM users WHERE id = $1",
      [req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/profile", authMiddleware, async (req, res) => {
  try {
    const { username, email, phone, address, avatar, banner } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET username = $1, email = $2, phone = $3, address = $4, avatar = $5, banner = $6
       WHERE id = $7
       RETURNING id, username, email, phone, address, avatar, banner, role, created_at`,
      [username, String(email || "").trim().toLowerCase(), phone, address, avatar, banner, req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/orders", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const { items = [], shippingAddress = "", paymentMethod = "card" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Корзина пуста" });
    }

    const total = items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
    const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const orderNumber = generateOrderNumber();

    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, order_number, status, total, total_items, shipping_address, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, order_number AS "orderNumber", status, total, total_items AS "totalItems", shipping_address AS "shippingAddress", payment_method AS "paymentMethod", created_at AS "createdAt"`,
      [req.userId, orderNumber, "processing", total, totalItems, shippingAddress, paymentMethod],
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      const productId = Number(item.id || 0);
      const quantity = Number(item.quantity || 1);

      if (!productId || quantity <= 0) {
        throw new Error("Некорректный товар в заказе");
      }

      const productResult = await client.query(
        `SELECT id, name, stock
         FROM products
         WHERE id = $1
         FOR UPDATE`,
        [productId],
      );

      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Один из товаров больше не найден" });
      }

      const product = productResult.rows[0];
      const availableStock = Number(product.stock || 0);

      if (availableStock < quantity) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error:
            availableStock > 0
              ? `Товара "${product.name}" осталось только ${availableStock} шт.`
              : `Товар "${product.name}" закончился`,
        });
      }

      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, brand, size, price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          order.id,
          productId,
          item.name,
          item.image || "",
          item.brand || "",
          item.selectedSize || null,
          Number(item.price || 0),
          quantity,
        ],
      );

      await client.query(
        `UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
        [quantity, productId],
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      ...order,
      total: Number(order.total || 0),
      totalItems: Number(order.totalItems || 0),
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        brand: item.brand,
        size: item.selectedSize || null,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
      })),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create order error:", error);
    res.status(500).json({ error: "Не удалось оформить заказ" });
  } finally {
    client.release();
  }
});

app.get("/api/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await getOrdersWithItems("WHERE o.user_id = $1", [req.userId]);
    res.json(orders);
  } catch (error) {
    console.error("Orders fetch error:", error);
    res.status(500).json({ error: "Не удалось загрузить заказы" });
  }
});

app.get("/api/admin/overview", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const [productsResult, ordersResult, usersResult, revenueResult, reviewReportsResult] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM products"),
      pool.query("SELECT COUNT(*)::int AS count FROM orders"),
      pool.query("SELECT COUNT(*)::int AS count FROM users"),
      pool.query("SELECT COALESCE(SUM(total), 0)::numeric AS total FROM orders"),
      pool.query("SELECT COUNT(*)::int AS count FROM review_reports WHERE status = 'pending'"),
    ]);

    const recentOrders = await getOrdersWithItems("", []);

    res.json({
      stats: {
        products: Number(productsResult.rows[0]?.count || 0),
        orders: Number(ordersResult.rows[0]?.count || 0),
        users: Number(usersResult.rows[0]?.count || 0),
        revenue: Number(revenueResult.rows[0]?.total || 0),
        pendingReports: Number(reviewReportsResult.rows[0]?.count || 0),
      },
      recentOrders: recentOrders.slice(0, 5),
      adminCredentials: {
        email: ADMIN_EMAIL,
        username: ADMIN_USERNAME,
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ error: "Не удалось загрузить обзор админки" });
  }
});

app.get("/api/admin/users", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.phone, u.address, u.role, u.created_at,
              COUNT(o.id)::int AS "ordersCount",
              COALESCE(SUM(o.total), 0)::numeric AS "spentTotal"
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
    );

    res.json(
      result.rows.map((row) => ({
        ...sanitizeUser(row),
        ordersCount: Number(row.ordersCount || 0),
        spentTotal: Number(row.spentTotal || 0),
      })),
    );
  } catch (error) {
    console.error("Admin users fetch error:", error);
    res.status(500).json({ error: "Не удалось загрузить пользователей" });
  }
});

app.put("/api/admin/users/:id", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { username, email, phone, address, role } = req.body;

    if (userId === req.userId && role !== "admin") {
      return res.status(400).json({ error: "Нельзя снять роль admin у текущего аккаунта" });
    }

    const result = await pool.query(
      `UPDATE users
       SET username = $1,
           email = $2,
           phone = $3,
           address = $4,
           role = $5
       WHERE id = $6
       RETURNING id, username, email, phone, address, role, created_at`,
      [username, String(email || "").trim().toLowerCase(), phone || "", address || "", role === "admin" ? "admin" : "customer", userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(sanitizeUser(result.rows[0]));
  } catch (error) {
    console.error("Admin user update error:", error);
    res.status(500).json({ error: "Не удалось обновить пользователя" });
  }
});

app.delete("/api/admin/users/:id", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (userId === req.userId) {
      return res.status(400).json({ error: "Нельзя удалить текущего администратора" });
    }

    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ error: "Не удалось удалить пользователя" });
  }
});

app.get("/api/admin/products", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, category, brand, gender, price, old_price AS "oldPrice", rating, reviews, tag, stock, sizes, colors, image, description, is_featured, is_new FROM products ORDER BY id DESC',
    );
    res.json(result.rows.map(mapProduct));
  } catch (error) {
    console.error("Admin products fetch error:", error);
    res.status(500).json({ error: "Не удалось загрузить товары" });
  }
});

app.post("/api/admin/products", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      gender,
      price,
      oldPrice,
      rating,
      reviews,
      tag,
      stock,
      sizes,
      colors,
      image,
      description,
      is_featured,
      is_new,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products
       (name, category, brand, gender, price, old_price, rating, reviews, tag, stock, sizes, colors, image, description, is_featured, is_new)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING id, name, category, brand, gender, price, old_price AS "oldPrice", rating, reviews, tag, stock, sizes, colors, image, description, is_featured, is_new`,
      [
        name,
        category || null,
        brand || null,
        gender || null,
        Number(price || 0),
        oldPrice ? Number(oldPrice) : null,
        Number(rating || 0),
        Number(reviews || 0),
        tag || null,
        Number(stock || 0),
        normalizeArrayInput(sizes),
        normalizeArrayInput(colors),
        image || null,
        description || null,
        Boolean(is_featured),
        Boolean(is_new),
      ],
    );

    res.status(201).json(mapProduct(result.rows[0]));
  } catch (error) {
    console.error("Admin create product error:", error);
    res.status(500).json({ error: "Не удалось создать товар" });
  }
});

app.put("/api/admin/products/:id", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      gender,
      price,
      oldPrice,
      rating,
      reviews,
      tag,
      stock,
      sizes,
      colors,
      image,
      description,
      is_featured,
      is_new,
    } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           category = $2,
           brand = $3,
           gender = $4,
           price = $5,
           old_price = $6,
           rating = $7,
           reviews = $8,
           tag = $9,
           stock = $10,
           sizes = $11,
           colors = $12,
           image = $13,
           description = $14,
           is_featured = $15,
           is_new = $16
       WHERE id = $17
       RETURNING id, name, category, brand, gender, price, old_price AS "oldPrice", rating, reviews, tag, stock, sizes, colors, image, description, is_featured, is_new`,
      [
        name,
        category || null,
        brand || null,
        gender || null,
        Number(price || 0),
        oldPrice ? Number(oldPrice) : null,
        Number(rating || 0),
        Number(reviews || 0),
        tag || null,
        Number(stock || 0),
        normalizeArrayInput(sizes),
        normalizeArrayInput(colors),
        image || null,
        description || null,
        Boolean(is_featured),
        Boolean(is_new),
        Number(req.params.id),
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    res.json(mapProduct(result.rows[0]));
  } catch (error) {
    console.error("Admin update product error:", error);
    res.status(500).json({ error: "Не удалось обновить товар" });
  }
});

app.delete("/api/admin/products/:id", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [
      Number(req.params.id),
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Admin delete product error:", error);
    res.status(500).json({ error: "Не удалось удалить товар" });
  }
});

app.get("/api/admin/orders", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const orders = await getOrdersWithItems("", []);
    res.json(orders);
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    res.status(500).json({ error: "Не удалось загрузить заказы" });
  }
});

app.put("/api/admin/orders/:id/status", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const status = normalizeOrderStatus(req.body.status);
    const result = await pool.query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2
       RETURNING id, order_number AS "orderNumber", status, total, total_items AS "totalItems", shipping_address AS "shippingAddress", payment_method AS "paymentMethod", created_at AS "createdAt"`,
      [status, Number(req.params.id)],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Заказ не найден" });
    }

    res.json({
      ...result.rows[0],
      total: Number(result.rows[0].total || 0),
      totalItems: Number(result.rows[0].totalItems || 0),
      status: mapOrderStatus(result.rows[0].status),
    });
  } catch (error) {
    console.error("Admin update order status error:", error);
    res.status(500).json({ error: "Не удалось обновить статус заказа" });
  }
});

app.get("/api/admin/review-reports", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rr.id,
              rr.reason,
              rr.status,
              rr.created_at AS "createdAt",
              pr.id AS "reviewId",
              pr.product_id AS "productId",
              pr.rating,
              pr.comment,
              pr.created_at AS "reviewCreatedAt",
              reviewer.username AS "reviewAuthor",
              reporter.username AS "reportAuthor",
              products.name AS "productName"
       FROM review_reports rr
       JOIN product_reviews pr ON pr.id = rr.review_id
       JOIN users reviewer ON reviewer.id = pr.user_id
       JOIN users reporter ON reporter.id = rr.user_id
       JOIN products ON products.id = pr.product_id
       ORDER BY
         CASE WHEN rr.status = 'pending' THEN 0 ELSE 1 END,
         rr.created_at DESC`,
    );

    res.json(
      result.rows.map((row) => ({
        ...row,
        rating: Number(row.rating || 0),
      })),
    );
  } catch (error) {
    console.error("Admin review reports fetch error:", error);
    res.status(500).json({ error: "РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ Р¶Р°Р»РѕР±С‹ РЅР° РѕС‚Р·С‹РІС‹" });
  }
});

app.put("/api/admin/review-reports/:id", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const nextStatus = mapReviewReportStatus(req.body?.status);
    const result = await pool.query(
      `UPDATE review_reports
       SET status = $1
       WHERE id = $2
       RETURNING id, review_id AS "reviewId", reason, status, created_at AS "createdAt"`,
      [nextStatus, Number(req.params.id)],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Р–Р°Р»РѕР±Р° РЅРµ РЅР°Р№РґРµРЅР°" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Admin review report update error:", error);
    res.status(500).json({ error: "РќРµ СѓРґР°Р»РѕСЃСЊ РѕР±РЅРѕРІРёС‚СЊ СЃС‚Р°С‚СѓСЃ Р¶Р°Р»РѕР±С‹" });
  }
});

app.delete("/api/admin/reviews/:id", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const reviewId = Number(req.params.id);
    const reviewResult = await pool.query(
      "DELETE FROM product_reviews WHERE id = $1 RETURNING id, product_id AS \"productId\"",
      [reviewId],
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: "РћС‚Р·С‹РІ РЅРµ РЅР°Р№РґРµРЅ" });
    }

    await refreshProductReviewStats(reviewResult.rows[0].productId);
    res.json({ success: true, reviewId });
  } catch (error) {
    console.error("Admin delete review error:", error);
    res.status(500).json({ error: "РќРµ СѓРґР°Р»РѕСЃСЊ СѓРґР°Р»РёС‚СЊ РѕС‚Р·С‹РІ" });
  }
});

pool
  .connect()
  .then(async (client) => {
    console.log("Connected to PostgreSQL");
    client.release();
    await initDB();
    console.log("Database structure is ready");
    console.log(`Admin ready: ${ADMIN_EMAIL}`);
  })
  .catch((error) => console.error("Database connection error:", error));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
