const pool = require('../config/db');

// Tüm mesajları getir
exports.getAllMessages = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM messages');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Mesajlar alınamadı', error });
  }
};

// Kullanıcıya ait mesajları getir
exports.getMessagesByUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await pool.query('SELECT * FROM messages WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcı mesajları alınamadı', error });
  }
};

// Yeni mesaj ekle
exports.createMessage = async (req, res) => {
  const { user_id, content } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO messages (user_id, content) VALUES (?, ?)',
      [user_id, content]
    );
    res.status(201).json({ id: result.insertId, user_id, content });
  } catch (error) {
    res.status(500).json({ message: 'Mesaj eklenemedi', error });
  }
};

// Mesaj sil
exports.deleteMessage = async (req, res) => {
  const messageId = req.params.id;
  try {
    await pool.query('DELETE FROM messages WHERE id = ?', [messageId]);
    res.json({ message: 'Mesaj silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Mesaj silinemedi', error });
  }
};

// --- EKLEDİĞİM ENDPOINT: Belirli iki kullanıcı arasındaki tüm mesajları sil ---
exports.deleteConversation = async (req, res) => {
  const { user1, user2 } = req.body;
  try {
    await pool.query(
      'DELETE FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
      [user1, user2, user2, user1]
    );
    res.json({ message: 'Sohbet silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sohbet silinemedi', error });
  }
};
