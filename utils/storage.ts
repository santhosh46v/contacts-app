import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteContact {
  userId: string;
  timestamp: number;
  contact: {
    id: string;
    name: {
      first: string;
      last: string;
    };
    email: string;
    phone: string;
    picture: {
      large: string;
      medium: string;
      thumbnail: string;
    };
  };
}

const FAVORITES_KEY = 'favorites';

export const saveFavorite = async (userId: string, contact: any): Promise<void> => {
  try {
    const existingFavorites = await getFavorites();
    const favoriteContact: FavoriteContact = {
      userId,
      timestamp: Date.now(),
      contact
    };
    
    const updatedFavorites = existingFavorites.filter(fav => fav.userId !== userId);
    updatedFavorites.push(favoriteContact);
    
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error saving favorite:', error);
  }
};

export const removeFavorite = async (userId: string): Promise<void> => {
  try {
    const existingFavorites = await getFavorites();
    const updatedFavorites = existingFavorites.filter(fav => fav.userId !== userId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
};

export const getFavorites = async (): Promise<FavoriteContact[]> => {
  try {
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const isFavorite = async (userId: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.some(fav => fav.userId === userId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};
