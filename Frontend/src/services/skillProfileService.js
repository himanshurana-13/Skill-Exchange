import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getSkillProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/skillprofiles`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get skill profile' };
  }
};

export const updateSkillProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/skillprofiles`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update skill profile' };
  }
};

export const uploadPortfolioItem = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/skillprofiles/portfolio`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload portfolio item' };
  }
};

export const deletePortfolioItem = async (index) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/skillprofiles/portfolio/${index}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete portfolio item' };
  }
}; 