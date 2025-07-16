// backend/routes/favoriler.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // MySQL bağlantı havuzu

// GET /api/favoriler
router.get('/', async (req, res) => {
  try {
    // Veritabanından favorileri çekiyoruz
    // tablonuzun yapısına göre alanları güncelleyin
    const [rows] = await pool.query(
      `SELECT
         id,
         user_id,
         item_id,
         created_at AS timestamp
       FROM favoriler
       ORDER BY created_at DESC`
    );
    // JSON olarak yanıt dön
    return res.json(rows);
  } catch (err) {
    console.error('GET /api/favoriler error:', err);
    return res.status(500).json({ message: 'Favoriler yüklenirken hata oluştu.' });
  }
});

module.exports = router;
