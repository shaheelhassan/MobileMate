const express = require('express');
const router = express.Router();
const { createPurchase, getPurchases } = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'manager'), createPurchase);
router.get('/', protect, authorize('admin', 'manager'), getPurchases);

module.exports = router;
