// backend/routes/hediyeler.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 
// GET /api/hediyeler
router.get('/', async (req, res) => {
  try {

    const [rows] = await pool.query(
      `SELECT 
         id,
         name,
         description,
         price,
         created_at AS timestamp
       FROM hediyeler
       ORDER BY created_at DESC`
    );

    return res.json(rows);
  } catch (err) {
    console.error('GET /api/hediyeler error:', err);
    return res.status(500).json({ message: 'Hediyeler yüklenirken hata oluştu.' });
  }
});

module.exports = router;
