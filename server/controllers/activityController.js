const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../middleware/asyncHandler');

// @route GET /api/activity  (admin only)
const getActivityLogs = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find()
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ success: true, count: logs.length, logs });
});

module.exports = { getActivityLogs };
