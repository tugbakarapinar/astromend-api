const express = require('express');
const router = express.Router();

// GET /api/hediyeler
router.get('/', (req, res) => {
  res.send('GET hediyeler');
});

module.exports = router;
