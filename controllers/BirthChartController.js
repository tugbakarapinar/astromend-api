const pool = require('../config/db');

// Doğum haritası oluştur
exports.createBirthChart = async (req, res) => {
  const { user_id, birth_date, birth_time, birth_city } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO birthcharts (user_id, birth_date, birth_time, birth_place)
       VALUES (?, ?, ?, ?)`,
      [user_id, birth_date, birth_time, birth_city]
    );
    res.status(201).json({ message: 'Doğum haritası kaydedildi', id: result.insertId });
  } catch (error) {
    console.error('createBirthChart:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kullanıcının doğum haritasını getir
exports.getBirthChartByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM birthcharts WHERE user_id = ?`, [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Kayıt bulunamadı' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('getBirthChartByUser:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Doğum haritasını güncelle
exports.updateBirthChart = async (req, res) => {
  const { userId } = req.params;
  const { birth_date, birth_time, birth_city } = req.body;
  try {
    await pool.query(
      `UPDATE birthcharts SET birth_date = ?, birth_time = ?, birth_place = ? WHERE user_id = ?`,
      [birth_date, birth_time, birth_city, userId]
    );
    res.json({ message: 'Güncellendi' });
  } catch (error) {
    console.error('updateBirthChart:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};
