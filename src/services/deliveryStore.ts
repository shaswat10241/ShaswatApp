import { create } from "zustand";
import {
  Delivery,
  DeliveryStatus,
  StatusUpdate,
  DeliveryFormData,
} from "../models/Delivery";
import { Order } from "../models/Order";
import { shopDB } from "./database";

interface DeliveryStore {
  deliveries: Delivery[];
  currentDelivery: Delivery | null;
  loading: boolean;
  error: string | null;

  // Actions
  addDelivery: (deliveryData: DeliveryFormData) => Promise<Delivery>;
  createDeliveryFromOrder: (order: Order) => Promise<Delivery>;
  fetchDeliveries: () => Promise<Delivery[]>;
  getDeliveryById: (deliveryId: string) => Delivery | null;
  getDeliveryByOrderId: (orderId: string) => Delivery | null;
  updateDeliveryStatus: (
    deliveryId: string,
    newStatus: DeliveryStatus,
    notes?: string,
    updatedBy?: string,
  ) => Promise<Delivery>;
  setCurrentDelivery: (delivery: Delivery | null) => void;
}

export const useDeliveryStore = create<DeliveryStore>((set, get) => ({
  deliveries: [],
  currentDelivery: null,
  loading: false,
  error: null,

  addDelivery: async (deliveryData: DeliveryFormData) => {
    try {
      set({ loading: true, error: null });

      const initialStatus: StatusUpdate = {
        status: deliveryData.status,
        timestamp: new Date(),
        notes: deliveryData.deliveryNotes,
        location: deliveryData.currentLocation,
      };

      const newDelivery: Delivery = {
        id: Date.now().toString(),
        ...deliveryData,
        statusHistory: [initialStatus],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await shopDB.addDelivery(newDelivery);

      set((state) => ({
        deliveries: [...state.deliveries, newDelivery],
        currentDelivery: newDelivery,
        loading: false,
      }));

      return newDelivery;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },

  createDeliveryFromOrder: async (order: Order) => {
    try {
      set({ loading: true, error: null });

      const existingDelivery = get().deliveries.find(
        (delivery) => delivery.orderId === order.id,
      );

      if (existingDelivery) {
        set({ loading: false });
        return existingDelivery;
      }

      const initialStatus: StatusUpdate = {
        status: "Packaging",
        timestamp: new Date(),
        notes: "Order received and processing started",
      };

      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + 3);

      const newDelivery: Delivery = {
        id: Date.now().toString(),
        orderId: order.id || "",
        shopId: order.shopId,
        status: "Packaging",
        currentLocation: "Warehouse",
        estimatedDeliveryDate: estimatedDate,
        trackingNumber: `TR-${Math.floor(100000 + Math.random() * 900000)}`,
        statusHistory: [initialStatus],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await shopDB.addDelivery(newDelivery);

      set((state) => ({
        deliveries: [...state.deliveries, newDelivery],
        currentDelivery: newDelivery,
        loading: false,
      }));

      return newDelivery;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },

  fetchDeliveries: async () => {
    try {
      set({ loading: true, error: null });

      const deliveries = await shopDB.getAllDeliveries();

      set({ deliveries, loading: false });
      return deliveries;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },

  getDeliveryById: (deliveryId: string) => {
    const delivery = get().deliveries.find(
      (delivery) => delivery.id === deliveryId,
    );
    if (delivery) return delivery;

    shopDB.getDeliveryById(deliveryId).then((dbDelivery) => {
      if (dbDelivery) {
        set((state) => ({ deliveries: [...state.deliveries, dbDelivery] }));
      }
    });
    return delivery || null;
  },

  getDeliveryByOrderId: (orderId: string) => {
    const delivery = get().deliveries.find(
      (delivery) => delivery.orderId === orderId,
    );
    if (delivery) return delivery;

    shopDB.getDeliveryByOrderId(orderId).then((dbDelivery) => {
      if (dbDelivery) {
        set((state) => ({ deliveries: [...state.deliveries, dbDelivery] }));
      }
    });
    return delivery || null;
  },

  updateDeliveryStatus: async (
    deliveryId: string,
    newStatus: DeliveryStatus,
    notes?: string,
    updatedBy?: string,
  ) => {
    try {
      set({ loading: true, error: null });

      const deliveries = [...get().deliveries];
      const deliveryIndex = deliveries.findIndex((d) => d.id === deliveryId);

      if (deliveryIndex === -1) {
        throw new Error("Delivery not found");
      }

      const delivery = deliveries[deliveryIndex];

      const statusUpdate: StatusUpdate = {
        status: newStatus,
        timestamp: new Date(),
        notes,
        location: delivery.currentLocation,
        updatedBy,
      };

      const actualDeliveryDate =
        newStatus === "Delivered" ? new Date() : delivery.actualDeliveryDate;

      const updatedDelivery: Delivery = {
        ...delivery,
        status: newStatus,
        actualDeliveryDate,
        statusHistory: [...delivery.statusHistory, statusUpdate],
        updatedAt: new Date(),
        ...(newStatus === "Cancelled" && notes
          ? {
              cancellationReason: {
                reason: notes,
                cancelledBy: updatedBy,
                cancelledAt: new Date(),
              },
            }
          : {}),
      };

      deliveries[deliveryIndex] = updatedDelivery;

      await shopDB.updateDelivery(updatedDelivery);

      set({
        deliveries,
        currentDelivery: updatedDelivery,
        loading: false,
      });

      return updatedDelivery;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },

  setCurrentDelivery: (delivery: Delivery | null) => {
    set({ currentDelivery: delivery });
  },
}));

export const getNextStatus = (
  currentStatus: DeliveryStatus,
): DeliveryStatus | null => {
  const statusOrder: DeliveryStatus[] = [
    "Packaging",
    "Transit",
    "ShipToOutlet",
    "OutForDelivery",
    "Delivered",
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);

  if (currentIndex === -1 || currentIndex === statusOrder.length - 1) {
    return null;
  }

  return statusOrder[currentIndex + 1];
};
