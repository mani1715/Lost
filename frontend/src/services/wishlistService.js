import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const wishlistAPI = {
  // Get user's wishlist
  getWishlist: async () => {
    const response = await axios.get(`${API_URL}/api/wishlist`);
    return response.data;
  },

  // Add to wishlist
  addToWishlist: async (listingId) => {
    const response = await axios.post(`${API_URL}/api/wishlist`, {
      listingId: listingId
    });
    return response.data;
  },

  // Remove from wishlist
  removeFromWishlist: async (listingId) => {
    const response = await axios.delete(`${API_URL}/api/wishlist/${listingId}`);
    return response.data;
  },

  // Check if property is in wishlist (client-side helper)
  isInWishlist: (wishlist, propertyId) => {
    if (!wishlist || !Array.isArray(wishlist)) {
      return false;
    }
    return wishlist.some(item => item.listingId === propertyId || item.listing?._id === propertyId);
  }
};
