// config/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool({
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL’e başarıyla bağlanıldı.');
    conn.release();
  } catch (err) {
    console.error('❌ DB bağlantı hatası:', err);
    process.exit(1);
  }
})();

module.exports = pool;
