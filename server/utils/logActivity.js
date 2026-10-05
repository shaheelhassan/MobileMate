const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ user, action, entityType, entityId, details }) => {
  try {
    await ActivityLog.create({ user, action, entityType, entityId, details });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

module.exports = logActivity;
