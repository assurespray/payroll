const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required']
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    }
  },
  employmentInfo: {
    department: {
      type: String,
      required: [true, 'Department is required']
    },
    position: {
      type: String,
      required: [true, 'Position is required']
    },
    dateOfJoining: {
      type: Date,
      required: [true, 'Date of joining is required'],
      default: Date.now
    },
    employmentType: {
      type: String,
      enum: ['permanent', 'contract', 'intern'],
      default: 'permanent'
    },
    workSchedule: {
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' },
      workingDays: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }]
    }
  },
  compensation: {
    basicSalary: {
      type: Number,
      required: [true, 'Basic salary is required'],
      min: [0, 'Salary cannot be negative']
    },
    allowances: {
      hra: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 }
    },
    deductions: {
      pf: { type: Number, default: 0 },
      esi: { type: Number, default: 0 },
      tax: { type: Number, default: 0 }
    }
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    default: 'employee'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  leaveBalance: {
    casual: { type: Number, default: 12 },
    sick: { type: Number, default: 12 },
    earned: { type: Number, default: 21 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for gross salary
employeeSchema.virtual('grossSalary').get(function() {
  const basic = this.compensation.basicSalary;
  const allowances = this.compensation.allowances;
  return basic + allowances.hra + allowances.transport + allowances.medical;
});

// Virtual for total deductions
employeeSchema.virtual('totalDeductions').get(function() {
  const deductions = this.compensation.deductions;
  return deductions.pf + deductions.esi + deductions.tax;
});

// Virtual for net salary
employeeSchema.virtual('netSalary').get(function() {
  return this.grossSalary - this.totalDeductions;
});

// Hash password before saving
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate employee ID automatically
employeeSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    try {
      const count = await this.constructor.countDocuments();
      const year = new Date().getFullYear();
      this.employeeId = `EMP${year}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare password
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ 'employmentInfo.department': 1 });
employeeSchema.index({ role: 1 });
employeeSchema.index({ isActive: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
           
