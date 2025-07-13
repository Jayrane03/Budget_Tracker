import axios from 'axios';
import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import Spline from '@splinetool/react-spline';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // Icon for categories
import SavingsIcon from '@mui/icons-material/Savings'; // Icon for savings
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; // Icon for income
import PercentIcon from '@mui/icons-material/Percent'; // Icon for percentages
import { motion, AnimatePresence } from 'framer-motion'; // For animations
import "../../Styles/predict.css"
import config from '../../services/helper'; // Assuming this has BASE_URL for your Express backend

const PredictBudget = () => {
  const [income, setIncome] = useState(5000);
  const [budgetData, setBudgetData] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false); // New loading state

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && (user._id || user.id)) {
      setUserId(user._id || user.id);
    } else {
      setError('User not logged in. Please log in to use this feature.');
    }
  }, []);

  const handlePredict = async () => {
    if (!userId) {
      setError('User ID not available. Please log in.');
      return;
    }

    if (income === undefined || income === null || income <= 0) {
      setError('Please enter a valid income amount.');
      return;
    }

    setLoading(true); // Start loading
    setError(null); // Clear previous errors
    setBudgetData(null); // Clear previous data

    try {
      const token = localStorage.getItem('token');
      const endpoint = `${config.BASE_URL}/api/predict-budget`;
      console.log('🔍 Calling Express backend for prediction:', endpoint);

      const res = await axios.post(
        endpoint,
        {
          userId: userId,
          income: Number(income),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Received budget data from API:', res.data);
      setBudgetData(res.data);
    } catch (err) {
      console.error('Error predicting budget:', err.response?.data || err.message);
      setError(
        err.response?.data?.error ||
        'Failed to fetch budget prediction. Please ensure the backend services are running and you have transactions.'
      );
    } finally {
      setLoading(false); // End loading
    }
  };

  // Framer Motion variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger animation for child elements
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <Container
      maxWidth="md"
      className='cont'
      sx={{
        padding: '2rem',
        maxWidth: '1000px',
        display:'flex',
        height:"10-0vh",
        flexDirection: 'column',
        justifyContent:'center',
        alignItems:'center',
        // margin: '0 auto',
        background: '#0f172a', // Dark background
        borderRadius: '16px',
        boxShadow: '0 0 20px #00e6c2', // Neon green glow
        fontFamily: "'Segoe UI', sans-serif",
        color: '#f9fafb', // Light text
        overflow: 'hidden', // For animations
      }}
    >
      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontSize: '2.4rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          textAlign: 'center',
          color: '#00e6c2', // Neon green
          textShadow: '0 0 10px #00e6c2', // Glowing text effect
        }}
      >
        🔮 AI Budget Prediction
      </Typography>

      <Grid
        container
        spacing={4}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, // Stack on small, row on medium+
          justifyContent: 'space-between',
          gap: '2rem',
          flexWrap: 'wrap',
          alignItems: 'flex-start', // Align items to the top
        }}
      >
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              // flex: '1',
              // minWidth: { xs: '100%', md: '300px' }, // Ensure image doesn't get too small
              // width: '80vw',
              display:"block",
              margin:"auto",
              borderRadius: '12px',
              border: '2px solid #334155',
              boxShadow: '0 0 12px rgba(0, 255, 255, 0.1)',
            }}
          >
            {/* <img
              src="/budget_ai.jpg"
              alt="AI Budget"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                objectFit: 'cover', // Ensures image covers the area nicely
              }}
            /> */}
          <div className="">
   <Spline className='spline_robot' scene="https://prod.spline.design/ZwZXfZUVWxf4jrEF/scene.splinecode" />
  

