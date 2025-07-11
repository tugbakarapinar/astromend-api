const express = require('express');
const router = express.Router();

// GET /api/favoriler
router.get('/', (req, res) => {
  res.send('GET favoriler');
});

module.exports = router;
