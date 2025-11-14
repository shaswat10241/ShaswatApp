import { create } from "zustand";
import { Shop, ShopFormData } from "../models/Shop";
import { shopDB } from "./database";

interface ShopStore {
  shops: Shop[];
  loading: boolean;
  error: string | null;

  // Actions
  addShop: (shopData: ShopFormData) => Promise<Shop>;
  fetchShops: () => Promise<Shop[]>;
  updateShopStatus: () => Promise<void>;
  deleteShop: (shopId: string) => Promise<void>;
  getShopsByLocation: (
    latitude: number,
    longitude: number,
    radiusKm: number,
  ) => Shop[];
}

export const useShopStore = create<ShopStore>((set, get) => ({
  shops: [],
  loading: false,
  error: null,

  addShop: async (shopData: ShopFormData) => {
    try {
      set({ loading: true, error: null });

      const newShop: Shop = {
        id: Date.now().toString(), // Generate a temporary ID
        ...shopData,
        isNew: true,
        createdAt: new Date(),
        latitude: shopData.latitude,
        longitude: shopData.longitude,
      };

      // Save to IndexedDB
      await shopDB.addShop(newShop);

      set((state) => ({
        shops: [...state.shops, newShop],
        loading: false,
      }));

      return newShop;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },

  fetchShops: async () => {
    try {
      set({ loading: true, error: null });

      // Fetch shops from IndexedDB
      const shops = await shopDB.getAllShops();

      set({ shops, loading: false });
      return shops;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },

  updateShopStatus: async () => {
    try {
      set({ loading: true, error: null });

      // Find shops that are marked as new but were created more than 7 days ago
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const updatedShops = get().shops.map((shop) => {
        if (shop.isNew && shop.createdAt < oneWeekAgo) {
          return { ...shop, isNew: false };
        }
        return shop;
      });

      // Update shops in IndexedDB
      for (const shop of updatedShops) {
        if (
          shop.isNew === false &&
          get().shops.find((s) => s.id === shop.id)?.isNew === true
        ) {
          await shopDB.updateShop(shop);
        }
      }

      set({ shops: updatedShops, loading: false });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },

  deleteShop: async (shopId: string) => {
    try {
      set({ loading: true, error: null });

      // Delete from database
      await shopDB.deleteShop(shopId);

      // Remove from local state
      set((state) => ({
        shops: state.shops.filter((shop) => shop.id !== shopId),
        loading: false,
      }));
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },

  // Helper function to calculate distance between two coordinates in km using Haversine formula
  getShopsByLocation: (
    latitude: number,
    longitude: number,
    radiusKm: number,
  ) => {
    const shops = get().shops;

    return shops.filter((shop) => {
      if (!shop.latitude || !shop.longitude) return false;

      // Haversine formula to calculate distance
      const R = 6371; // Earth's radius in km
      const dLat = ((shop.latitude - latitude) * Math.PI) / 180;
      const dLon = ((shop.longitude - longitude) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((shop.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return distance <= radiusKm;
    });
  },
}));
