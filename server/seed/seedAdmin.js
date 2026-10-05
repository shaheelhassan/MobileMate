// One-time script to create the first admin account.
// Run with: node seed/seedAdmin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@mobilemate.com';
  const plainPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';

  const exists = await User.findOne({ email });
  if (exists) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(plainPassword, salt);

  await User.create({ name: 'Shop Admin', email, password, role: 'admin' });
  console.log(`Admin created -> email: ${email}  password: ${plainPassword}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
