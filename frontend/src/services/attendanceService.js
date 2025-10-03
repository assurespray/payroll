import api from './api';

const attendanceService = {
  // Check in
  checkIn: async (remarks = '') => {
    try {
      const response = await api.post('/attendance/checkin', { remarks });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check out
  checkOut: async (remarks = '') => {
    try {
      const response = await api.post('/attendance/checkout', { remarks });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get history
  getHistory: async (startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/attendance/history', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get summary
  getSummary: async (month, year) => {
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;

      const response = await api.get('/attendance/summary', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get today's attendance
  getTodayAttendance: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get('/attendance/history', {
        params: {
          startDate: today,
          endDate: today,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default attendanceService;
