import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WishType = 'product' | 'room' | 'service';
interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (id: string | number, type?: WishType) => Promise<void>;
  isInWishlist: (id: string | number, type?: WishType) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'insignia_wishlist';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const currentWishlist = useRef<string[]>([]);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const stored = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        const loaded = Array.isArray(parsed) ? [...new Set(parsed
          .filter(item => typeof item === 'string' || typeof item === 'number')
          .map(item => String(item).includes(':') ? String(item) : `product:${item}`))] : [];
        currentWishlist.current = loaded;
        setWishlist(loaded);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const toggleWishlist = async (id: string | number, type: WishType = 'product') => {
    try {
      const key = `${type}:${id}`;
      const current = currentWishlist.current;
      const newWishlist = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];
      
      currentWishlist.current = newWishlist;
      setWishlist(newWishlist);
      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newWishlist));
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const isInWishlist = (id: string | number, type: WishType = 'product') => wishlist.includes(`${type}:${id}`);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
