import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import exchangeRoutes from './routes/exchangeRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Exchange routes
app.use('/api/exchanges', exchangeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('GET  /');
  console.log('GET  /api/exchanges/test');
  console.log('GET  /api/exchanges');
  console.log('POST /api/exchanges');
  console.log('PATCH /api/exchanges/:id/status');
}); 