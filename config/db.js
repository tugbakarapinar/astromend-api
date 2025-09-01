// config/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

// Eğer Render DATABASE_URL ortam değişkeni varsa onu kullan
// Yoksa manuel host/user/password ile bağlan
const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool({
      host:     process.env.DB_HOST || "127.0.0.1",
      port:     process.env.DB_PORT || 3306,
      user:     process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "astromend",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

// İlk başta bağlantıyı test et
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL bağlantısı başarılı");
    conn.release();
  } catch (err) {
    console.error("❌ DB bağlantı hatası:", err.message);
    // process.exit(1); // Render'da container kapanmasın diye çıkış yapma
  }
})();

module.exports = pool;
