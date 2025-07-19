const BirthChart = require('../models/BirthChart');

// Doğum haritası oluştur
exports.createBirthChart = async (req, res) => {
  try {
    const birthChart = new BirthChart(req.body);
    await birthChart.save();
    res.status(201).json(birthChart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Kullanıcıya ait doğum haritasını getir
exports.getBirthChartByUser = async (req, res) => {
  try {
    const chart = await BirthChart.findOne({ userId: req.params.userId });
    if (!chart) return res.status(404).json({ message: 'Bulunamadı' });
    res.json(chart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Doğum haritası güncelle
exports.updateBirthChart = async (req, res) => {
  try {
    const updated = await BirthChart.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Bulunamadı' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
