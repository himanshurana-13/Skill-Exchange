import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addReview,
  getReviews,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Add a review
router.post('/:profileId', addReview);

// Get reviews for a profile
router.get('/:profileId', getReviews);

// Delete a review
router.delete('/:profileId/:reviewId', deleteReview);

export default router; 