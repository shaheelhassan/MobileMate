const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const Repair = require('../models/Repair');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

const getCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  const customers = await Customer.find(query).sort({ name: 1 });
  res.json({ success: true, count: customers.length, customers });
});

const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');

  const [sales, repairs] = await Promise.all([
    Sale.find({ customer: customer._id }).sort({ saleDate: -1 }),
    Repair.find({ customer: customer._id }).sort({ createdAt: -1 }),
  ]);

  res.json({ success: true, customer, sales, repairs });
});

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json({ success: true, customer });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.json({ success: true, customer });
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.json({ success: true, message: 'Customer deleted' });
});

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
