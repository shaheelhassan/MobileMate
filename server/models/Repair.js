const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema(
  {
    ticketNo: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    deviceModel: { type: String, required: true, trim: true },
    imeiOrSerial: { type: String, trim: true },
    issueDescription: { type: String, required: true },
    status: {
      type: String,
      enum: ['received', 'in-progress', 'completed', 'delivered'],
      default: 'received',
    },
    estimatedCost: { type: Number, default: 0 },
    finalCost: { type: Number },
    technicianNotes: { type: String },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Repair', repairSchema);
