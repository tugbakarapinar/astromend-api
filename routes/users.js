const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const saltRounds = 10;

// ─── KAYIT ─────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { username, email, password_hash, confirm_password, birth_date, phone } = req.body;
  console.log('📥 Gelen kayıt verisi:', req.body);

  if (!username || !email || !password_hash || !confirm_password || !birth_date) {
    return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
  }
  if (password_hash !== confirm_password) {
    return res.status(400).json({ message: 'Şifreler uyuşmuyor.' });
  }

  try {
    const hashed = await bcrypt.hash(password_hash, saltRounds);
    const newUser = { username, email, password_hash: hashed, birth_date, phone };
    console.log('✅ Yeni kullanıcı eklendi:', newUser);
    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error('❌ Kayıt hatası:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// ─── GİRİŞ ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('📥 Giriş isteği:', req.body);

  try {
    // Demo kullanıcı; gerçek DB sorgusu yerine
    const demo = {
      id: 1,
      username: 'demo',
      email: 'demo@example.com',
      password_hash: await bcrypt.hash('Password123!', saltRounds)
    };

    if (email !== demo.email) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    const ok = await bcrypt.compare(password, demo.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Hatalı şifre.' });
    }

    console.log('✅ Giriş başarılı:', demo.email);
    return res.status(200).json({ success: true, user: {
      id: demo.id,
      username: demo.username,
      email: demo.email
    }});
  } catch (err) {
    console.error('❌ Giriş hatası:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

module.exports = router;
