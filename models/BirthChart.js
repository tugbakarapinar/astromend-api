const mongoose = require('mongoose');

const BirthChartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  birthDate: {
    type: Date,
    required: true
  },
  birthTime: {
    type: String,
    required: true
  },
  birthPlace: {
    type: String,
    required: true
  },
  sunSign: {
    type: String,
    required: true
  },
  moonSign: {
    type: String
  },
  risingSign: {
    type: String
  },
  planets: {
    type: Object // Tüm gezegen konumları için (detaylandırabilirsin)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BirthChart', BirthChartSchema);
