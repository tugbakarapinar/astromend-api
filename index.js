require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

// CORS & JSON body‐parser
app.use(cors({ origin: '*' }));
app.use(express.json());

// Debug logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} >`, req.body);
  next();
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).send('OK');
  } catch (err) {
    console.error('Health-Check Hatası:', err);
    return res.status(500).send('DB bağlantı hatası');
  }
});

// User-related routes (register & login)
app.use('/api/account', require('./routes/users'));

// Diğer service router’ları
app.use('/api/messages',    require('./routes/messages'));
app.use('/api/favoriler',   require('./routes/favoriler'));
app.use('/api/hediyeler',   require('./routes/hediyeler'));
app.use('/api/puan',        require('./routes/puan'));
app.use('/api/bildirimler', require('./routes/bildirimler'));

// -- **BURÇLAR ROUTER’I DOĞRU KULLAN** --
const burclar = require('./routes/burclar');
app.use('/api/burclar', burclar);

// Hata yönetimi middleware’ı
app.use((err, req, res, next) => {
  console.error('Error Handler:', err);
  res.status(500).json({ message: 'Sunucu hatası' });
});

// Server’ı başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
