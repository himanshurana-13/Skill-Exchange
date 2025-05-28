import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getExchanges,
  createExchange,
  updateExchangeStatus
} from '../controllers/exchangeController.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Exchange routes are working' });
});

// Get all exchanges for the authenticated user
router.get('/', protect, getExchanges);

// Create a new exchange proposal
router.post('/', protect, createExchange);

// Update exchange status
router.patch('/:id/status', protect, updateExchangeStatus);

export default router; 