// API Base URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Date formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// Leave types
export const LEAVE_TYPES = [
  { value: 'casual', label: 'Casual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'earned', label: 'Earned Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
];

// Attendance status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half-day',
  HOLIDAY: 'holiday',
  LEAVE: 'leave',
};

// User roles
export const USER_ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMIN: 'admin',
};

// Status colors
export const STATUS_COLORS = {
  present: '#4caf50',
  absent: '#f44336',
  late: '#ff9800',
  'half-day': '#2196f3',
  holiday: '#9c27b0',
  leave: '#607d8b',
};
