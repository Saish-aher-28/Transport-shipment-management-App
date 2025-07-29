import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
  IconButton
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Profile = () => {
  const [user, authLoading] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'data', user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data.userData);
        } else {
          const initialUserData = {
            name: user.displayName || '',
            email: user.email,
            createdAt: new Date().toISOString()
          };
          
          await setDoc(doc(db, 'data', user.uid), {
            userData: initialUserData,
            transportRecords: []
          });
          setUserData(initialUserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error fetching user data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateDoc(doc(db, 'data', user.uid), {
        'userData.name': userData.name,
        'userData.updatedAt': new Date().toISOString()
      });
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Error updating profile: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
      py: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)'
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 4,
            position: 'relative'
          }}>
            <IconButton
              onClick={() => navigate('/dashboard')}
              sx={{
                position: 'absolute',
                left: 0,
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ 
              width: '100%',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center'
            }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #1976d2 30%, #64b5f6 90%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <LocalShippingIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #1976d2 30%, #64b5f6 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Profile
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
            p: 3,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(100, 181, 246, 0.1) 100%)',
            border: '1px solid rgba(25, 118, 210, 0.2)',
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#1976d2',
                fontWeight: 600,
                mb: 1
              }}
            >
              Version
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                background: 'linear-gradient(45deg, #1976d2 30%, #64b5f6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                letterSpacing: '0.05em'
              }}
            >
              Kasata
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            Profile Information
          </Typography>
          <form onSubmit={handleUpdateProfile}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={userData?.name || ''}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  required
                  size="small"
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, fontSize: 20, color: '#1976d2' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  size="small"
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, fontSize: 20, color: '#1976d2' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Member Since"
                  value={new Date(userData?.createdAt).toLocaleDateString()}
                  disabled
                  size="small"
                  InputProps={{
                    startAdornment: <CalendarTodayIcon sx={{ mr: 1, fontSize: 20, color: '#1976d2' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      py: 1,
                      px: 4,
                      width: '250px',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      background: 'linear-gradient(45deg, #1976d2 30%, #64b5f6 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 8px rgba(33, 203, 243, .4)',
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Update Profile'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile; 