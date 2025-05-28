import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Add a review
export const addReview = async (profileId, reviewData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/reviews/${profileId}`, reviewData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add review' };
  }
};

// Get reviews for a profile
export const getReviews = async (profileId, page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/reviews/${profileId}`, {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get reviews' };
  }
};

// Delete a review
export const deleteReview = async (profileId, reviewId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/reviews/${profileId}/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete review' };
  }
}; 