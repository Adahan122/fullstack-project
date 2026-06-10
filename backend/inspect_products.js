const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    const rows = await pool.query(
      "SELECT id, name, brand, category, price FROM products ORDER BY id LIMIT 50",
    );
    const count = await pool.query("SELECT COUNT(*)::int AS count FROM products");
    console.log("COUNT", count.rows[0].count);
    console.log(JSON.stringify(rows.rows, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
