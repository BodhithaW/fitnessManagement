const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const bmiRoutes = require('./routes/bmi');
const workoutPlanRoutes = require('./routes/workoutPlan');
const productRoutes = require('./routes/product');
const appointmentRoutes = require('./routes/appointment');
const cartRoutes = require('./routes/cart');
const stressBotRoute = require('./routes/stressBot');




// Initialize express app
const app = express();

// Allow requests from frontend (adjust port if different)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Log environment variables for debugging
console.log('Environment Variables:');
console.log(`- PORT: ${process.env.PORT || '8020 (default)'}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development (default)'}`);
console.log(`- MONGO_URI: ${process.env.MONGO_URI ? '✓ Set' : '✗ Missing - Please create .env file'}`);
console.log("OpenRouter API Key:", process.env.OPENROUTER_API_KEY ? "✓ Loaded" : "✗ Missing");

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bmi', bmiRoutes);
app.use('/api/workout-plan', workoutPlanRoutes);
app.use('/api/products', productRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/stressbot', stressBotRoute);






// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Gym Backend API' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
