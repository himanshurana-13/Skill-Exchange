import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import serviceRequestRoutes from './routes/serviceRequests.js';
import skillProfileRoutes from './routes/skillProfileRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import exchangeRoutes from './routes/exchangeRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected Successfully');
    
    // Drop the unique index on user field in skillprofiles collection
    try {
      const collection = mongoose.connection.db.collection('skillprofiles');
      await collection.dropIndex('user_1');
      console.log('Successfully dropped unique index on user field');
      
      // Create a new non-unique index
      await collection.createIndex({ user: 1 }, { unique: false });
      console.log('Successfully created non-unique index on user field');
    } catch (error) {
      console.log('Index operations completed or not needed:', error.message);
    }
  })
  .catch((error) => {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/skillprofiles", skillProfileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/exchanges', exchangeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
