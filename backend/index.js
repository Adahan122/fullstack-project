require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// Секретный ключ для JWT
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 👇 ИСПРАВЛЕНО: Гибкое подключение к базе данных
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  // Если в .env есть DATABASE_URL (выдаст Render), используем её.
  // Иначе стучимся в твою локальную базу
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/myshop',
  ssl: isProduction ? { rejectUnauthorized: false } : false, // Render требует SSL для базы
});

pool
  .connect()
  .then(() => console.log('Подключено к PostgreSQL'))
  .catch((err) => console.error('Ошибка подключения к базе:', err));

// ============================================================
// 1. АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ
// ============================================================

// --- РЕГИСТРАЦИЯ ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword],
    );

    const newUser = result.rows[0];
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

// --- ВХОД (ЛОГИН) ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

// ============================================================
// 2. MIDDLEWARE (ПРОСЛОЙКА) ДЛЯ ЗАЩИТЫ РОУТОВ
// ============================================================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Доступ запрещен. Вы не авторизованы.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.userId = verified.id;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Неверный токен' });
  }
};

// ============================================================
// 3. ДАННЫЕ И ПРОФИЛЬ (ЗАЩИЩЕННЫЕ)
// ============================================================

// Получение товаров (доступно всем)
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, category, brand, gender, price, old_price AS "oldPrice", rating, reviews, tag, stock, sizes, colors, image, description, is_featured, is_new FROM products ORDER BY id ASC',
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении данных:', err);
    res.status(500).json({ error: err.message });
  }
});

// ПОЛУЧЕНИЕ профиля
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, phone, address, avatar, banner FROM users WHERE id = $1',
      [req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при получении профиля:', err);
    res.status(500).json({ error: err.message });
  }
});

// 👇 ИСПРАВЛЕНО: Оставлен только ОДИН роут обновления профиля (с полем username)
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, phone, address, avatar, banner } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET username = $1, email = $2, phone = $3, address = $4, avatar = $5, banner = $6 
       WHERE id = $7 RETURNING id, username, email, phone, address, avatar, banner`,
      [username, email, phone, address, avatar, banner, req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при сохранении профиля:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
