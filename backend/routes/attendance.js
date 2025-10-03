const express = require('express');
const {
  checkIn,
  checkOut,
  getHistory,
  getSummary
} = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/history', getHistory);
router.get('/summary', getSummary);

module.exports = router;
