const mongoose = require('mongoose');
const moment = require('moment');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  checkIn: {
    time: Date,
    remarks: String
  },
  checkOut: {
    time: Date,
    remarks: String
  },
  workingHours: {
    scheduled: { type: Number, default: 8 },
    actual: { type: Number, default: 0 }
  },
  overtime: {
    hours: { type: Number, default: 0 },
    approved: { type: Boolean, default: false },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'holiday', 'leave'],
    default: 'absent'
  },
  isLate: { type: Boolean, default: false },
  lateMinutes: { type: Number, default: 0 },
  isEarlyLeave: { type: Boolean, default: false },
  earlyLeaveMinutes: { type: Number, default: 0 },
  isManualEntry: { type: Boolean, default: false },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for work duration
attendanceSchema.virtual('workDuration').get(function() {
  if (!this.checkIn.time || !this.checkOut.time) return '0h 0m';
  
  const diff = moment(this.checkOut.time).diff(moment(this.checkIn.time), 'minutes');
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours}h ${minutes}m`;
});

// Calculate working hours before saving
attendanceSchema.pre('save', function(next) {
  try {
    if (this.checkIn.time && this.checkOut.time) {
      const totalMinutes = moment(this.checkOut.time).diff(moment(this.checkIn.time), 'minutes');
      this.workingHours.actual = parseFloat((totalMinutes / 60).toFixed(2));
      
      // Calculate overtime
      const scheduledMinutes = this.workingHours.scheduled * 60;
      if (totalMinutes > scheduledMinutes) {
        this.overtime.hours = parseFloat(((totalMinutes - scheduledMinutes) / 60).toFixed(2));
      }
      
      // Determine status
      if (this.workingHours.actual >= this.workingHours.scheduled) {
        this.status = this.isLate ? 'late' : 'present';
      } else if (this.workingHours.actual >= (this.workingHours.scheduled / 2)) {
        this.status = 'half-day';
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get attendance summary
attendanceSchema.statics.getSummary = async function(employeeId, startDate, endDate) {
  const records = await this.find({
    employeeId,
    date: { $gte: startDate, $lte: endDate }
  });
  
  const summary = {
    totalDays: records.length,
    presentDays: records.filter(r => ['present', 'late'].includes(r.status)).length,
    absentDays: records.filter(r => r.status === 'absent').length,
    lateDays: records.filter(r => r.status === 'late').length,
    halfDays: records.filter(r => r.status === 'half-day').length,
    leaveDays: records.filter(r => r.status === 'leave').length,
    totalHours: records.reduce((sum, r) => sum + (r.workingHours.actual || 0), 0),
    totalOvertimeHours: records.reduce((sum, r) => sum + (r.overtime.hours || 0), 0)
  };
  
  if (summary.presentDays > 0) {
    summary.averageWorkingHours = parseFloat((summary.totalHours / summary.presentDays).toFixed(2));
  } else {
    summary.averageWorkingHours = 0;
  }
  
  summary.attendancePercentage = summary.totalDays > 0 
    ? parseFloat(((summary.presentDays / summary.totalDays) * 100).toFixed(2))
    : 0;
  
  return summary;
};

// Indexes
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
  
