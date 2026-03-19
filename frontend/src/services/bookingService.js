import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/bookings`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const bookingService = {
  // Create booking request
  createBooking: async (propertyId, message) => {
    const response = await axios.post(
      `${API_URL}/${propertyId}`,
      { message },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get customer bookings
  getCustomerBookings: async () => {
    const response = await axios.get(
      `${API_URL}/customer`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get owner bookings
  getOwnerBookings: async () => {
    const response = await axios.get(
      `${API_URL}/owner`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    const response = await axios.put(
      `${API_URL}/${bookingId}/status`,
      { status },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    const response = await axios.delete(
      `${API_URL}/${bookingId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};
