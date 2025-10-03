import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import authService from '../services/authService';
import { format } from 'date-fns';

const EmployeeProfile = () => {
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setEmployee(data);
    } catch (err) {
      setError(err || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      {/* Profile Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h5">
              {employee?.personalInfo?.firstName} {employee?.personalInfo?.lastName}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {employee?.employmentInfo?.position}
            </Typography>
            <Box mt={1}>
              <Chip
                label={employee?.role?.toUpperCase()}
                color="primary"
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip
                label={employee?.isActive ? 'Active' : 'Inactive'}
                color={employee?.isActive ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Employee ID
              </Typography>
              <Typography variant="body1">{employee?.employeeId}</Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Email
              </Typography>
              <Typography variant="body1">{employee?.email}</Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Phone Number
              </Typography>
              <Typography variant="body1">
                {employee?.personalInfo?.phoneNumber}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Gender
              </Typography>
              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {employee?.personalInfo?.gender || 'Not specified'}
              </Typography>
            </Box>

            {employee?.personalInfo?.dateOfBirth && (
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Date of Birth
                </Typography>
                <Typography variant="body1">
                  {format(new Date(employee.personalInfo.dateOfBirth), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Employment Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Employment Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Department
              </Typography>
              <Typography variant="body1">
                {employee?.employmentInfo?.department}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Position
              </Typography>
              <Typography variant="body1">
                {employee?.employmentInfo?.position}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Date of Joining
              </Typography>
              <Typography variant="body1">
                {format(new Date(employee?.employmentInfo?.dateOfJoining), 'MMM dd, yyyy')}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Employment Type
              </Typography>
              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {employee?.employmentInfo?.employmentType}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Work Schedule
              </Typography>
              <Typography variant="body1">
                {employee?.employmentInfo?.workSchedule?.startTime} -{' '}
                {employee?.employmentInfo?.workSchedule?.endTime}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Compensation */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Compensation
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Basic Salary
              </Typography>
              <Typography variant="body1">
                ₹{employee?.compensation?.basicSalary?.toLocaleString()}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                HRA
              </Typography>
              <Typography variant="body1">
                ₹{employee?.compensation?.allowances?.hra?.toLocaleString()}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Transport Allowance
              </Typography>
              <Typography variant="body1">
                ₹{employee?.compensation?.allowances?.transport?.toLocaleString()}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Medical Allowance
              </Typography>
              <Typography variant="body1">
                ₹{employee?.compensation?.allowances?.medical?.toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Leave Balance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Leave Balance
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Casual Leave
              </Typography>
              <Typography variant="h6" color="primary">
                {employee?.leaveBalance?.casual || 0} days
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Sick Leave
              </Typography>
              <Typography variant="h6" color="primary">
                {employee?.leaveBalance?.sick || 0} days
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Earned Leave
              </Typography>
              <Typography variant="h6" color="primary">
                {employee?.leaveBalance?.earned || 0} days
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeProfile;
