const Supplier = require('../models/Supplier');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, count: suppliers.length, suppliers });
});

const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json({ success: true, supplier });
});

const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  res.json({ success: true, supplier });
});

const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  res.json({ success: true, message: 'Supplier removed' });
});

module.exports = { getSuppliers, createSupplier, updateSupplier, deleteSupplier };
