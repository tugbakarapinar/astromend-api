const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// CORS & JSON body-parser
app.use(cors());
app.use(express.json());

// Debug logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} >`, req.body);
  next();
});

// Everything user-related (register & login) lives under /api/account
app.use('/api/account', require('./routes/users'));

// other routes…
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/favoriler',     require('./routes/favoriler'));
app.use('/api/hediyeler',     require('./routes/hediyeler'));
app.use('/api/puan',          require('./routes/puan'));
app.use('/api/bildirimler',   require('./routes/bildirimler'));



const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

