const express = require('express');
const router = express.Router();
const {
  createStaff,
  getStaff,
  updateStaff,
  deactivateStaff,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createStaff);
router.get('/', protect, authorize('admin'), getStaff);
router.put('/:id', protect, authorize('admin'), updateStaff);
router.delete('/:id', protect, authorize('admin'), deactivateStaff);

module.exports = router;
