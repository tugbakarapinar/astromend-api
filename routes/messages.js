// backend/routes/messages.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // MySQL bağlantısı için pool

// GET /api/messages
router.get('/', async (req, res) => {
  try {
    // Veritabanından mesajları çekiyoruz
    const [rows] = await pool.query(
      `SELECT id, sender, content, created_at AS timestamp
       FROM messages
       ORDER BY created_at DESC`
    );
    // JSON olarak yanıt dön
    return res.json(rows);
  } catch (err) {
    console.error('GET /api/messages error:', err);
    return res.status(500).json({ message: 'Mesajlar yüklenirken hata oluştu.' });
  }
});

module.exports = router;
