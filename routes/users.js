// routes/users.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
// const bcrypt = require('bcrypt');

// Register endpoint
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, confirm_password, birthdate, phone } = req.body;

    // Simple validation
    if (!username || !email || !password || !confirm_password || !birthdate || !phone) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Şifreler eşleşmiyor.' });
    }

    // Check existing user
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length) {
      return res.status(409).json({ message: 'Bu e-posta zaten kayıtlı.' });
    }

    // TODO: bcrypt.hash for production
    // const hashed = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.query(
      `INSERT INTO users
         (username, email, password, birthdate, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, password /* or hashed */, birthdate, phone]
    );

    return res.status(201).json({ success: true, userId: result.insertId });
  } catch (err) {
    next(err);
  }
});

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email ve şifre zorunludur.' });
    }

    const [rows] = await pool.query(
      'SELECT id, username, email, password FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const user = rows[0];
    // Compare password when bcrypt is used
    // const match = await bcrypt.compare(password, user.password);
    if (user.password !== password) {
      return res.status(401).json({ message: 'Şifre hatalı.' });
    }

    return res.status(200).json({
      success: true,
      userId: user.id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
