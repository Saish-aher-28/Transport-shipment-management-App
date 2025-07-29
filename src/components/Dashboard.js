import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, where, getDoc, setDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  LinearProgress,
  Snackbar,
  Alert,
  Tooltip,
  Fade,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Fab,
  Slide,
  Zoom,
  Menu,
  Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SpeedIcon from '@mui/icons-material/Speed';
import {
  LocationOn,
  DirectionsCar,
  LocalGasStation,
  Inventory,
  Visibility,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  AttachMoney as AttachMoneyIcon,
  Edit as EditIcon,
  DirectionsCar as DirectionsCarIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as ExitToAppIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import LoadingScreen from './LoadingScreen';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, isWithinInterval, parseISO } from 'date-fns';

const StatsCard = ({ icon: Icon, title, value, color }) => (
  <Paper
    sx={{
      p: { xs: 2, sm: 3 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: 'white',
      borderRadius: 2,
      height: '100%',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 16px ${color}40`,
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Icon sx={{ fontSize: { xs: 24, sm: 28 }, mr: 1 }} />
      <Typography variant="body1" sx={{ opacity: 0.9 }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" sx={{ 
      fontWeight: 'bold', 
      fontSize: { xs: '1.5rem', sm: '2rem' },
      mt: 'auto'
    }}>
      {value}
    </Typography>
  </Paper>
);

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterValue, setFilterValue] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userName, setUserName] = useState('');
  const [user, authLoading] = useAuthState(auth);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newRecord, setNewRecord] = useState({
    vehicleNumber: '',
    lrNumber: '',
    driverName: '',
    startDestination: '',
    endDestination: '',
    fuelRequired: '',
    driverPayment: '',
    advancedPayment: '0',
    goods: '',
    date: new Date().toISOString().split('T')[0],
    totalAmount: '',
    hasAdvancedPayment: false
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  console.log('Dashboard State:', { user, authLoading, isLoading, error }); // Add this for debugging

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenMenu(false);
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
    if (!user) {
          setRecords([]);
          setIsLoading(false);
      return;
    }

        const userDocRef = doc(db, 'data', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const records = userData.transportRecords || [];
          setRecords(records);
        } else {
          // Initialize user document if it doesn't exist
          const initialData = {
            userData: {
              name: user.displayName || '',
              email: user.email,
              createdAt: new Date().toISOString()
            },
            transportRecords: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          await setDoc(userDocRef, initialData);
          setRecords([]);
        }
      } catch (err) {
        console.error('Error fetching records:', err);
        setError('Failed to load records. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserName = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'data', user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().userData.name || user.displayName || 'User');
          }
        } catch (err) {
          console.error('Error fetching user name:', err);
          setUserName(user.displayName || 'User');
        }
      }
    };

    fetchRecords();
    fetchUserName();
  }, [user]);

  // Initialize editingRecord with default values
  useEffect(() => {
    if (editingRecord === null) {
      setEditingRecord({
        vehicleNumber: '',
        lrNumber: '',
        driverName: '',
        startDestination: '',
        endDestination: '',
        fuelRequired: '',
        driverPayment: '',
        advancedPayment: '0',
        goods: '',
        date: new Date().toISOString().split('T')[0],
        totalAmount: '',
        hasAdvancedPayment: false
      });
    }
  }, [editingRecord]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setNewRecord({
      vehicleNumber: '',
      lrNumber: '',
      driverName: '',
      startDestination: '',
      endDestination: '',
      fuelRequired: '',
      driverPayment: '',
      advancedPayment: '0',
      goods: '',
      date: new Date().toISOString().split('T')[0],
      totalAmount: '',
      hasAdvancedPayment: false
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!newRecord.driverName || !newRecord.startDestination || !newRecord.endDestination || 
          !newRecord.fuelRequired || !newRecord.goods || !newRecord.date || !newRecord.totalAmount) {
        showSnackbar('Please fill in all required fields', 'error');
        return;
      }

      // Create new record with proper structure
      const newRecordData = {
        ...newRecord,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Convert string values to numbers where needed
        fuelRequired: parseFloat(newRecord.fuelRequired),
        driverPayment: parseFloat(newRecord.driverPayment),
        advancedPayment: newRecord.hasAdvancedPayment ? parseFloat(newRecord.advancedPayment) : 0,
        totalAmount: parseFloat(newRecord.totalAmount)
      };

      // Optimistically update UI
      setRecords(prevRecords => [...prevRecords, newRecordData]);
      setDialogOpen(false);
      showSnackbar('Adding record...', 'info');

      const userDocRef = doc(db, 'data', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
      const currentData = userDoc.data();
      const currentRecords = currentData.transportRecords || [];
        const updatedRecords = [...currentRecords, newRecordData];

        // Use batch write for better performance
        const batch = writeBatch(db);
        batch.update(userDocRef, {
          transportRecords: updatedRecords,
          updatedAt: new Date().toISOString()
        });
        await batch.commit();
      } else {
        // If document doesn't exist, create it with initial data
        const batch = writeBatch(db);
        batch.set(userDocRef, {
          userData: {
            name: user.displayName || '',
            email: user.email,
            createdAt: new Date().toISOString()
          },
          transportRecords: [newRecordData],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        await batch.commit();
      }

      showSnackbar('Record added successfully!', 'success');
      
      // Reset form
      setNewRecord({
        vehicleNumber: '',
        lrNumber: '',
        driverName: '',
        startDestination: '',
        endDestination: '',
        fuelRequired: '',
        driverPayment: '',
        advancedPayment: '0',
        goods: '',
        date: new Date().toISOString().split('T')[0],
        totalAmount: '',
        hasAdvancedPayment: false
      });
    } catch (error) {
      console.error('Error adding record:', error);
      // Revert optimistic update on error
      setRecords(prevRecords => prevRecords.filter(r => r.id !== Date.now().toString()));
      showSnackbar('Error adding record: ' + error.message, 'error');
    }
  };

  const handleDeleteRecord = async (record) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Optimistically update UI
      setRecords(prevRecords => prevRecords.filter(r => r.id !== record.id));
      showSnackbar('Deleting record...', 'info');

      const userDocRef = doc(db, 'data', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
      const currentData = userDoc.data();
      const currentRecords = currentData.transportRecords || [];
        const updatedRecords = currentRecords.filter(r => r.id !== record.id);

        // Use batch write for better performance
        const batch = writeBatch(db);
        batch.update(userDocRef, {
          transportRecords: updatedRecords,
          updatedAt: new Date().toISOString()
        });
        await batch.commit();

      showSnackbar('Record deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      // Revert optimistic update on error
      setRecords(prevRecords => [...prevRecords, record]);
      showSnackbar('Error deleting record: ' + error.message, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = filterValue === '' || 
      record.driverName.toLowerCase().includes(filterValue.toLowerCase()) ||
      record.startDestination.toLowerCase().includes(filterValue.toLowerCase()) ||
      record.endDestination.toLowerCase().includes(filterValue.toLowerCase());

    // Convert record date to Date object for comparison
    const recordDate = new Date(record.date);
    
    // Handle date filtering
    let matchesDateRange = true;
    if (startDate && endDate) {
      // Set time to start of day for start date and end of day for end date
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      matchesDateRange = recordDate >= start && recordDate <= end;
    } else if (startDate) {
      // Only start date is selected
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      matchesDateRange = recordDate >= start;
    } else if (endDate) {
      // Only end date is selected
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesDateRange = recordDate <= end;
    }

    return matchesSearch && matchesDateRange;
  });

  const stats = {
    totalTrips: records.length,
    totalFuel: records.reduce((sum, r) => sum + (parseFloat(r.fuelRequired) || 0), 0).toFixed(2),
    totalPayment: records.reduce((sum, r) => sum + (parseFloat(r.totalAmount) || 0), 0).toFixed(2),
    totalDriverPayment: records.reduce((sum, r) => sum + (parseFloat(r.driverPayment) || 0), 0).toFixed(2),
    overallProfit: records.reduce((sum, r) => {
      const profit = (parseFloat(r.totalAmount) || 0) - (parseFloat(r.fuelRequired) || 0) - (parseFloat(r.driverPayment) || 0);
      return sum + profit;
    }, 0).toFixed(2)
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setDetailDialogOpen(true);
  };

  const handleEditRecord = async () => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!editingRecord.driverName || !editingRecord.startDestination || !editingRecord.endDestination || 
          !editingRecord.fuelRequired || !editingRecord.goods || !editingRecord.date || !editingRecord.totalAmount) {
        showSnackbar('Please fill in all required fields', 'error');
        return;
      }

      // Optimistically update UI
      const updatedRecord = {
        ...editingRecord,
        updatedAt: new Date().toISOString(),
        fuelRequired: parseFloat(editingRecord.fuelRequired),
        driverPayment: parseFloat(editingRecord.driverPayment),
        advancedPayment: editingRecord.hasAdvancedPayment ? parseFloat(editingRecord.advancedPayment) : 0,
        totalAmount: parseFloat(editingRecord.totalAmount)
      };

      setRecords(prevRecords => 
        prevRecords.map(record => 
          record.id === editingRecord.id ? updatedRecord : record
        )
      );
      setEditDialogOpen(false);
      showSnackbar('Updating record...', 'info');

      const userDocRef = doc(db, 'data', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
      const currentData = userDoc.data();
      const currentRecords = currentData.transportRecords || [];
        const recordIndex = currentRecords.findIndex(r => r.id === editingRecord.id);

        if (recordIndex !== -1) {
      const updatedRecords = [...currentRecords];
          updatedRecords[recordIndex] = updatedRecord;

          // Use batch write for better performance
          const batch = writeBatch(db);
          batch.update(userDocRef, {
            transportRecords: updatedRecords,
            updatedAt: new Date().toISOString()
          });
          await batch.commit();

      showSnackbar('Record updated successfully', 'success');
        }
      }
    } catch (error) {
      console.error('Error updating record:', error);
      // Revert optimistic update on error
      setRecords(prevRecords => 
        prevRecords.map(record => 
          record.id === editingRecord.id ? editingRecord : record
        )
      );
      showSnackbar(error.message || 'Error updating record. Please try again.', 'error');
    }
  };

  const handleEditClick = (record, e) => {
    e.stopPropagation(); // Prevent card click event
    setEditingRecord({
      ...record,
      // Convert numbers back to strings for the form
      fuelRequired: record.fuelRequired.toString(),
      driverPayment: record.driverPayment.toString(),
      advancedPayment: record.advancedPayment.toString(),
      totalAmount: record.totalAmount.toString()
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = async (record, e) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent any parent click events
    
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await handleDeleteRecord(record);
      } catch (error) {
        console.error('Error in delete click handler:', error);
        showSnackbar('Error deleting record', 'error');
      }
    }
  };

  // Add animation delay calculation
  const getAnimationDelay = (index) => {
    return (index % 10) * 100; // Stagger animation for each card
  };

  const handleProfileView = () => {
    navigate('/profile');
    handleClose();
  };

  // Add error boundary
  if (!user && !authLoading) {
    navigate('/login');
    return null;
  }

  if (isLoading || authLoading) {
    return <LoadingScreen />;
  }

  if (error) {
  return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Dashboard
        </Typography>
        <Typography color="text.secondary">
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="fixed" 
        sx={{
          background: 'linear-gradient(135deg, #00B4FF 0%, #0091ea 100%)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Slide direction="down" in={true} timeout={500}>
          <Toolbar sx={{ 
            minHeight: { xs: '64px', sm: '64px' },
            px: { xs: 2, sm: 3 },
            gap: 2,
          }}>
            <LocalShippingIcon 
              sx={{
                fontSize: { xs: 28, sm: 32 },
                color: 'white',
              }} 
            />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 600,
                letterSpacing: '0.02em',
                color: 'white',
              }}
            >
              Pratik Enterprises
              <Typography 
                component="span" 
                sx={{ 
                  ml: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  opacity: 0.8,
                  fontWeight: 400,
                  background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.05em'
                }}
              >
                Kasata
              </Typography>
            </Typography>
            <IconButton 
              onClick={handleProfileClick}
              sx={{
                p: 1,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <Avatar sx={{ 
                bgcolor: 'primary.dark', 
                width: 32, 
                height: 32,
                fontSize: '1rem',
              }}>
                {userName ? userName[0].toUpperCase() : 'U'}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  position: 'fixed',
                  top: { xs: 'auto', sm: 'auto' },
                  bottom: { xs: 0, sm: 'auto' },
                  left: { xs: 0, sm: 'auto' },
                  right: { xs: 0, sm: 'auto' },
                  width: { xs: '100%', sm: 'auto' },
                  maxWidth: { xs: '100%', sm: 'auto' },
                  borderRadius: { xs: '16px 16px 0 0', sm: '8px' },
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfileView}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
        </Toolbar>
        </Slide>
      </AppBar>

      {/* Add top spacing to account for fixed AppBar */}
      <Box sx={{ height: { xs: '64px', sm: '64px' } }} />

      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 2 },
          mb: { xs: 7, sm: 4 }, // Add bottom margin for FAB on mobile
        }}
      >
        <Fade in={true} timeout={800}>
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid item xs={6} sm={6} md={3}>
                <StatsCard
                  icon={LocalShippingIcon}
                  title="Total Trips"
                  value={stats.totalTrips}
                  color="#2196F3"
                />
          </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <StatsCard
                  icon={LocalGasStation}
                  title="Total Fuel Amount"
                  value={`₹${stats.totalFuel}`}
                  color="#FF9800"
                />
          </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <StatsCard
                  icon={AttachMoneyIcon}
                  title="Total Payment"
                  value={`₹${stats.totalPayment}`}
                  color="#9C27B0"
                />
          </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Paper
                  sx={{
                    p: { xs: 2, sm: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
              height: '100%', 
                    background: parseFloat(stats.overallProfit) >= 0 
                      ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                      : 'linear-gradient(135deg, #f44336 0%, #e31b0c 100%)',
              color: 'white',
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                      boxShadow: parseFloat(stats.overallProfit) >= 0 
                        ? '0 8px 16px rgba(76, 175, 80, 0.25)'
                        : '0 8px 16px rgba(244, 67, 54, 0.25)',
                    },
                  }}
                >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoneyIcon sx={{ fontSize: { xs: 24, sm: 28 }, mr: 1 }} />
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Overall Profit/Loss
                    </Typography>
                </Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    mt: 'auto'
                  }}>
                    ₹{stats.overallProfit}
                  </Typography>
                </Paper>
          </Grid>
        </Grid>
          </Box>
        </Fade>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            mb: { xs: 2, sm: 3 },
          }}
        >
        <Box sx={{ 
          display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
          }}>
            <Box sx={{ 
            display: 'flex',
              gap: 2,
              flex: 1,
              flexDirection: { xs: 'column', sm: 'row' },
            }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search records..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
            sx={{
                  flex: 2,
                  '& .MuiOutlinedInput-root': {
              borderRadius: 2,
                  }
                }}
              />
              <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                  displayEmpty
                size="small"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Records</MenuItem>
                  <MenuItem value="driver">Filter by Driver</MenuItem>
                  <MenuItem value="start">Filter by Start Location</MenuItem>
                  <MenuItem value="end">Filter by End Location</MenuItem>
              </Select>
            </FormControl>
            </Box>

            <Box sx={{ 
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              minWidth: { sm: '40%' },
            }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }
                  }
                }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={startDate}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                  }
                }
              }}
            />
          </Box>
          </Box>

          {(startDate || endDate) && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
                startIcon={<DeleteIcon />}
                sx={{ borderRadius: 2 }}
              >
                Clear Dates
              </Button>
            </Box>
          )}
        </Paper>

        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
              display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.primary',
            fontWeight: 600,
          }}
        >
          <LocalShippingIcon sx={{ color: 'primary.main' }} />
          Transport Records
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{
              ml: 'auto',
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }
            }}
          >
            Add New Record
          </Button>
        </Typography>

        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {filteredRecords.map((record, index) => (
            <Grid item xs={12} sm={6} md={4} key={record.createdAt}>
              <Zoom in={true} timeout={500} style={{ transitionDelay: `${getAnimationDelay(index)}ms` }}>
              <Card 
                sx={{ 
                    height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    borderRadius: { xs: 3, sm: 2 },
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: { 
                      xs: '0 2px 8px rgba(0,0,0,0.1)',
                      sm: 1 
                    },
                    '&:active': {
                      transform: { xs: 'scale(0.98)', sm: 'none' },
                    },
                  '&:hover': {
                      transform: { xs: 'none', sm: 'translateY(-4px)' },
                      boxShadow: { xs: 2, sm: 4 },
                    },
                  }}
                  onClick={() => handleViewDetails(record)}
                >
                  <CardContent 
                    sx={{ 
                  flexGrow: 1, 
                      position: 'relative',
                      '@media (max-width: 600px)': {
                        p: 2,
                      },
                    }}
                  >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                      mb: 2,
                      pb: 1,
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                    }}>
                      <Box>
                        <Typography 
                          variant="h6" 
                          component="div" 
                          sx={{ 
                            fontWeight: 'bold',
                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                          }}
                        >
                      {record.driverName}
                    </Typography>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mt: 0.5
                          }}
                        >
                          <DirectionsCarIcon sx={{ fontSize: '1rem' }} />
                          {record.vehicleNumber || 'No Vehicle Number'}
                          {record.lrNumber && (
                    <Chip 
                              label={`LR: ${record.lrNumber}`}
                      size="small" 
                              color="info"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={(e) => handleEditClick(record, e)}
                          size="small"
                      sx={{
                            color: 'primary.main',
                            transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'white',
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={(e) => handleDeleteClick(record, e)}
                          size="small"
                          sx={{
                            color: 'error.main',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'error.main',
                              color: 'white',
                              transform: 'scale(1.1) rotate(8deg)',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                  </Box>
                  
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        From: {record.startDestination}
                    </Typography>
                  </Box>
                  
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                        To: {record.endDestination}
                    </Typography>
                  </Box>
                  
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocalGasStation sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Fuel Amount: ₹{record.fuelRequired}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Inventory sx={{ mr: 1, color: 'info.main' }} />
                      <Typography variant="body2" color="text.secondary">
                      Goods: {record.goods}
                    </Typography>
                  </Box>
                  
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ mr: 1, color: 'info.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Driver Payment: ₹{record.driverPayment}
                          {record.hasAdvancedPayment && record.advancedPayment && (
                            <span style={{ color: '#f44336' }}> (Advanced: ₹{record.advancedPayment})</span>
                          )}
                        </Typography>
                        {record.hasAdvancedPayment && record.advancedPayment && (
                          <Typography variant="body2" sx={{ color: '#2196F3', fontWeight: 'medium', mt: 0.5 }}>
                            Remaining: ₹{(parseFloat(record.driverPayment) - parseFloat(record.advancedPayment)).toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Total Amount Received: ₹{record.totalAmount}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Date: {record.date}
                      </Typography>
                    </Box>

                    {/* Add Profit/Loss Display */}
                    {record.totalAmount && record.fuelRequired && record.driverPayment && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                        mt: 1,
                        pt: 1,
                        borderTop: '1px dashed rgba(0,0,0,0.1)'
                      }}>
                        <AttachMoneyIcon sx={{ mr: 1 }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: (parseFloat(record.totalAmount) - parseFloat(record.fuelRequired) - parseFloat(record.driverPayment)) >= 0 
                              ? 'success.main' 
                              : 'error.main'
                          }}
                        >
                          Profit/Loss: ₹{(parseFloat(record.totalAmount) - parseFloat(record.fuelRequired) - parseFloat(record.driverPayment)).toFixed(2)}
                    </Typography>
                  </Box>
                    )}
                </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        <Zoom in={true} timeout={500}>
          <Fab
                      color="primary" 
            aria-label="add"
            onClick={handleOpenDialog}
                      sx={{
              position: 'fixed',
              bottom: { xs: 16, sm: 16 },
              right: { xs: 16, sm: 16 },
              background: 'linear-gradient(135deg, #00B4FF 30%, #00E5FF 90%)',
              width: { xs: 56, sm: 56 },
              height: { xs: 56, sm: 56 },
              boxShadow: '0 4px 12px rgba(0, 180, 255, .4)',
              '&:active': {
                transform: { xs: 'scale(0.95)', sm: 'none' },
              },
                        '&:hover': {
                transform: { xs: 'none', sm: 'scale(1.1)' },
                boxShadow: '0 6px 16px rgba(0, 180, 255, .5)',
              },
            }}
          >
            <AddIcon />
          </Fab>
        </Zoom>

        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
          fullScreen={window.innerWidth < 600} // Make dialog fullscreen on mobile
          PaperProps={{
            sx: {
              borderRadius: { xs: 0, sm: 2 },
              m: { xs: 0, sm: 2 },
              '& .MuiDialogTitle-root': {
                background: 'linear-gradient(135deg, #00B4FF 0%, #0091ea 100%)',
                color: 'white',
                py: { xs: 2, sm: 2 },
                px: { xs: 2, sm: 3 },
              }
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              position: 'relative',
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseDialog}
                      sx={{
                display: { xs: 'flex', sm: 'none' },
                position: 'absolute',
                left: 8,
              }}
            >
              <ArrowBackIcon />
                    </IconButton>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              width: '100%',
              justifyContent: { xs: 'center', sm: 'flex-start' },
            }}>
              <AddIcon />
              Add New Record
            </Box>
          </DialogTitle>
          <form onSubmit={handleAddRecord}>
          <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                <TextField
                  fullWidth
                    label="Vehicle Number"
                    name="vehicleNumber"
                    value={newRecord.vehicleNumber}
                    onChange={handleInputChange}
                  required
                    margin="dense"
                  InputProps={{
                      startAdornment: (
                        <DirectionsCarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                  }}
                />
              </Grid>
                <Grid item xs={12}>
                <TextField
                  fullWidth
                    label="LR Number"
                    name="lrNumber"
                    value={newRecord.lrNumber}
                    onChange={handleInputChange}
                  required
                    margin="dense"
                  InputProps={{
                      startAdornment: (
                        <Inventory sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                  }}
                />
              </Grid>
                <Grid item xs={12}>
                <TextField
                  fullWidth
                    label="Driver Name"
                    name="driverName"
                    value={newRecord.driverName}
                    onChange={handleInputChange}
                  required
                    margin="dense"
                  InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                    label="Start Destination"
                    name="startDestination"
                    value={newRecord.startDestination}
                    onChange={handleInputChange}
                  required
                    margin="dense"
                  InputProps={{
                      startAdornment: (
                        <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                      ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                    label="End Destination"
                    name="endDestination"
                    value={newRecord.endDestination}
                    onChange={handleInputChange}
                  required
                    margin="dense"
                  InputProps={{
                      startAdornment: (
                        <LocationOn sx={{ mr: 1, color: 'secondary.main' }} />
                      ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                    label="Fuel Amount"
                    name="fuelRequired"
                    type="number"
                    value={newRecord.fuelRequired}
                    onChange={handleInputChange}
                  required
                    margin="dense"
                  InputProps={{
                      startAdornment: (
                        <LocalGasStation sx={{ mr: 1, color: 'warning.main' }} />
                      ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                    label="Driver Payment"
                    name="driverPayment"
                  type="number"
                    value={newRecord.driverPayment}
                    onChange={handleInputChange}
                    required
                    margin="dense"
                  InputProps={{
                      startAdornment: (
                        <AttachMoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                      ),
                  }}
                />
              </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newRecord.hasAdvancedPayment}
                        onChange={(e) => setNewRecord(prev => ({
                          ...prev,
                          hasAdvancedPayment: e.target.checked
                        }))}
                        name="hasAdvancedPayment"
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoneyIcon color="primary" />
                        Advanced Payment
                </Box>
                    }
                  />
                </Grid>
                {newRecord.hasAdvancedPayment && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Advanced Payment Amount"
                      name="advancedPayment"
                      type="number"
                      value={newRecord.advancedPayment}
                      onChange={handleInputChange}
                      required
                      margin="dense"
                      InputProps={{
                        startAdornment: (
                          <AttachMoneyIcon sx={{ mr: 1, color: 'error.main' }} />
                        ),
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Goods"
                    name="goods"
                    value={newRecord.goods}
                    onChange={handleInputChange}
                    required
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <Inventory sx={{ mr: 1, color: 'info.main' }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Total Amount Received"
                    name="totalAmount"
                    type="number"
                    value={newRecord.totalAmount}
                    onChange={handleInputChange}
                    required
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <AttachMoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date"
                    name="date"
                    type="date"
                    value={newRecord.date}
                    onChange={handleInputChange}
                    required
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
              </Grid>
            </Grid>
          </DialogContent>
            <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button 
                onClick={handleCloseDialog}
                variant="outlined"
                startIcon={<DeleteIcon />}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
              variant="contained"
                startIcon={<AddIcon />}
              sx={{
                  background: 'linear-gradient(45deg, #00B4FF 30%, #0091ea 90%)',
                  color: 'white',
                '&:hover': {
                    background: 'linear-gradient(45deg, #0091ea 30%, #00B4FF 90%)',
                }
              }}
            >
              Add Record
            </Button>
          </DialogActions>
          </form>
        </Dialog>

        {/* Edit Record Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)} 
          maxWidth="sm"
          fullWidth
          fullScreen={window.innerWidth < 600}
          PaperProps={{
            sx: {
              borderRadius: { xs: 0, sm: 2 },
              m: { xs: 0, sm: 2 },
              '& .MuiDialogTitle-root': {
                background: 'linear-gradient(135deg, #00B4FF 0%, #0091ea 100%)',
                color: 'white',
                py: { xs: 2, sm: 2 },
                px: { xs: 2, sm: 3 },
              }
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              position: 'relative',
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setEditDialogOpen(false)}
              sx={{ 
                display: { xs: 'flex', sm: 'none' },
                position: 'absolute',
                left: 8,
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              width: '100%',
              justifyContent: { xs: 'center', sm: 'flex-start' },
            }}>
              <EditIcon />
              Edit Record
            </Box>
          </DialogTitle>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleEditRecord();
          }}>
          <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Vehicle Number"
                    name="vehicleNumber"
                    value={editingRecord?.vehicleNumber || ''}
                    onChange={(e) => setEditingRecord(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    required
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <DirectionsCarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="LR Number"
                    name="lrNumber"
                    value={editingRecord?.lrNumber || ''}
                    onChange={(e) => setEditingRecord(prev => ({ ...prev, lrNumber: e.target.value }))}
                    required
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <Inventory sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Driver Name"
                    name="driverName"
                    value={editingRecord?.driverName || ''}
                    onChange={(e) => setEditingRecord(prev => ({ ...prev, driverName: e.target.value }))}
                    required
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Destination"
                    name="startDestination"
                    value={editingRecord?.startDestination || ''}
                    onChange={(e) => setEditingRecord(prev => ({ ...prev, startDestination: e.target.value }))}
                    required
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End Destination"
                    name="endDestination"
                    value={editingRecord?.endDestination || ''}
                    onChange={(e) => setEditingRecord(prev => ({ ...prev, endDestination: e.target.value }))}
                    required
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <LocationOn sx={{ mr: 1, color: 'secondary.main' }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fuel Amount"
                    name="fuelRequired"
                    type="number"
                    value={editingRecord?.fuelRequired || ''}
                    onChange={(e) => setEditingRecord(prev => ({ ...prev, fuelRequired: e.target.value }))}
                    required
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <LocalGasStation sx={{ mr: 1, color: 'warning.main' }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driver Payment"
                    name="driverPayment"
                    type="number"
                    value={editingRecord?.driverPayment || ''}
                    onChange={(e) => setEditingRecord(prev => ({ ...prev, driverPayment: e.target.value }))}
                    required
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <AttachMoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                        checked={editingRecord?.hasAdvancedPayment || false}
                        onChange={(e) => setEditingRecord(prev => ({
                          ...prev,
                          hasAdvancedPayment: e.target.checked
                        }))}
                        name="hasAdvancedPayment"
                          color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoneyIcon color="primary" />
                        Advanced Payment
                  </Box>
                    }
                  />
                </Grid>
                {editingRecord?.hasAdvancedPayment && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Advanced Payment Amount"
                      name="advancedPayment"
                      type="number"
                      value={editingRecord?.advancedPayment || ''}
                      onChange={(e) => setEditingRecord(prev => ({ ...prev, advancedPayment: e.target.value }))}
                      required
                      margin="dense"
                      InputProps={{
                        startAdornment: (
                          <AttachMoneyIcon sx={{ mr: 1, color: 'error.main' }} />
                        ),
                      }}
                    />
              </Grid>
            )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Goods"
                    name="goods"
                    value={editingRecord?.goods || ''}
                    onChange={(e) => setEditingRecord(prev => ({ ...prev, goods: e.target.value }))}
                    required
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <Inventory sx={{ mr: 1, color: 'info.main' }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Total Amount Received"
                    name="totalAmount"
                    type="number"
                    value={editingRecord?.totalAmount || ''}
                    onChange={(e) => setEditingRecord(prev => ({ ...prev, totalAmount: e.target.value }))}
                    required
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <AttachMoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date"
                    name="date"
                    type="date"
                    value={editingRecord?.date || ''}
                    onChange={(e) => setEditingRecord(prev => ({ ...prev, date: e.target.value }))}
                    required
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
          </DialogContent>
            <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button 
                onClick={() => setEditDialogOpen(false)}
                variant="outlined"
                startIcon={<DeleteIcon />}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
              variant="contained"
                startIcon={<EditIcon />}
              sx={{
                  background: 'linear-gradient(45deg, #00B4FF 30%, #0091ea 90%)',
                  color: 'white',
                '&:hover': {
                    background: 'linear-gradient(45deg, #0091ea 30%, #00B4FF 90%)',
                }
              }}
            >
              Update Record
            </Button>
          </DialogActions>
          </form>
        </Dialog>
      </Container>

        <Snackbar 
          open={snackbar.open} 
        autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
    </Box>
  );
};

export default Dashboard;