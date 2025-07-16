// backend/routes/bildirimler.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // MySQL bağlantı havuzu

// GET /api/bildirimler
router.get('/', async (req, res) => {
  try {
    // Veritabanından bildirimleri çekiyoruz
    // Kendi tablo adınıza ve sütunlarınıza göre uyarlayın:
    const [rows] = await pool.query(
      `SELECT
         id,
         user_id,
         type,
         message,
         created_at AS timestamp
       FROM bildirimler
       ORDER BY created_at DESC`
    );
    // JSON olarak yanıt dön
    return res.json(rows);
  } catch (err) {
    console.error('GET /api/bildirimler error:', err);
    return res.status(500).json({ message: 'Bildirimler yüklenirken hata oluştu.' });
  }
});

module.exports = router;
