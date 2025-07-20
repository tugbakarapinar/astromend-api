const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Şifre yanlış' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  const {
    name,
    email,
    password,
    confirm_password,
    birthdate,
    phone,
    birth_place,
    birth_time
  } = req.body;

  // Alan doğrulamaları
  if (!name || !email || !password || !confirm_password || !birthdate || !phone || !birth_place || !birth_time) {
    return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ message: 'Şifreler eşleşmiyor.' });
  }

  try {
    const [emailExists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (emailExists.length > 0) {
      return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı.' });
    }

    const [phoneExists] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (phoneExists.length > 0) {
      return res.status(400).json({ message: 'Bu telefon numarası zaten kayıtlı.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, email, password, birthdate, phone, birth_place, birth_time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, birthdate, phone, birth_place, birth_time]
    );

    return res.status(201).json({ message: 'Kayıt başarılı.' });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// PROFILE
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkilendirme hatası' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, username, email, birthdate, phone, birth_place, birth_time FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    return res.status(200).json({ success: true, profile: rows[0] });

  } catch (err) {
    console.error('Profil error:', err);
    return res.status(401).json({ message: 'Geçersiz token' });
  }
});

module.exports = router;
