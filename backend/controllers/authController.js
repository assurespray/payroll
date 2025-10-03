const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register employee
// @route   POST /api/auth/register
// @access  Public (Admin only in production)
exports.register = async (req, res) => {
  try {
    const {
      employeeId,
      email,
      password,
      personalInfo,
      employmentInfo,
      compensation,
      role
    } = req.body;

    // Check if employee exists
    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { employeeId }]
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email or ID already exists'
      });
    }

    // Create employee
    const employee = await Employee.create({
      employeeId,
      email,
      password,
      personalInfo,
      employmentInfo,
      compensation,
      role: role || 'employee'
    });

    // Generate token
    const token = generateToken(employee._id);

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: {
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          email: employee.email,
          fullName: employee.fullName,
          role: employee.role,
          department: employee.employmentInfo.department
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login employee
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find employee
    const employee = await Employee.findOne({ email }).select('+password');
    
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if active
    if (!employee.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await employee.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(employee._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          email: employee.email,
          fullName: employee.fullName,
          role: employee.role,
          department: employee.employmentInfo.department,
          position: employee.employmentInfo.position
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current employee profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id);
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
      
