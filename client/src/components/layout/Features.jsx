import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard'; // Ensure you have the correct icon import
import { motion } from 'framer-motion';
import predictImage from '/Illustration/budget_ana.jpg'; // Replace with actual path
import planning from '/Illustration/planning.jpg'; // Replace with actual path
import dash from '/Illustration/dashboard.jpg'; // Replace with actual path
import chart from '/Illustration/charts.jpg'; // Replace with actual path
import InsertChartIcon from '@mui/icons-material/InsertChart';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
// import { Dashboard } from '@mui/icons-material';
const dasIcon = <DashboardIcon></DashboardIcon>; // Replace with actual icon import if needed
const chartIcon = <InsertChartIcon></InsertChartIcon>
const predict = <OnlinePredictionIcon></OnlinePredictionIcon>
const ai = <AutoAwesomeIcon></AutoAwesomeIcon>

const features = [
  {
    title: "AI-Powered Budgeting",
    description: "Smart suggestions based on your spending habits and goals.",
    image: planning,
    emoji: ai, // Replace with actual icon component
  },
  {
    title: "Predict Future Expenses",
    description: "Get monthly budget predictions using intelligent insights.",
    image: predictImage,
    emoji: predict,
  },
  {
    title: "Attractive Dashboard",
    description: "Clean, modern dashboard with summaries and insights.",
    image: dash,
    emoji: dasIcon,
  },
  {
    title: "Rich Chart Support",
    description: "Visualize your data with bar, pie, and trend charts.",
    image: chart,
    emoji: chartIcon,
  },
  

];

const Features = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: 10,
        px: 3,
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: '#f8fafc',
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          mb: 6,
          color: '#00ffd5',
          textShadow: '0 0 8px rgba(0,255,213,0.7)',
        }}
      >
        🚀 Key Features
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card
                sx={{
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  boxShadow: '0 0 20px rgba(0,255,213,0.2)',
                  border: '1px solid rgba(0,255,213,0.4)',
                  overflow: 'hidden',
                  height: '100%',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-10px) scale(1.02)',
                    boxShadow: '0 0 25px rgba(0,255,213,0.5)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="250"
                  cursor="pointer"
                  image={feature.image}
                  alt={feature.title}
                  sx={{ objectFit: 'cover' , width:"35vw" }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: '#00ffd5',
                      mb: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>{feature.emoji}</span> {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#e2e8f0', fontFamily:"Roboto" }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Features;
