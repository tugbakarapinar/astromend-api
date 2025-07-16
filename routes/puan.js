// backend/routes/puan.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // MySQL bağlantı havuzu

// GET /api/puan
router.get('/', async (req, res) => {
  try {
    // Veritabanından puanları çekiyoruz
    // Tablo adını ve alanları kendi şemanıza göre güncelleyin
    const [rows] = await pool.query(
      `SELECT
         id,
         user_id,
         score,
         created_at AS timestamp
       FROM puan
       ORDER BY score DESC`
    );
    // JSON olarak yanıt dön
    return res.json(rows);
  } catch (err) {
    console.error('GET /api/puan error:', err);
    return res.status(500).json({ message: 'Puanlar yüklenirken hata oluştu.' });
  }
});

module.exports = router;
