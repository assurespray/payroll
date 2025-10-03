const express = require('express');
const Leave = require('../models/Leave');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');

const router = express.Router();

router.use(auth);

// @route   POST /api/leaves
// @access  Private
router.post('/', async (req, res) => {
  try {
    const leave = await Leave.create({
      ...req.body,
      employeeId: req.employee.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Leave application submitted',
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/leaves
// @access  Private
router.get('/', async (req, res) => {
  try {
    const query = { employeeId: req.employee.id };
    
    const leaves = await Leave.find(query)
      .sort({ appliedDate: -1 });
    
    res.json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/leaves/pending
// @access  Private (Manager, Admin)
router.get('/pending', authorize('manager', 'admin'), async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'pending' })
      .populate('employeeId', 'employeeId personalInfo.firstName personalInfo.lastName')
      .sort({ appliedDate: -1 });
    
    res.json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/leaves/:id
// @access  Private (Manager, Admin)
router.put('/:id', authorize('manager', 'admin'), async (req, res) => {
  try {
    const { status, reviewComments } = req.body;
    
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewComments,
        reviewedBy: req.employee.id,
        reviewedDate: new Date()
      },
      { new: true }
    );
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }
    
    res.json({
      success: true,
      message: `Leave ${status}`,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
