const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const logActivity = require('../utils/logActivity');

const createPurchase = asyncHandler(async (req, res) => {
  const { supplier, items } = req.body;

  if (!supplier || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Supplier and at least one item are required');
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let totalAmount = 0;
    const purchaseItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new ApiError(404, `Product not found: ${item.product}`);

      product.stockQty += Number(item.quantity);
      product.costPrice = Number(item.costPrice);
      await product.save({ session });

      totalAmount += Number(item.costPrice) * Number(item.quantity);
      purchaseItems.push({
        product: product._id,
        name: product.name,
        quantity: Number(item.quantity),
        costPrice: Number(item.costPrice),
      });
    }

    const [purchase] = await Purchase.create(
      [
        {
          supplier,
          items: purchaseItems,
          totalAmount,
          createdBy: req.user._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    await logActivity({
      user: req.user._id,
      action: 'recorded stock purchase',
      entityType: 'Purchase',
      entityId: purchase._id,
      details: { totalAmount, itemCount: purchaseItems.length },
    });

    const populated = await Purchase.findById(purchase._id)
      .populate('supplier', 'name contact')
      .populate('createdBy', 'name');

    res.status(201).json({ success: true, purchase: populated });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

const getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find()
    .populate('supplier', 'name contact')
    .populate('createdBy', 'name')
    .sort({ purchaseDate: -1 });
  res.json({ success: true, count: purchases.length, purchases });
});

module.exports = { createPurchase, getPurchases };
