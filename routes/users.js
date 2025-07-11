const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const pool    = require('../config/db');
const saltRounds = 10;

// ─── KAYIT ─────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { username, email, password_hash, confirm_password, birth_date, phone } = req.body;

  if (!username || !email || !password_hash || !confirm_password || !birth_date || !phone) {
    return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
  }

  if (password_hash !== confirm_password) {
    return res.status(400).json({ message: 'Şifreler uyuşmuyor.' });
  }

  try {
    const hashed = await bcrypt.hash(password_hash, saltRounds);

    const [rows] = await pool.query(
      'INSERT INTO users (username, email, password_hash, birth_date, phone) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashed, birth_date, phone]
    );

    return res.status(201).json({ success: true, userId: rows.insertId });
  } catch (err) {
    console.error('❌ Kayıt hatası:', err);
    return res.status(500).json({ 
      message: 'Sunucu hatası',
      error: err.message,
      stack: err.stack
    });
  }
});

// ─── GİRİŞ ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const user = users[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Hatalı şifre.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('❌ Giriş hatası:', err);
    return res.status(500).json({ 
      message: 'Sunucu hatası',
      error: err.message,
      stack: err.stack
    });
  }
});

module.exports = router;
