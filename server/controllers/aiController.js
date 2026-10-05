const axios = require('axios');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY || 'mobilemate_ai_secret_key_2026';

const aiClient = axios.create({
  baseURL: `${AI_SERVICE_URL}/api/v1`,
  headers: {
    'X-AI-API-KEY': AI_SERVICE_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const getSalesForecast = asyncHandler(async (req, res) => {
  const forecastDays = parseInt(req.query.days, 10) || 14;
  const salesHistory = await Sale.find().sort({ saleDate: 1 });

  const payload = {
    salesHistory: salesHistory.map((s) => ({
      date: s.saleDate,
      total: s.total,
      unitsSold: s.items.reduce((acc, it) => acc + it.quantity, 0),
    })),
    forecastDays,
  };

  try {
    const aiRes = await aiClient.post('/analyze/sales-forecast', payload);
    res.json(aiRes.data);
  } catch (error) {
    res.status(error.response?.status || 502).json({
      success: false,
      message: error.response?.data?.detail || 'AI Service unavailable',
    });
  }
});

const getInventoryRestockRecommendations = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true });
  const sales = await Sale.find({
    saleDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  const payload = {
    products: products.map((p) => {
      let salesLast30Days = 0;
      sales.forEach((s) => {
        const match = s.items.find((it) => it.product.toString() === p._id.toString());
        if (match) salesLast30Days += match.quantity;
      });

      return {
        id: p._id.toString(),
        name: p.name,
        category: p.category,
        currentStock: p.stockQty,
        lowStockThreshold: p.lowStockThreshold,
        salesVelocityLast30Days: salesLast30Days,
        costPrice: p.costPrice,
      };
    }),
  };

  try {
    const aiRes = await aiClient.post('/predict/inventory-restock', payload);
    res.json(aiRes.data);
  } catch (error) {
    res.status(error.response?.status || 502).json({
      success: false,
      message: error.response?.data?.detail || 'AI Service unavailable',
    });
  }
});

const predictRepair = asyncHandler(async (req, res) => {
  const { deviceModel, issueDescription } = req.body;
  try {
    const aiRes = await aiClient.post('/predict/repair', {
      deviceModel,
      issueDescription,
    });
    res.json(aiRes.data);
  } catch (error) {
    res.status(error.response?.status || 502).json({
      success: false,
      message: error.response?.data?.detail || 'AI Service unavailable',
    });
  }
});

const getModelHealth = asyncHandler(async (req, res) => {
  try {
    const aiRes = await aiClient.get('/models');
    res.json(aiRes.data);
  } catch (error) {
    res.status(error.response?.status || 502).json({
      success: false,
      message: error.response?.data?.detail || 'AI Service unavailable',
    });
  }
});

const triggerModelRetrain = asyncHandler(async (req, res) => {
  try {
    const aiRes = await aiClient.post('/models/retrain');
    res.json(aiRes.data);
  } catch (error) {
    res.status(error.response?.status || 502).json({
      success: false,
      message: error.response?.data?.detail || 'AI Service unavailable',
    });
  }
});

module.exports = {
  getSalesForecast,
  getInventoryRestockRecommendations,
  predictRepair,
  getModelHealth,
  triggerModelRetrain,
};
