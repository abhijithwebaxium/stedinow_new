import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  Slide,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PAYMENT_TYPES = [
  'Registration Fee',
  'Courier Charges',
  'S.O.P Charge',
  'G.A.P Fee',
  'Delegate Fee',
  'Apostle Embassy Attestation Fee (Including 18% GST)',
  'Visa Processing Fee (Including 18% GST)',
];

const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque', 'Bank Transfer', 'Other'];

const StudentPaymentsModal = ({ open, onClose, student }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [newPayment, setNewPayment] = useState({
    paymentType: 'Registration Fee',
    amount: '',
    paymentMethod: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
    course: '',
    discount: 0,
    notes: '',
  });

  const [totalFees, setTotalFees] = useState({
    total: 0,
    paid: 0,
    remaining: 0,
  });

  useEffect(() => {
    if (open && student) {
      fetchPayments();
    }
  }, [open, student]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/students/${student._id}/payments`,
        { withCredentials: true }
      );
      if (response.data.status === 'success') {
        setPayments(response.data.payments || []);
        calculateTotalFees(response.data.payments || []);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalFees = (paymentsData) => {
    const paidAmount = paymentsData
      .filter(p => p.paymentStatus === 'Paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // You can set total fees based on business logic
    const totalAmount = 50000; // Default or fetch from student record

    setTotalFees({
      total: totalAmount,
      paid: paidAmount,
      remaining: totalAmount - paidAmount,
    });
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount || newPayment.amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const paymentData = {
        paymentType: newPayment.paymentType,
        amount: parseFloat(newPayment.amount),
        paymentMethod: newPayment.paymentMethod,
        paymentDate: newPayment.paymentDate,
        paymentStatus: 'Paid',
        currency: 'INR',
        course: newPayment.course,
        discount: parseFloat(newPayment.discount) || 0,
        notes: newPayment.notes,
      };

      const response = await axios.post(
        `${API_URL}/api/students/${student._id}/payments`,
        paymentData,
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setSuccess('Payment added successfully');
        fetchPayments();
        setShowAddPayment(false);
        setNewPayment({
          paymentType: 'Registration Fee',
          amount: '',
          paymentMethod: 'Cash',
          paymentDate: new Date().toISOString().split('T')[0],
          course: '',
          discount: 0,
          notes: '',
        });

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add payment');
    }
  };

  const handleViewReceipt = (payment) => {
    setSelectedReceipt(payment);
    setTabValue(2); // Switch to receipt tab
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const calculateGST = (amount, paymentType) => {
    const gstApplicableTypes = [
      'File opening fee',
      'Registration fee',
      'Second Installment fee',
      'G.A.P fee',
      'G.A.P installment',
      'Installment Fee Payment',
      'Visa Processing Fee',
    ];

    if (gstApplicableTypes.includes(paymentType)) {
      const baseAmount = Math.floor((amount * (100 / 118)) * 100) / 100;
      const sgst = (baseAmount * 0.09).toFixed(2);
      const cgst = (baseAmount * 0.09).toFixed(2);
      return { baseAmount, sgst, cgst };
    }
    return null;
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    setShowAddPayment(false);
    setSelectedReceipt(null);
    onClose();
  };

  if (!student) return null;

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-receipt,
            #printable-receipt * {
              visibility: visible;
            }
            #printable-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        slots={{
          transition: Transition,
        }}
        keepMounted
      >
        <DialogTitle sx={{ '@media print': { display: 'none' } }}>
          <Box>
            <Typography variant="h6">Payments - {student.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Student ID: {student.studentId}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ '@media print': { padding: 0, margin: 0 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, '@media print': { display: 'none' } }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2, '@media print': { display: 'none' } }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Fee Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3, '@media print': { display: 'none' } }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Fees
                </Typography>
                <Typography variant="h5" color="primary">
                  {formatCurrency(totalFees.total)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Paid Amount
                </Typography>
                <Typography variant="h5" color="success.main">
                  {formatCurrency(totalFees.paid)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Remaining Balance
                </Typography>
                <Typography variant="h5" color="error.main">
                  {formatCurrency(totalFees.remaining)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2, '@media print': { display: 'none' } }}>
          <Tab label="Payment History" />
          <Tab label="Add Payment" />
          {selectedReceipt && <Tab label="Receipt" />}
        </Tabs>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="body2" color="text.secondary">
              Loading payments...
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Payment History Tab */}
            {tabValue === 0 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Payment Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Discount</TableCell>
                      <TableCell>Final Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No payments recorded yet
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment._id}>
                          <TableCell>
                            {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-IN') : '-'}
                          </TableCell>
                          <TableCell>{payment.paymentType}</TableCell>
                          <TableCell>{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>{formatCurrency(payment.discount || 0)}</TableCell>
                          <TableCell fontWeight={600}>
                            {formatCurrency((payment.amount || 0) - (payment.discount || 0))}
                          </TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell>
                            <Chip
                              label={payment.paymentStatus}
                              size="small"
                              color={payment.paymentStatus === 'Paid' ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewReceipt(payment)}
                              title="View Receipt"
                            >
                              <ReceiptIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Add Payment Tab */}
            {tabValue === 1 && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Payment Type"
                      value={newPayment.paymentType}
                      onChange={(e) => setNewPayment({ ...newPayment, paymentType: e.target.value })}
                    >
                      {PAYMENT_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Amount (₹)"
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Discount (₹)"
                      type="number"
                      value={newPayment.discount}
                      onChange={(e) => setNewPayment({ ...newPayment, discount: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Payment Method"
                      value={newPayment.paymentMethod}
                      onChange={(e) => setNewPayment({ ...newPayment, paymentMethod: e.target.value })}
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <MenuItem key={method} value={method}>
                          {method}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Payment Date"
                      type="date"
                      value={newPayment.paymentDate}
                      onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Course"
                      value={newPayment.course}
                      onChange={(e) => setNewPayment({ ...newPayment, course: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={3}
                      value={newPayment.notes}
                      onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddPayment}
                      fullWidth
                    >
                      Add Payment
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Receipt Tab */}
            {tabValue === 2 && selectedReceipt && (
              <Box id="printable-receipt">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2, '@media print': { display: 'none' } }}>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrintReceipt}
                  >
                    Print
                  </Button>
                </Box>

                <Paper sx={{ p: 4 }}>
                  {/* Receipt Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <img
                        src="/StediNow-Logo.png"
                        alt="StediNow Logo"
                        style={{ width: '250px', marginBottom: '16px' }}
                      />
                      <Typography variant="body2">
                        <strong>Phone:</strong> 0484 461 4539, +91 9567 999 4549
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> info@stedinow.com
                      </Typography>
                      <Typography variant="body2">
                        <strong>Website:</strong> www.stedinow.com
                      </Typography>
                      <Typography variant="body2">
                        <strong>Address:</strong> Grace Tower, 1st Floor, Door No. 67/1392,
                      </Typography>
                      <Typography variant="body2">
                        St.Vincent road, Kacheripady, Ernakulam North
                      </Typography>
                      <Typography variant="body2">
                        Kerala, India-682018
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography>
                        <strong>Invoice Date:</strong>{' '}
                        {selectedReceipt.paymentDate ? new Date(selectedReceipt.paymentDate).toLocaleDateString('en-IN') : '-'}
                      </Typography>
                      <Typography>
                        <strong>Bill No:</strong> {selectedReceipt.invoiceNumber || selectedReceipt._id}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" align="center" sx={{ my: 2 }}>
                    <u>RECEIPT</u>
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography><strong>Student Name:</strong> {student.name}</Typography>
                    <Typography><strong>Phone:</strong> {student.phoneCode} {student.phone}</Typography>
                    <Typography><strong>Email:</strong> {student.email}</Typography>
                  </Box>

                  <TableContainer component={Paper} variant="outlined" sx={{ my: 3 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Particulars</strong></TableCell>
                          <TableCell><strong>Course</strong></TableCell>
                          {calculateGST(selectedReceipt.amount, selectedReceipt.paymentType) && (
                            <>
                              <TableCell><strong>Amount</strong></TableCell>
                              <TableCell><strong>SGST@9%</strong></TableCell>
                              <TableCell><strong>CGST@9%</strong></TableCell>
                            </>
                          )}
                          <TableCell><strong>Discount</strong></TableCell>
                          <TableCell><strong>Total</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{selectedReceipt.paymentType}</TableCell>
                          <TableCell>{selectedReceipt.course || '-'}</TableCell>
                          {(() => {
                            const gst = calculateGST(selectedReceipt.amount, selectedReceipt.paymentType);
                            if (gst) {
                              return (
                                <>
                                  <TableCell>{formatCurrency(gst.baseAmount)}</TableCell>
                                  <TableCell>{formatCurrency(gst.sgst)}</TableCell>
                                  <TableCell>{formatCurrency(gst.cgst)}</TableCell>
                                </>
                              );
                            }
                            return null;
                          })()}
                          <TableCell>{formatCurrency(selectedReceipt.discount || 0)}</TableCell>
                          <TableCell>
                            {formatCurrency((selectedReceipt.amount || 0) - (selectedReceipt.discount || 0))}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={calculateGST(selectedReceipt.amount, selectedReceipt.paymentType) ? 6 : 3}>
                            <strong>Total</strong>
                          </TableCell>
                          <TableCell>
                            <strong>
                              {formatCurrency((selectedReceipt.amount || 0) - (selectedReceipt.discount || 0))}
                            </strong>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Typography sx={{ mb: 1 }}>
                    <strong>Total Amount:</strong> {formatCurrency((selectedReceipt.amount || 0) - (selectedReceipt.discount || 0))}
                  </Typography>

                  <Box sx={{ textAlign: 'right', my: 2 }}>
                    <Typography><strong>Received by:</strong> StediNow</Typography>
                    <Typography><strong>Payment mode:</strong> {selectedReceipt.paymentMethod}</Typography>
                    <Typography>
                      <strong>Payment date:</strong>{' '}
                      {selectedReceipt.paymentDate ? new Date(selectedReceipt.paymentDate).toLocaleDateString('en-IN') : '-'}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="body2">Fee once paid will not be refund at any circumstances</Typography>
                    <Typography variant="body2">Cheques are subjected to realisation</Typography>
                    <Typography variant="body2">
                      Legal procedures related to the above said matters will be under the Jurisdiction of Ernakulam
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ '@media print': { display: 'none' } }}>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default StudentPaymentsModal;
