export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem('rental_favorites');
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
};

export const addFavorite = (listingId) => {
  try {
    const favorites = getFavorites();
    if (!favorites.includes(listingId)) {
      favorites.push(listingId);
      localStorage.setItem('rental_favorites', JSON.stringify(favorites));
    }
    return favorites;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return [];
  }
};

export const removeFavorite = (listingId) => {
  try {
    const favorites = getFavorites();
    const updated = favorites.filter(id => id !== listingId);
    localStorage.setItem('rental_favorites', JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return [];
  }
};

export const isFavorite = (listingId) => {
  const favorites = getFavorites();
  return favorites.includes(listingId);
};
