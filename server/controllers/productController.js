const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const logActivity = require('../utils/logActivity');

const getProducts = asyncHandler(async (req, res) => {
  const { search, category, lowStock, page = 1, limit = 20 } = req.query;
  const query = { isActive: true };

  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
      { imeiOrSku: { $regex: search, $options: 'i' } },
    ];
  }
  if (lowStock === 'true') {
    query.$expr = { $lte: ['$stockQty', '$lowStockThreshold'] };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [total, products] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
  ]);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    products,
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  await logActivity({
    user: req.user._id,
    action: 'created product',
    entityType: 'Product',
    entityId: product._id,
    details: { name: product.name, stockQty: product.stockQty },
  });
  res.status(201).json({ success: true, product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  await logActivity({
    user: req.user._id,
    action: 'updated product',
    entityType: 'Product',
    entityId: product._id,
    details: req.body,
  });
  res.json({ success: true, product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  await logActivity({
    user: req.user._id,
    action: 'deactivated product',
    entityType: 'Product',
    entityId: product._id,
  });
  res.json({ success: true, message: 'Product removed' });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
