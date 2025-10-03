import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import attendanceService from '../services/attendanceService';
import { format } from 'date-fns';
import { STATUS_COLORS } from '../utils/constants';

const AttendanceHistory = () => {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
    
    fetchAttendance(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
  }, []);

  const fetchAttendance = async (start, end) => {
    try {
      setLoading(true);
      setError('');
      const response = await attendanceService.getHistory(start, end);
      setAttendance(response.data || []);
    } catch (err) {
      setError(err || 'Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (startDate && endDate) {
      fetchAttendance(startDate, endDate);
    }
  };

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || '#757575';
  };

  if (loading && attendance.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Attendance History
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Date Range Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              fullWidth
              disabled={loading}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Attendance Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Check In</strong></TableCell>
              <TableCell><strong>Check Out</strong></TableCell>
              <TableCell><strong>Working Hours</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Late Minutes</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No attendance records found for the selected date range.
                </TableCell>
              </TableRow>
            ) : (
              attendance.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>
                    {format(new Date(record.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {record.checkIn?.time
                      ? format(new Date(record.checkIn.time), 'hh:mm a')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {record.checkOut?.time
                      ? format(new Date(record.checkOut.time), 'hh:mm a')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {record.workingHours?.actual?.toFixed(2) || 0} hrs
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.status?.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(record.status),
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {record.isLate ? `${record.lateMinutes} min` : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceHistory;
