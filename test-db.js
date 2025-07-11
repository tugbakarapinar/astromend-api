
// test-db.js
require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Veritabanına bağlanılamadı:', err.message);
    return;
  }
  console.log('✅ Veritabanına başarıyla bağlanıldı!');
  connection.end();
});
