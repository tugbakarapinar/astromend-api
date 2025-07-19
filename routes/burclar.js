// routes/burclar.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Burç hesaplama fonksiyonu
function calculateZodiac(birthdate) {
  const date = new Date(birthdate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Koç';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Boğa';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'İkizler';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Yengeç';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Aslan';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Başak';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Terazi';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Akrep';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Yay';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Oğlak';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Kova';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Balık';
  return 'Bilinmiyor';
}

// GET /api/burclar → Tüm burçları döndürür
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, start_date, end_date, description 
       FROM zodiac_signs 
       ORDER BY id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/burclar error:', err);
    res.status(500).json({ message: 'Burçlar yüklenirken hata oluştu.' });
  }
});

// GET /api/burclar/kullanici?userId=1 → Kullanıcının burcunu döndürür
router.get('/kullanici', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId parametresi zorunludur.' });
    }

    const [userRows] = await pool.query(
      'SELECT birthdate FROM users WHERE id = ?',
      [userId]
    );
    if (!userRows.length || !userRows[0].birthdate) {
      return res.json({ success: false, message: 'Doğum tarihi bulunamadı.' });
    }

    const zodiacSign = calculateZodiac(userRows[0].birthdate);
    const [zodiacRows] = await pool.query(
      'SELECT name, description FROM zodiac_signs WHERE name = ?',
      [zodiacSign]
    );

    return res.json({
      success: true,
      zodiac: zodiacRows[0] || { name: zodiacSign, description: '' }
    });

  } catch (err) {
    console.error('GET /api/burclar/kullanici error:', err);
    res.status(500).json({ message: 'Burç bilgisi alınamadı.' });
  }
});

module.exports = router;
