const express = require('express');
const router = express.Router();
const { getRepairs, createRepair, updateRepair } = require('../controllers/repairController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRepairs);
router.post('/', protect, createRepair);
router.put('/:id', protect, updateRepair);

module.exports = router;
