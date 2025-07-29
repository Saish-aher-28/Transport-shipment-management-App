import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #00B4FF 0%, #0091ea 100%)',
      }}
    >
      <CircularProgress size={60} thickness={4} sx={{ color: 'white' }} />
    </Box>
  );
};

export default LoadingScreen; 