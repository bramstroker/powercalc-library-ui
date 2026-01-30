import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { fetchSupporters, Supporter } from '../api/supporters.api';

// Define the rotation interval in milliseconds
const ROTATION_INTERVAL = 5000; // 5 seconds

export const SupporterTicker: React.FC = () => {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const loadSupporters = async () => {
      try {
        const data = await fetchSupporters();
        setSupporters(data);
      } catch (error) {
        console.error('Failed to load supporters:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSupporters();
  }, []);

  // Rotate through supporters
  useEffect(() => {
    if (supporters.length <= 1) return;

    const rotationTimer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % supporters.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(rotationTimer);
  }, [supporters.length]);

  if (loading || supporters.length === 0) {
    return null;
  }

  // Get the current month and year for display
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  // Get the current supporter to display
  const currentSupporter = supporters[currentIndex];

  // Handle case where there are no supporters or the current index is invalid
  if (!currentSupporter) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: theme.palette.primary.dark,
        py: 0.5,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ color: 'white', fontWeight: 'medium' }}>
          {`${currentMonth} ${currentYear} Supporter: `}
        </Typography>

        <Typography 
          variant="body2" 
          sx={{ 
            color: 'white',
            fontWeight: currentSupporter.tier === 'Platinum' ? 'bold' : 'regular',
            px: 1,
            transition: 'opacity 0.5s ease-in-out',
          }}
        >
          {currentSupporter.name} ({currentSupporter.tier})
        </Typography>
      </Box>
    </Box>
  );
};
