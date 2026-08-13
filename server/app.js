import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import hotelRoutes from './routes/hotelRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration (supports deployed Vercel origin and local dev)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://reacthotelbooking.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, serverless)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for production compatibility
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck / API root
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LuxeStay Hotel API is running' });
});

// API Routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 Handler for unrecognized API routes
app.use('/api', (req, res) => {
  res.status(404).json({ status: 'fail', message: 'API Endpoint Not Found' });
});

export default app;
