const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

const generateInvoiceNo = async () => {
  const count = await Sale.countDocuments();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
};

const createSale = asyncHandler(async (req, res) => {
  const { items, customer, paymentMethod, tax = 0 } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'At least one item is required to complete a sale');
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new ApiError(404, `Product not found: ${item.product}`);
      if (product.stockQty < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name} (available: ${product.stockQty})`);
      }

      product.stockQty -= Number(item.quantity);
      await product.save({ session });

      const lineTotal = product.salePrice * item.quantity;
      subtotal += lineTotal;

      saleItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        salePrice: product.salePrice,
      });
    }

    const total = subtotal + Number(tax);
    const invoiceNo = await generateInvoiceNo();

    const [sale] = await Sale.create(
      [
        {
          invoiceNo,
          items: saleItems,
          customer: customer || undefined,
          subtotal,
          tax,
          total,
          paymentMethod,
          cashier: req.user._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const populatedSale = await Sale.findById(sale._id)
      .populate('customer', 'name phone')
      .populate('cashier', 'name');

    res.status(201).json({ success: true, sale: populatedSale });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

const getSales = asyncHandler(async (req, res) => {
  const { from, to, cashier } = req.query;
  const query = {};
  if (from || to) {
    query.saleDate = {};
    if (from) query.saleDate.$gte = new Date(from);
    if (to) query.saleDate.$lte = new Date(to);
  }
  if (cashier) query.cashier = cashier;

  const sales = await Sale.find(query)
    .populate('customer', 'name phone')
    .populate('cashier', 'name')
    .sort({ saleDate: -1 });

  res.json({ success: true, count: sales.length, sales });
});

const getSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate('customer', 'name phone address')
    .populate('cashier', 'name');
  if (!sale) throw new ApiError(404, 'Sale not found');
  res.json({ success: true, sale });
});

module.exports = { createSale, getSales, getSale };
