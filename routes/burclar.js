// backend/routes/burclar.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // MySQL bağlantı havuzu

// GET /api/burclar
router.get('/', async (req, res) => {
  try {
    // Veritabanından burçları çekiyoruz
    // Örnek tablo: zodiac_signs (id, name, start_date, end_date, description)
    const [rows] = await pool.query(
      `SELECT 
         id,
         name,
         start_date,
         end_date,
         description
       FROM zodiac_signs
       ORDER BY id ASC`
    );
    // JSON olarak yanıt dön
    return res.json(rows);
  } catch (err) {
    console.error('GET /api/burclar error:', err);
    return res.status(500).json({ message: 'Burçlar yüklenirken hata oluştu.' });
  }
});

module.exports = router;
