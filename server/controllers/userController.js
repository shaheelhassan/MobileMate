const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const logActivity = require('../utils/logActivity');

const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, 'Name, email, password and role are required');
  }
  if (!['manager', 'cashier', 'admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, 'A user with this email already exists');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    createdBy: req.user._id,
  });

  await logActivity({
    user: req.user._id,
    action: 'created staff account',
    entityType: 'User',
    entityId: user._id,
    details: `${user.role}: ${user.email}`,
  });

  res.status(201).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

const getStaff = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

const updateStaff = asyncHandler(async (req, res) => {
  const { name, role, isActive, password } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Staff member not found');

  if (name) user.name = name;
  if (role) user.role = role;
  if (typeof isActive === 'boolean') user.isActive = isActive;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  await user.save();

  await logActivity({
    user: req.user._id,
    action: 'updated staff account',
    entityType: 'User',
    entityId: user._id,
  });

  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
  });
});

const deactivateStaff = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Staff member not found');
  if (String(user._id) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }

  user.isActive = false;
  await user.save();

  await logActivity({
    user: req.user._id,
    action: 'deactivated staff account',
    entityType: 'User',
    entityId: user._id,
  });

  res.json({ success: true, message: 'Staff account deactivated' });
});

module.exports = { createStaff, getStaff, updateStaff, deactivateStaff };
