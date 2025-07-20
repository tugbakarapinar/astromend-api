const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // MySQL bağlantısı için pool

// Tüm mesajları getir
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, sender_id, receiver_id, message, is_read, created_at
       FROM messages
       ORDER BY created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error('GET /api/messages error:', err);
    return res.status(500).json({ message: 'Mesajlar yüklenirken hata oluştu.' });
  }
});

// Belirli kullanıcıya ait mesajları getir
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await pool.query(
      `SELECT id, sender_id, receiver_id, message, is_read, created_at
       FROM messages
       WHERE sender_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    return res.json(rows);
  } catch (err) {
    console.error('GET /api/messages/user/:userId error:', err);
    return res.status(500).json({ message: 'Kullanıcı mesajları yüklenirken hata oluştu.' });
  }
});

// Mesaj oluştur (ekle)
router.post('/', async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;
    if (!sender_id || !receiver_id || !message) {
      return res.status(400).json({ message: 'sender_id, receiver_id ve message zorunludur.' });
    }
    const [result] = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, message, is_read) VALUES (?, ?, ?, 0)`,
      [sender_id, receiver_id, message]
    );
    return res.status(201).json({
      id: result.insertId,
      sender_id,
      receiver_id,
      message,
      is_read: 0
    });
  } catch (err) {
    console.error('POST /api/messages error:', err);
    return res.status(500).json({ message: 'Mesaj eklenirken hata oluştu.' });
  }
});

// Mesaj sil
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query(
      `DELETE FROM messages WHERE id = ?`,
      [id]
    );
    return res.json({ message: 'Mesaj silindi.' });
  } catch (err) {
    console.error('DELETE /api/messages/:id error:', err);
    return res.status(500).json({ message: 'Mesaj silinirken hata oluştu.' });
  }
});

module.exports = router;
