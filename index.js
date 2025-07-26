require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

// CORS & JSON body‐parser
app.use(cors({ origin: '*' }));
app.use(express.json());

// Debug logger - Tüm gelen istekleri loglar
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} >`, req.body);
  next();
});

// PAYLAŞIMLAR
const postsRouter = require('./routes/posts');
app.use('/api/posts', postsRouter);

// Sağlık kontrolü
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).send('OK');
  } catch (err) {
    console.error('Health-Check Hatası:', err);
    return res.status(500).send('DB bağlantı hatası');
  }
});

// Kullanıcı giriş/kayıt işlemleri (login/register)
app.use('/api/account', require('./routes/account'));

// Diğer servis rotaları
app.use('/api/messages',    require('./routes/messages'));
app.use('/api/favoriler',   require('./routes/favoriler'));
app.use('/api/hediyeler',   require('./routes/hediyeler'));
app.use('/api/puan',        require('./routes/puan'));
app.use('/api/bildirimler', require('./routes/bildirimler'));

// BURÇLAR
const burclar = require('./routes/burclar');
app.use('/api/burclar', burclar);

// DOĞUM HARİTASI
const birthcharts = require('./routes/birthcharts');
app.use('/api/birthcharts', birthcharts);

// Hata yakalayıcı middleware (en sonda!)
app.use((err, req, res, next) => {
  console.error('Error Handler:', err);
  res.status(500).json({ message: 'Sunucu hatası' });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
