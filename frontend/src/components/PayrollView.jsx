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
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import api from '../services/api';
import authService from '../services/authService';
import { format } from 'date-fns';

const PayrollView = () => {
  const [loading, setLoading] = useState(true);
  const [payrolls, setPayrolls] = useState([]);
  const [error, setError] = useState('');
  const user = authService.getCurrentUser();

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/payroll/employee/${user.id}`);
      setPayrolls(response.data.data || []);
    } catch (err) {
      setError(err || 'Failed to load payroll data');
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

  const latestPayroll = payrolls[0];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Payroll
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Latest Payroll Summary */}
      {latestPayroll && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Gross Salary
                </Typography>
                <Typography variant="h4" color="primary">
                  ₹{latestPayroll.grossSalary?.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {format(new Date(latestPayroll.payPeriod.year, latestPayroll.payPeriod.month - 1), 'MMMM yyyy')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Deductions
                </Typography>
                <Typography variant="h4" color="error">
                  ₹{latestPayroll.totalDeductions?.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Taxes & Other Deductions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Net Salary
                </Typography>
                <Typography variant="h4" color="success.main">
                  ₹{latestPayroll.netSalary?.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Take Home Pay
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Payroll History */}
      <Paper>
        <Box p={2}>
          <Typography variant="h6">Payroll History</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Month/Year</strong></TableCell>
                <TableCell><strong>Present Days</strong></TableCell>
                <TableCell><strong>Gross Salary</strong></TableCell>
                <TableCell><strong>Deductions</strong></TableCell>
                <TableCell><strong>Net Salary</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No payroll records found.
                  </TableCell>
                </TableRow>
              ) : (
                payrolls.map((payroll) => (
                  <TableRow key={payroll._id}>
                    <TableCell>
                      {format(
                        new Date(payroll.payPeriod.year, payroll.payPeriod.month - 1),
                        'MMMM yyyy'
                      )}
                    </TableCell>
                    <TableCell>{payroll.attendance.presentDays}</TableCell>
                    <TableCell>₹{payroll.grossSalary?.toLocaleString()}</TableCell>
                    <TableCell>₹{payroll.totalDeductions?.toLocaleString()}</TableCell>
                    <TableCell>
                      <strong>₹{payroll.netSalary?.toLocaleString()}</strong>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payroll.status?.toUpperCase()}
                        color={
                          payroll.status === 'paid'
                            ? 'success'
                            : payroll.status === 'approved'
                            ? 'primary'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PayrollView;
