const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const logActivity = require('../utils/logActivity');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) throw new ApiError(403, 'Account is deactivated. Contact admin.');

  const token = generateToken(user._id, user.role);

  await logActivity({
    user: user._id,
    action: 'staff logged in',
    entityType: 'User',
    entityId: user._id,
  });

  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, avatarUrl: req.user.avatarUrl },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatarUrl, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (name) user.name = name;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  if (newPassword) {
    if (!currentPassword) throw new ApiError(400, 'Current password is required to set new password');
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw new ApiError(401, 'Current password does not match');
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
  }

  await user.save();

  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
  });
});

module.exports = { login, getMe, updateProfile };
