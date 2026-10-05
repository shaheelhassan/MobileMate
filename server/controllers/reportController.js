const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Repair = require('../models/Repair');
const asyncHandler = require('../middleware/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todaySales,
    monthSales,
    totalProducts,
    lowStockCount,
    pendingRepairs,
    recentSales,
  ] = await Promise.all([
    Sale.aggregate([
      { $match: { saleDate: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Sale.aggregate([
      { $match: { saleDate: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stockQty', '$lowStockThreshold'] },
    }),
    Repair.countDocuments({ status: { $in: ['received', 'in-progress'] } }),
    Sale.find()
      .populate('customer', 'name')
      .populate('cashier', 'name')
      .sort({ saleDate: -1 })
      .limit(5),
  ]);

  res.json({
    success: true,
    todaySales: todaySales[0] || { total: 0, count: 0 },
    monthSales: monthSales[0] || { total: 0, count: 0 },
    totalProducts,
    lowStockCount,
    pendingRepairs,
    recentSales,
  });
});

const getSalesReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = {};
  if (from || to) {
    match.saleDate = {};
    if (from) match.saleDate.$gte = new Date(from);
    if (to) match.saleDate.$lte = new Date(to);
  }

  const [summary, topProducts, paymentMethods] = await Promise.all([
    Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalTax: { $sum: '$tax' },
          totalOrders: { $sum: 1 },
        },
      },
    ]),
    Sale.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.salePrice', '$items.quantity'] } },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 10 },
    ]),
    Sale.aggregate([
      { $match: match },
      { $group: { _id: '$paymentMethod', total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    summary: summary[0] || { totalRevenue: 0, totalTax: 0, totalOrders: 0 },
    topProducts,
    paymentMethods,
  });
});

const getStockReport = asyncHandler(async (req, res) => {
  const [stockSummary, lowStockItems] = await Promise.all([
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalItems: { $sum: '$stockQty' },
          totalStockValue: { $sum: { $multiply: ['$stockQty', '$costPrice'] } },
        },
      },
    ]),
    Product.find({
      isActive: true,
      $expr: { $lte: ['$stockQty', '$lowStockThreshold'] },
    }).select('name brand model stockQty lowStockThreshold costPrice salePrice'),
  ]);

  const totalStockValue = stockSummary.reduce((acc, c) => acc + c.totalStockValue, 0);

  res.json({
    success: true,
    totalStockValue,
    byCategory: stockSummary,
    lowStockItems,
  });
});

const getPurchaseReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = {};
  if (from || to) {
    match.purchaseDate = {};
    if (from) match.purchaseDate.$gte = new Date(from);
    if (to) match.purchaseDate.$lte = new Date(to);
  }

  const bySupplier = await Purchase.aggregate([
    { $match: match },
    { $group: { _id: '$supplier', totalSpent: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplier' } },
    { $unwind: '$supplier' },
    { $project: { _id: 1, totalSpent: 1, count: 1, 'supplier.name': 1 } },
    { $sort: { totalSpent: -1 } },
  ]);

  res.json({ success: true, bySupplier });
});

module.exports = {
  getDashboardStats,
  getSalesReport,
  getStockReport,
  getPurchaseReport,
};
