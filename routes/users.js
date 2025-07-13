// routes/users.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/register', async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      confirm_password,
      birthdate,   // 'birthdate' olarak güncellendi
      phone
    } = req.body;

    // Basit onaylama
    if (!username || !email || !password || !confirm_password || !birthdate || !phone) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Şifreler eşleşmiyor.' });
    }

    // Kullanıcı zaten var mı?
    const [existing] = await pool.query(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    );
    if (existing.length) {
      return res.status(409).json({ message: 'Bu e-posta zaten kayıtlı.' });
    }

    // Yeni kullanıcı ekleme
    const [result] = await pool.query(
      `INSERT INTO users
         (username, email, password, birthdate, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, password, birthdate, phone]
    );

    return res.status(201).json({ success: true, userId: result.insertId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
