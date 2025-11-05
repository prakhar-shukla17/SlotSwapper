import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


// Import routes
import authRouter from './routes/auth.routes.js';
import eventRouter from './routes/event.routes.js';
import swapRoutes from './routes/swap.routes.js';

// Initialize express app
const app = express();



// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());



// API Routes
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});




// Mount routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/swaps', swapRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Not Found - ${req.originalUrl}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;