const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Tüm paylaşımları getir (GET /api/posts)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT posts.id, posts.text, posts.image_path, posts.created_at,
             users.id as user_id, users.username,
             (SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.id) as likesCount,
             (SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = posts.id) as commentsCount
      FROM posts
      INNER JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/posts error:', err);
    res.status(500).json({ message: 'Gönderiler yüklenirken hata oluştu.' });
  }
});

// Yeni paylaşım ekle (POST /api/posts)
router.post('/', async (req, res) => {
  try {
    const { user_id, text, image_path } = req.body;
    if (!user_id || (!text && !image_path)) {
      return res.status(400).json({ message: 'Kullanıcı ve paylaşım içeriği zorunlu.' });
    }
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, text, image_path) VALUES (?, ?, ?)',
      [user_id, text, image_path]
    );
    res.status(201).json({ success: true, post_id: result.insertId });
  } catch (err) {
    console.error('POST /api/posts error:', err);
    res.status(500).json({ message: 'Paylaşım eklenirken hata oluştu.' });
  }
});

// Bir paylaşımı beğen (POST /api/posts/:id/like)
router.post('/:id/like', async (req, res) => {
  try {
    const post_id = req.params.id;
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ message: 'user_id zorunlu.' });

    // Önceden beğenmiş mi kontrolü
    const [check] = await pool.query(
      'SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?',
      [post_id, user_id]
    );
    if (check.length) return res.status(400).json({ message: 'Zaten beğendiniz.' });

    await pool.query(
      'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
      [post_id, user_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/posts/:id/like error:', err);
    res.status(500).json({ message: 'Beğeni eklenirken hata oluştu.' });
  }
});

// Beğeniyi kaldır (DELETE /api/posts/:id/like)
router.delete('/:id/like', async (req, res) => {
  try {
    const post_id = req.params.id;
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ message: 'user_id zorunlu.' });

    await pool.query(
      'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
      [post_id, user_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/posts/:id/like error:', err);
    res.status(500).json({ message: 'Beğeni silinirken hata oluştu.' });
  }
});

// Beğenenleri getir (GET /api/posts/:id/likes)
router.get('/:id/likes', async (req, res) => {
  try {
    const post_id = req.params.id;
    const [rows] = await pool.query(
      `SELECT users.id, users.username
       FROM post_likes
       INNER JOIN users ON post_likes.user_id = users.id
       WHERE post_likes.post_id = ?`,
      [post_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/posts/:id/likes error:', err);
    res.status(500).json({ message: 'Beğeniler alınırken hata oluştu.' });
  }
});

// Yorumları getir (GET /api/posts/:id/comments)
router.get('/:id/comments', async (req, res) => {
  try {
    const post_id = req.params.id;
    const [rows] = await pool.query(
      `SELECT post_comments.id, post_comments.text, post_comments.created_at,
              users.id as user_id, users.username
         FROM post_comments
        INNER JOIN users ON post_comments.user_id = users.id
        WHERE post_comments.post_id = ?
        ORDER BY post_comments.created_at ASC`,
      [post_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/posts/:id/comments error:', err);
    res.status(500).json({ message: 'Yorumlar alınırken hata oluştu.' });
  }
});

// Yorum ekle (POST /api/posts/:id/comments)
router.post('/:id/comments', async (req, res) => {
  try {
    const post_id = req.params.id;
    const { user_id, text } = req.body;
    if (!user_id || !text) {
      return res.status(400).json({ message: 'user_id ve text zorunlu.' });
    }
    await pool.query(
      'INSERT INTO post_comments (post_id, user_id, text) VALUES (?, ?, ?)',
      [post_id, user_id, text]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/posts/:id/comments error:', err);
    res.status(500).json({ message: 'Yorum eklenirken hata oluştu.' });
  }
});

module.exports = router;
