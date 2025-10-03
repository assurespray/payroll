import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  AccessTime as LateIcon,
  EventAvailable as LeaveIcon,
} from '@mui/icons-material';
import authService from '../services/authService';
import attendanceService from '../services/attendanceService';
import { format } from 'date-fns';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [error, setError] = useState('');
  const user = authService.getCurrentUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      // Fetch monthly summary
      const summaryResponse = await attendanceService.getSummary(month, year);
      setSummary(summaryResponse.data.summary);

      // Fetch today's attendance
      const todayResponse = await attendanceService.getTodayAttendance();
      if (todayResponse.data && todayResponse.data.length > 0) {
        setTodayAttendance(todayResponse.data[0]);
      }
    } catch (err) {
      setError(err || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Box>
          <Box sx={{ color, fontSize: 48 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.fullName}!
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Today's Status */}
      <Paper sx={{ p: 3, mb: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Today's Attendance
        </Typography>
        {todayAttendance ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Check In
              </Typography>
              <Typography variant="h6">
                {todayAttendance.checkIn?.time
                  ? format(new Date(todayAttendance.checkIn.time), 'hh:mm a')
                  : 'Not checked in'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Check Out
              </Typography>
              <Typography variant="h6">
                {todayAttendance.checkOut?.time
                  ? format(new Date(todayAttendance.checkOut.time), 'hh:mm a')
                  : 'Not checked out'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Working Hours
              </Typography>
              <Typography variant="h6">
                {todayAttendance.workingHours?.actual?.toFixed(2) || 0} hours
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Status
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color:
                    todayAttendance.status === 'present'
                      ? 'success.main'
                      : todayAttendance.status === 'late'
                      ? 'warning.main'
                      : 'error.main',
                }}
              >
                {todayAttendance.status?.toUpperCase()}
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No attendance record for today yet.
          </Typography>
        )}
      </Paper>

      {/* Monthly Statistics */}
      <Typography variant="h6" gutterBottom>
        This Month's Summary
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Present Days"
            value={summary?.presentDays || 0}
            icon={<PresentIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Absent Days"
            value={summary?.absentDays || 0}
            icon={<AbsentIcon />}
            color="error.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Late Days"
            value={summary?.lateDays || 0}
            icon={<LateIcon />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Leave Days"
            value={summary?.leaveDays || 0}
            icon={<LeaveIcon />}
            color="info.main"
          />
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Attendance Statistics
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Total Days:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {summary?.totalDays || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Attendance Rate:</Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  {summary?.attendancePercentage || 0}%
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Total Hours:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {summary?.totalHours?.toFixed(2) || 0} hrs
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Average Hours/Day:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {summary?.averageWorkingHours?.toFixed(2) || 0} hrs
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Employee Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Employee ID:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {user?.employeeId}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Department:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {user?.department}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Position:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {user?.position}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Role:</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                  {user?.role}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
