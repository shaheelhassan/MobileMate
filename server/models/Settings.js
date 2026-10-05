const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    shopName: { type: String, default: 'MobileMate' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    currency: { type: String, default: 'PKR' },
    invoiceFooterText: { type: String, default: 'Thank you for shopping with us!' },
    productCategories: { type: [String], default: ['phone', 'accessory'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