</div>


          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              flex: '1',
              minWidth: { xs: '100%', md: '300px' }, // Ensure results don't get too small
              backgroundColor: '#1e293b', // Darker background for results section
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
             
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <CardContent>
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#00e6c2' }} />
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2, color: '#f87171' }}>
                  {error}
                </Alert>
              )}

              <AnimatePresence>
                {budgetData?.budget_recommendations ? (
                  <motion.div
                    key="predictions"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontSize: '1.5rem', // Slightly larger heading for recommendations
                        color: '#00e6c2', // Neon green
                        marginBottom: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      📊 Budget Recommendations
                    </Typography>

                    <Box
                      sx={{
                        backgroundColor: '#0f172a', // Darker background for summary
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #00e6c2',
                        textAlign: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#a7f3d0' }}>
                        <AttachMoneyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Predicted Total Budget: ${budgetData.total_budget?.toFixed(2)}
                      </Typography>
                      {budgetData.message && (
                        <Typography
                          variant="body2"
                          sx={{
                            marginTop: '1rem',
                            fontStyle: 'italic',
                            color: '#94a3b8', // Muted grey
                            textAlign: 'center',
                          }}
                        >
                          {budgetData.message}
                        </Typography>
                      )}
                    </Box>

                    <List sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {Object.entries(budgetData.budget_recommendations).map(
                        ([category, amount]) => (
                          <motion.li
                            key={category}
                            variants={itemVariants}
                            style={{
                              marginBottom: '0.8rem',
                              padding: '0.8rem 1rem', // More padding
                              borderRadius: '8px',
                              backgroundColor: '#334155', // Slightly lighter dark background
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderLeft: '4px solid #00e6c2', // Accent bar
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 'unset', mr: 1, color: '#00e6c2' }}>
                              {category === 'Savings' ? <SavingsIcon /> : <AccountBalanceWalletIcon />}
                            </ListItemIcon>
                            <ListItemText
                              primary={category}
                              primaryTypographyProps={{ fontWeight: 'bold', color: '#f9fafb' }}
                            />
                            <Typography variant="body1" sx={{ color: '#a7f3d0', fontWeight: 'bold' }}>
                              ${amount.toFixed(2)}
                            </Typography>
                          </motion.li>
                        )
                      )}
                    </List>

                    {budgetData.spending_percentages && Object.keys(budgetData.spending_percentages).length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: '1.2rem',
                            color: '#00e6c2',
                            marginBottom: '1rem',
                            textAlign: 'center',
                          }}
                        >
                          <PercentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Spending Distribution
                        </Typography>
                        <List>
                          {Object.entries(budgetData.spending_percentages).map(([category, percentage]) => (
                            <motion.div
                              key={category}
                              variants={itemVariants}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.4rem 0',
                                borderBottom: '1px dashed #475569', // Subtle separator
                              }}
                            >
                              <Typography sx={{ fontSize: '0.95rem', color: '#cbd5e1' }}>{category}</Typography>
                              <Typography sx={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#a7f3d0' }}>
                                {percentage.toFixed(2)}%
                              </Typography>
                            </motion.div>
                          ))}
                        </List>
                      </Box>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}
                  >
                    <Typography variant="h6">
                      🧠 Predictions will appear here after you click "Predict Budget"
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Ensure you have added some transactions for accurate AI insights!
                    </Typography>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '2rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <TextField
          type="number"
          label="Enter Monthly Income"
          variant="outlined"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          sx={{
            minWidth: '200px',
            '& .MuiInputBase-input': { color: '#f9fafb' }, // Text color
            '& .MuiInputLabel-root': { color: '#94a3b8' }, // Label color
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' }, // Border color
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00e6c2' }, // Hover border
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00e6c2' }, // Focused border
          }}
        />
        <Button
          variant="contained"
          onClick={handlePredict}
          disabled={loading || !userId} // Disable button when loading or no user
          sx={{
            backgroundColor: '#3b82f6', // Primary blue
            color: 'white',
            '&:hover': {
              backgroundColor: '#2563eb', // Darker blue on hover
              transform: 'scale(1.05)',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)',
            },
            transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            fontWeight: 'bold',
            padding: '0.6rem 1.2rem',
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Predict Budget'}
        </Button>
      </Box>
    </Container>
  );
};

export default PredictBudget;