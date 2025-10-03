const express = require('express');
const Payroll = require('../models/Payroll');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');

const router = express.Router();

router.use(auth);

// @route   GET /api/payroll
// @access  Private (Admin, Manager)
router.get('/', authorize('admin', 'manager'), async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const query = {};
    if (month) query['payPeriod.month'] = parseInt(month);
    if (year) query['payPeriod.year'] = parseInt(year);
    
    const payrolls = await Payroll.find(query)
      .populate('employeeId', 'employeeId personalInfo.firstName personalInfo.lastName')
      .sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 });
    
    res.json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payroll/employee/:employeeId
// @access  Private
router.get('/employee/:employeeId', async (req, res) => {
  try {
    // Check if user can access this employee's payroll
    if (req.employee.id !== req.params.employeeId && 
        !['admin', 'manager'].includes(req.employee.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const payrolls = await Payroll.find({ employeeId: req.params.employeeId })
      .sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 });
    
    res.json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
