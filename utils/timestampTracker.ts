import { FavoriteContact } from './storage';

export const getHourlyFavoritesCount = (favorites: FavoriteContact[]): { hour: string; count: number }[] => {
  const now = new Date();
  const hourlyData: { [key: string]: number } = {};
  
  // Initialize last 6 hours with 0 count
  for (let i = 5; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourKey = hour.getHours().toString().padStart(2, '0') + ':00';
    hourlyData[hourKey] = 0;
  }
  
  // Count favorites for each hour
  favorites.forEach(favorite => {
    const favoriteDate = new Date(favorite.timestamp);
    const hoursDiff = Math.floor((now.getTime() - favoriteDate.getTime()) / (1000 * 60 * 60));
    
    if (hoursDiff >= 0 && hoursDiff < 6) {
      const hourKey = favoriteDate.getHours().toString().padStart(2, '0') + ':00';
      if (hourlyData[hourKey] !== undefined) {
        hourlyData[hourKey]++;
      }
    }
  });
  
  return Object.entries(hourlyData).map(([hour, count]) => ({ hour, count }));
};