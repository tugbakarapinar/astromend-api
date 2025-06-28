const express = require('express');
const router = express.Router();

// GET /api/messages
router.get('/', (req, res) => {
  res.send('GET messages');
});

module.exports = router;
