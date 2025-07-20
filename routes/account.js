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
    birthplace,
    birthtime
  } = req.body;

  // Zorunlu alan kontrolü
  if (!name || !email || !password || !confirm_password || !birthdate || !phone || !birthplace || !birthtime) {
    return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
  }

  // Şifre eşleşmesi kontrolü
  if (password !== confirm_password) {
    return res.status(400).json({ message: 'Şifreler eşleşmiyor.' });
  }

  try {
    // E-posta kontrolü
    const [emailExists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (emailExists.length > 0) {
      return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı.' });
    }

    // Telefon kontrolü
    const [phoneExists] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (phoneExists.length > 0) {
      return res.status(400).json({ message: 'Bu telefon numarası zaten kayıtlı.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Kayıt işlemi
    await pool.query(
      `INSERT INTO users (username, email, password, birthdate, phone, birthplace, birthtime)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, birthdate, phone, birthplace, birthtime]
    );

    return res.status(201).json({ message: 'Kayıt başarılı.' });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
