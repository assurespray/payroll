const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const moment = require('moment');

// @desc    Mark check-in
// @route   POST /api/attendance/checkin
// @access  Private
exports.checkIn = async (req, res) => {
  try {
    const { remarks } = req.body;
    const employeeId = req.employee.id;
    const today = moment().startOf('day').toDate();

    // Check if already checked in
    let attendance = await Attendance.findOne({ employeeId, date: today });
    
    if (attendance && attendance.checkIn.time) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    const employee = await Employee.findById(employeeId);
    const checkInTime = new Date();

    // Check if late
    const [hours, minutes] = employee.employmentInfo.workSchedule.startTime.split(':');
    const scheduledStart = moment().set({ hour: hours, minute: minutes, second: 0 });
    
    let isLate = false;
    let lateMinutes = 0;
    
    if (moment(checkInTime).isAfter(scheduledStart)) {
      lateMinutes = moment(checkInTime).diff(scheduledStart, 'minutes');
      isLate = lateMinutes > 0;
    }

    // Create or update attendance
    if (!attendance) {
      attendance = new Attendance({
        employeeId,
        date: today,
        workingHours: { scheduled: 8 }
      });
    }

    attendance.checkIn = { time: checkInTime, remarks };
    attendance.status = isLate ? 'late' : 'present';
    attendance.isLate = isLate;
    attendance.lateMinutes = lateMinutes;

    await attendance.save();

    res.json({
      success: true,
      message: 'Check-in successful',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark check-out
// @route   POST /api/attendance/checkout
// @access  Private
exports.checkOut = async (req, res) => {
  try {
    const { remarks } = req.body;
    const employeeId = req.employee.id;
    const today = moment().startOf('day').toDate();

    const attendance = await Attendance.findOne({ employeeId, date: today });
    
    if (!attendance || !attendance.checkIn.time) {
      return res.status(400).json({
        success: false,
        message: 'Please check in first'
      });
    }

    if (attendance.checkOut.time) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    attendance.checkOut = { time: new Date(), remarks };
    await attendance.save();

    res.json({
      success: true,
      message: 'Check-out successful',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get attendance history
// @route   GET /api/attendance/history
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;
    const employeeId = req.employee.id;

    const query = { employeeId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get attendance summary
// @route   GET /api/attendance/summary
// @access  Private
exports.getSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const employeeId = req.employee.id;

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const summary = await Attendance.getSummary(employeeId, startDate, endDate);

    res.json({
      success: true,
      data: {
        period: {
          month: targetMonth + 1,
          year: targetYear
        },
        summary
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
      
