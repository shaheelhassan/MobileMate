const Repair = require('../models/Repair');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const logActivity = require('../utils/logActivity');

const generateTicketNo = async () => {
  const count = await Repair.countDocuments();
  const year = new Date().getFullYear();
  return `REP-${year}-${String(count + 1).padStart(5, '0')}`;
};

const getRepairs = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { ticketNo: { $regex: search, $options: 'i' } },
      { deviceModel: { $regex: search, $options: 'i' } },
      { imeiOrSerial: { $regex: search, $options: 'i' } },
    ];
  }

  const repairs = await Repair.find(query)
    .populate('customer', 'name phone')
    .populate('receivedBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: repairs.length, repairs });
});

const createRepair = asyncHandler(async (req, res) => {
  const ticketNo = await generateTicketNo();
  const repair = await Repair.create({
    ...req.body,
    ticketNo,
    receivedBy: req.user._id,
  });

  await logActivity({
    user: req.user._id,
    action: 'created repair ticket',
    entityType: 'Repair',
    entityId: repair._id,
    details: { ticketNo, device: repair.deviceModel },
  });

  const populated = await Repair.findById(repair._id)
    .populate('customer', 'name phone')
    .populate('receivedBy', 'name');

  res.status(201).json({ success: true, repair: populated });
});

const updateRepair = asyncHandler(async (req, res) => {
  const repair = await Repair.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('customer', 'name phone')
    .populate('receivedBy', 'name');

  if (!repair) throw new ApiError(404, 'Repair ticket not found');

  await logActivity({
    user: req.user._id,
    action: `updated repair ticket status to ${repair.status}`,
    entityType: 'Repair',
    entityId: repair._id,
  });

  res.json({ success: true, repair });
});

module.exports = { getRepairs, createRepair, updateRepair };
