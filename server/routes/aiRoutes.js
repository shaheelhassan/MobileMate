const express = require('express');
const router = express.Router();
const {
  getSalesForecast,
  getInventoryRestockRecommendations,
  predictRepair,
  getModelHealth,
  triggerModelRetrain,
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/forecast', protect, getSalesForecast);
router.get('/inventory-restock', protect, getInventoryRestockRecommendations);
router.post('/predict-repair', protect, predictRepair);
router.get('/models', protect, getModelHealth);
router.post('/retrain', protect, authorize('admin'), triggerModelRetrain);

module.exports = router;
