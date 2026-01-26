import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'oracle-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    } catch (err) {
      console.error('Failed to save favorites:', err);
    }
  }, [favorites]);

  const toggleFavorite = (oracleId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(oracleId)) {
        newFavorites.delete(oracleId);
      } else {
        newFavorites.add(oracleId);
      }
      return newFavorites;
    });
  };

  const isFavorite = (oracleId: string) => favorites.has(oracleId);

  return { favorites, toggleFavorite, isFavorite };
}
