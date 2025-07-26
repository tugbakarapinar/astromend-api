const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// --- FOTOĞRAF YÜKLEME AYARI ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

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

  if (!name || !email || !password || !confirm_password || !birthdate || !phone || !birthplace || !birthtime) {
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

// PROFİL BİLGİLERİNİ GETİR
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkilendirme hatası' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, username, email, birthdate, phone, birthplace, birthtime, profile_image FROM users WHERE id = ?',
      [decoded.id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    // Fotoğraf varsa tam URL döndür
    const profile = rows[0];
    if (profile.profile_image) {
      profile.profile_image = `${req.protocol}://${req.get('host')}/uploads/${profile.profile_image}`;
    }
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error('Profil error:', err);
    return res.status(401).json({ message: 'Geçersiz token' });
  }
});

// PROFİL GÜNCELLEME (form-data ile, foto yüklemeli)
router.put('/profile', upload.single('profile_image'), async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkilendirme hatası' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const fields = req.body;
    const updateFields = [];
    const params = [];

    if (fields.phone) {
      updateFields.push('phone = ?');
      params.push(fields.phone);
    }
    if (fields.birthplace) {
      updateFields.push('birthplace = ?');
      params.push(fields.birthplace);
    }
    if (fields.birthtime) {
      updateFields.push('birthtime = ?');
      params.push(fields.birthtime);
    }
    if (fields.birthdate) {
      updateFields.push('birthdate = ?');
      params.push(fields.birthdate);
    }
    if (req.file) {
      updateFields.push('profile_image = ?');
      params.push(req.file.filename);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Güncellenecek veri yok.' });
    }

    params.push(decoded.id);

    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    return res.status(200).json({ message: 'Profil güncellendi.' });
  } catch (err) {
    console.error('Profil update error:', err);
    return res.status(401).json({ message: 'Geçersiz token' });
  }
});

module.exports = router;
