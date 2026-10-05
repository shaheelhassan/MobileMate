const Settings = require('../models/Settings');
const asyncHandler = require('../middleware/asyncHandler');

const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json({ success: true, settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();

  Object.assign(settings, req.body);
  await settings.save();

  res.json({ success: true, settings });
});

module.exports = { getSettings, updateSettings };
