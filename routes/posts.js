const express = require("express");
const router = express.Router();
const db = require("../config/db.js"); // ✅ düzeltilmiş import
const multer = require("multer");
const path = require("path");

// ---- Multer ayarları ----
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // 📌 uploads klasörüne kaydediyoruz
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// ---- Gönderi listeleme ----
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT posts.*, users.username,
              (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likesCount,
              (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS commentsCount
       FROM posts
       JOIN users ON posts.user_id = users.id
       ORDER BY posts.created_at DESC`
    );

    // 📌 Resim URL'lerini tam hale getirelim
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const formatted = rows.map((post) => {
      if (post.image_path) {
        post.image_path = baseUrl + post.image_path;
      }
      return post;
    });

    res.json(formatted);
  } catch (err) {
    console.error("Gönderiler alınamadı:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ---- Yeni paylaşım ekle ----
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId; // Token middleware varsa req.user.id gelir
    if (!userId) {
      return res.status(401).json({ message: "Kullanıcı bulunamadı." });
    }

    const text = req.body.text || null;
    let imagePath = null;

    if (req.file) {
      imagePath = "/uploads/" + req.file.filename; // 📌 burada sadece relative path
    }

    if (!text && !imagePath) {
      return res.status(400).json({ message: "Metin veya resim zorunlu." });
    }

    const query =
      "INSERT INTO posts (user_id, text, image_path, created_at) VALUES (?,?,?,NOW())";
    const values = [userId, text, imagePath];
    const [result] = await db.query(query, values);

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fullImagePath = imagePath ? baseUrl + imagePath : null;

    return res.status(201).json({
      message: "Post başarıyla eklendi",
      post: {
        id: result.insertId,
        user_id: userId,
        text,
        image_path: fullImagePath,
      },
    });
  } catch (err) {
    console.error("Post ekleme hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ---- Beğenme ----
router.post("/:id/like", async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id || req.body.userId;

    const [existing] = await db.query(
      "SELECT * FROM likes WHERE post_id = ? AND user_id = ?",
      [postId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Zaten beğenilmiş" });
    }

    await db.query("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [
      postId,
      userId,
    ]);
    res.status(201).json({ message: "Beğeni eklendi" });
  } catch (err) {
    console.error("Beğeni hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ---- Beğeniyi kaldır ----
router.delete("/:id/like", async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id || req.body.userId;

    await db.query("DELETE FROM likes WHERE post_id = ? AND user_id = ?", [
      postId,
      userId,
    ]);
    res.json({ message: "Beğeni kaldırıldı" });
  } catch (err) {
    console.error("Beğeni silme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ---- Yorumları getir ----
router.get("/:id/comments", async (req, res) => {
  try {
    const postId = req.params.id;
    const [rows] = await db.query(
      `SELECT comments.*, users.username 
       FROM comments 
       JOIN users ON comments.user_id = users.id 
       WHERE comments.post_id = ? 
       ORDER BY comments.created_at ASC`,
      [postId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Yorumlar alınamadı:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ---- Yorum ekle ----
router.post("/:id/comments", async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id || req.body.userId;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Yorum boş olamaz" });
    }

    await db.query(
      "INSERT INTO comments (post_id, user_id, text, created_at) VALUES (?, ?, ?, NOW())",
      [postId, userId, text]
    );
    res.status(201).json({ message: "Yorum eklendi" });
  } catch (err) {
    console.error("Yorum ekleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
