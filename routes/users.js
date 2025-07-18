const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 
const bcrypt = require('bcrypt');      
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { calculateZodiac } = require('./burclar'); 

// POST /api/account/register
router.post(
  '/register',
  [
    body('username').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('confirm_password').custom((value, { req }) => value === req.body.password),
    body('birthdate').isISO8601(),
    body('phone').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Tüm alanlar zorunludur', errors: errors.array() });
    }
    const { username, email, password, birthdate, phone } = req.body;
    try {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (username, email, password, birthdate, phone) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashed, birthdate, phone]
      );
      return res.status(201).json({ success: true, message: 'Kayıt başarılı' });
    } catch (err) {
      console.error('POST /api/account/register error:', err);
      return res.status(400).json({ message: err.sqlMessage || 'Kayıt başarısız' });
    }
  }
);

// POST /api/account/login
router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'E-posta ve şifre gerekli', errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const [rows] = await pool.query(
        'SELECT id, username, password, email FROM users WHERE email = ?',
        [email]
      );
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Geçersiz kimlik bilgileri' });
      }
      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: 'Geçersiz kimlik bilgileri' });
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        token,
        userId: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (err) {
      console.error('POST /api/account/login error:', err);
      return res.status(500).json({ message: 'Giriş işlemi sırasında hata oluştu' });
    }
  }
);

// GET /api/account/profile
router.get('/profile', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ message: 'Yetkilendirme gerekli' });
    }
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.userId;

    const [rows] = await pool.query(
      'SELECT id, username, email, birthdate, phone FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const user = rows[0];
    const zodiacSign = calculateZodiac(user.birthdate);

    return res.json({
      success: true,
      id: user.id,
      username: user.username,
      email: user.email,
      birthdate: user.birthdate,
      phone: user.phone,
      zodiacSign
    });
  } catch (err) {
    console.error('GET /api/account/profile error:', err);
    return res.status(401).json({ message: 'Geçersiz token veya yetkisiz erişim' });
  }
});

module.exports = router;
