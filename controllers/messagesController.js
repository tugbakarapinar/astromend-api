// controllers/messagesController.js
const pool = require('../config/db');

// Tüm mesajları getir
exports.getAllMessages = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM messages ORDER BY created_at ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Mesajlar alınamadı', error });
  }
};

// İki kullanıcı arasındaki tüm mesajları getir (chat ekranı için)
exports.getConversation = async (req, res) => {
  const { user1, user2 } = req.query;
  if (!user1 || !user2) {
    return res.status(400).json({ message: 'user1 ve user2 zorunludur.' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [user1, user2, user2, user1]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Mesajlar alınamadı', error });
  }
};

// Yeni mesaj gönder (tabloya tam uyumlu!)
exports.createMessage = async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;
  if (!sender_id || !receiver_id || !message) {
    return res.status(400).json({ message: 'sender_id, receiver_id ve message zorunludur.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at) VALUES (?, ?, ?, 0, NOW())',
      [sender_id, receiver_id, message]
    );
    res.status(201).json({
      id: result.insertId,
      sender_id,
      receiver_id,
      message,
      is_read: 0,
      created_at: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Mesaj eklenemedi', error });
  }
};

// (Opsiyonel) Mesaj sil
exports.deleteMessage = async (req, res) => {
  const messageId = req.params.id;
  try {
    await pool.query('DELETE FROM messages WHERE id = ?', [messageId]);
    res.json({ message: 'Mesaj silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Mesaj silinemedi', error });
  }
};
