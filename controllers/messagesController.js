const pool = require("../config/db");

// 📌 Tüm mesajları getir
exports.getAllMessages = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM messages ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Mesajları alırken hata:", error);
    res.status(500).json({ message: "Mesajlar alınamadı", error });
  }
};

// 📌 Belirli iki kullanıcı arasındaki mesajları getir
exports.getConversation = async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC",
      [user1, user2, user2, user1]
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Sohbet alınamadı:", error);
    res.status(500).json({ message: "Sohbet alınamadı", error });
  }
};

// 📌 Yeni mesaj gönder
exports.sendMessage = async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;
  try {
    await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, NOW())",
      [sender_id, receiver_id, message]
    );
    res.status(201).json({ message: "Mesaj gönderildi." });
  } catch (error) {
    console.error("❌ Mesaj gönderilemedi:", error);
    res.status(500).json({ message: "Mesaj gönderilemedi", error });
  }
};

// 📌 Sohbeti sil (iki kullanıcı arasındaki TÜM mesajlar uçacak)
exports.deleteConversation = async (req, res) => {
  const { user1, user2 } = req.body;
  try {
    const [result] = await pool.query(
      "DELETE FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
      [user1, user2, user2, user1]
    );

    if (result.affectedRows > 0) {
      res.json({ message: "Sohbet temizlendi." });
    } else {
      res.json({ message: "Silinecek sohbet bulunamadı." });
    }
  } catch (error) {
    console.error("❌ Sohbet silme hatası:", error);
    res.status(500).json({ message: "Sohbet silinemedi", error });
  }
};
