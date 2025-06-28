const express = require('express');
const router = express.Router();

// GET /api/bildirimler
router.get('/', (req, res) => {
  res.send('GET bildirimler');
});

module.exports = router;
