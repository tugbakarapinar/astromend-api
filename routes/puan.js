const express = require('express');
const router = express.Router();

// GET /api/puan
router.get('/', (req, res) => {
  res.send('GET puan');
});

module.exports = router;
