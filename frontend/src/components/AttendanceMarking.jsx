import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { Login as CheckInIcon, Logout as CheckOutIcon } from '@mui/icons-material';
import attendanceService from '../services/attendanceService';
import { format } from 'date-fns';

const AttendanceMarking = () => {
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTodayAttendance();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceService.getTodayAttendance();
      if (response.data && response.data.length > 0) {
        setTodayAttendance(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await attendanceService.checkIn(remarks);
      setMessage({ type: 'success', text: 'Check-in successful!' });
      setRemarks('');
      await fetchTodayAttendance();
    } catch (err) {
      setMessage({ type: 'error', text: err || 'Check-in failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await attendanceService.checkOut(remarks);
      setMessage({ type: 'success', text: 'Check-out successful!' });
      setRemarks('');
      await fetchTodayAttendance();
    } catch (err) {
      setMessage({ type: 'error', text: err || 'Check-out failed' });
    } finally {
      setLoading(false);
    }
  };

  const hasCheckedIn = todayAttendance?.checkIn?.time;
  const hasCheckedOut = todayAttendance?.checkOut?.time;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mark Attendance
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Current Time Display */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </Typography>
          <Typography variant="h3" align="center" color="primary">
            {format(currentTime, 'hh:mm:ss a')}
          </Typography>
        </CardContent>
      </Card>

      {/* Today's Status */}
      {todayAttendance && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Today's Status
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Check In:
              </Typography>
              <Typography variant="h6">
                {hasCheckedIn ? format(new Date(todayAttendance.checkIn.time), 'hh:mm a') : 'Not checked in'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Check Out:
              </Typography>
              <Typography variant="h6">
                {hasCheckedOut ? format(new Date(todayAttendance.checkOut.time), 'hh:mm a') : 'Not checked out'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Working Hours:
              </Typography>
              <Typography variant="h6">
                {todayAttendance.workingHours?.actual?.toFixed(2) || 0} hrs
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Status:
              </Typography>
              <Chip
                label={todayAttendance.status?.toUpperCase()}
                color={
                  todayAttendance.status === 'present'
                    ? 'success'
                    : todayAttendance.status === 'late'
                    ? 'warning'
                    : 'default'
                }
              />
            </Box>
          </Box>
        </Paper>
      )}

      {/* Attendance Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {!hasCheckedIn ? 'Check In' : !hasCheckedOut ? 'Check Out' : 'Attendance Marked'}
        </Typography>

        <TextField
          fullWidth
          label="Remarks (Optional)"
          multiline
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          sx={{ mt: 2, mb: 3 }}
          disabled={loading || (hasCheckedIn && hasCheckedOut)}
        />

        <Box display="flex" gap={2}>
          {!hasCheckedIn && (
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <CheckInIcon />}
              onClick={handleCheckIn}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Processing...' : 'Check In'}
            </Button>
          )}

          {hasCheckedIn && !hasCheckedOut && (
            <Button
              variant="contained"
              size="large"
              color="error"
              startIcon={loading ? <CircularProgress size={20} /> : <CheckOutIcon />}
              onClick={handleCheckOut}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Processing...' : 'Check Out'}
            </Button>
          )}

          {hasCheckedIn && hasCheckedOut && (
            <Alert severity="info" sx={{ width: '100%' }}>
              You have already marked your attendance for today.
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AttendanceMarking;
            
