import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/reviews`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const reviewService = {
  // Get all reviews for a property
  getReviews: async (propertyId) => {
    const response = await axios.get(`${API_URL}/${propertyId}`);
    return response.data;
  },

  // Create a new review
  createReview: async (propertyId, reviewData) => {
    const response = await axios.post(
      `${API_URL}/${propertyId}`,
      reviewData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    const response = await axios.put(
      `${API_URL}/${reviewId}`,
      reviewData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const response = await axios.delete(
      `${API_URL}/${reviewId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};
