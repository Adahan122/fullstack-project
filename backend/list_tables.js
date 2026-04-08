
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    const res = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
    );
    console.log(
      'Таблицы в базе:',
      res.rows.map((r) => r.table_name),
    );
  } catch (err) {
    console.error('Ошибка:', err.message);
  } finally {
    await pool.end();
  }
})();
