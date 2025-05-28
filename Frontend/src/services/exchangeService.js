import axios from 'axios';
import { API_URL } from '../config';

// Get all exchanges for the authenticated user
export const getExchanges = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/exchanges`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching exchanges' };
  }
};

// Create a new exchange proposal
export const createExchange = async (exchangeData) => {
  try {
    const response = await axios.post(`${API_URL}/api/exchanges`, exchangeData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creating exchange' };
  }
};

// Update exchange status
export const updateExchangeStatus = async (exchangeId, status) => {
  try {
    const response = await axios.patch(
      `${API_URL}/api/exchanges/${exchangeId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating exchange status' };
  }
}; 