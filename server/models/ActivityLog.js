const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['Product', 'Sale', 'Purchase', 'Repair', 'Customer', 'Supplier', 'User', 'Settings'],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: Object, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
