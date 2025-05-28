import SkillProfile from '../models/SkillProfile.js';

// Add a review to a profile
export const addReview = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating value' });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    // Find the profile
    const profile = await SkillProfile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if user has already reviewed
    const existingReview = profile.reviews.find(
      review => review.user.toString() === userId.toString()
    );
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this profile' });
    }

    // Add the review
    profile.reviews.push({
      user: userId,
      rating,
      comment: comment.trim(),
      date: new Date()
    });

    // Calculate new average rating
    const totalRating = profile.reviews.reduce((sum, review) => sum + review.rating, 0);
    profile.rating = totalRating / profile.reviews.length;

    await profile.save();

    // Populate the user details for the new review
    const newReview = profile.reviews[profile.reviews.length - 1];
    await newReview.populate('user', 'name avatar');

    res.status(201).json({
      message: 'Review added successfully',
      review: newReview,
      newRating: profile.rating
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get reviews for a profile
export const getReviews = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const profile = await SkillProfile.findById(profileId)
      .populate('reviews.user', 'name avatar')
      .select('reviews rating');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const reviews = profile.reviews.slice(startIndex, endIndex);

    res.json({
      reviews,
      totalReviews: profile.reviews.length,
      averageRating: profile.rating,
      currentPage: page,
      totalPages: Math.ceil(profile.reviews.length / limit)
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { profileId, reviewId } = req.params;
    const userId = req.user._id;

    const profile = await SkillProfile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Find the review
    const reviewIndex = profile.reviews.findIndex(
      review => review._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the review author or an admin
    const review = profile.reviews[reviewIndex];
    if (review.user.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    // Remove the review
    profile.reviews.splice(reviewIndex, 1);

    // Recalculate average rating
    if (profile.reviews.length > 0) {
      const totalRating = profile.reviews.reduce((sum, review) => sum + review.rating, 0);
      profile.rating = totalRating / profile.reviews.length;
    } else {
      profile.rating = 0;
    }

    await profile.save();

    res.json({ message: 'Review deleted successfully', newRating: profile.rating });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 