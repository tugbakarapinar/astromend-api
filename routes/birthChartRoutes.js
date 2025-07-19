const express = require('express');
const router = express.Router();
const BirthChartController = require('../controllers/BirthChartController');

router.post('/', BirthChartController.createBirthChart);
router.get('/:userId', BirthChartController.getBirthChartByUser);
router.put('/:userId', BirthChartController.updateBirthChart);

module.exports = router;
