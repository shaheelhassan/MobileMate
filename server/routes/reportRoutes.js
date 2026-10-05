const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSalesReport,
  getStockReport,
  getPurchaseReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/sales', protect, authorize('admin', 'manager'), getSalesReport);
router.get('/stock', protect, authorize('admin', 'manager'), getStockReport);
router.get('/purchases', protect, authorize('admin', 'manager'), getPurchaseReport);

module.exports = router;
