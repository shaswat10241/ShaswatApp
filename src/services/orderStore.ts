import { create } from "zustand";
import {
  Order,
  OrderFormData,
  ReturnOrder,
  ReturnOrderFormData,
  SKU,
} from "../models/Order";
import { shopDB } from "./database";
import { useUserStore } from "./userStore";

interface OrderStore {
  orders: Order[];
  returnOrders: ReturnOrder[];
  skus: SKU[];
  loading: boolean;
  error: string | null;
  currentOrder: Order | null;
  currentReturnOrder: ReturnOrder | null;

  // Actions
  fetchSKUs: () => Promise<SKU[]>;
  createOrder: (orderData: OrderFormData) => Promise<Order>;
  createReturnOrder: (returnData: ReturnOrderFormData) => Promise<ReturnOrder>;
  fetchOrders: () => Promise<Order[]>;
  fetchReturnOrders: () => Promise<ReturnOrder[]>;
  getOrderById: (orderId: string) => Order | null;
  getReturnOrderById: (returnOrderId: string) => ReturnOrder | null;
  deleteOrder: (orderId: string) => Promise<void>;
  setCurrentOrder: (order: Order | null) => void;
  setCurrentReturnOrder: (returnOrder: ReturnOrder | null) => void;
  applyDiscount: (orderId: string, discountCode: string) => Promise<Order>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  returnOrders: [],
  skus: [],
  loading: false,
  error: null,
  currentOrder: null,
  currentReturnOrder: null,

  fetchSKUs: async () => {
    try {
      set({ loading: true, error: null });

      await shopDB.initializeSKUs();
      const skus = await shopDB.getAllSKUs();

      set({ skus, loading: false });
      return skus;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },

  createOrder: async (orderData: OrderFormData) => {
    try {
      set({ loading: true, error: null });

      // Get current user's ID
      const currentUser = useUserStore.getState().currentUser;
      const employeeId = currentUser?.id;

      let totalAmount = 0;

      orderData.orderItems.forEach((item) => {
        const pricePerUnit =
          item.unitType === "box" ? item.sku.boxPrice : item.sku.price;
        totalAmount += pricePerUnit * item.quantity;
      });

      let discountAmount = 0;
      if (orderData.discountCode) {
        discountAmount = Math.round(totalAmount * 0.1);
      }

      const finalAmount = totalAmount - discountAmount;

      const newOrder: Order = {
        id: Date.now().toString(),
        ...orderData,
        employeeId,
        totalAmount,
        discountAmount,
        finalAmount,
        createdAt: new Date(),
      };

      await shopDB.addOrder(newOrder);

      set((state) => ({
        orders: [...state.orders, newOrder],
        currentOrder: newOrder,
        loading: false,
      }));

      return newOrder;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },

  fetchOrders: async () => {
    try {
      set({ loading: true, error: null });

      const orders = await shopDB.getAllOrders();

      set({ orders, loading: false });
      return orders;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },

  getOrderById: (orderId: string) => {
    const order = get().orders.find((order) => order.id === orderId);
    if (order) return order;

    shopDB.getOrderById(orderId).then((dbOrder) => {
      if (dbOrder) {
        set((state) => ({ orders: [...state.orders, dbOrder] }));
      }
    });
    return order || null;
  },

  createReturnOrder: async (returnData: ReturnOrderFormData) => {
    try {
      set({ loading: true, error: null });

      // Get current user's ID
      const currentUser = useUserStore.getState().currentUser;
      const employeeId = currentUser?.id;

      let totalAmount = 0;

      returnData.returnItems.forEach((item) => {
        const pricePerUnit =
          item.unitType === "box" ? item.sku.boxPrice : item.sku.price;
        totalAmount += pricePerUnit * item.quantity;
      });

      const newReturnOrder: ReturnOrder = {
        id: Date.now().toString(),
        ...returnData,
        employeeId,
        totalAmount,
        createdAt: new Date(),
      };

      await shopDB.addReturnOrder(newReturnOrder);

      set((state) => ({
        returnOrders: [...state.returnOrders, newReturnOrder],
        currentReturnOrder: newReturnOrder,
        loading: false,
      }));

      return newReturnOrder;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },

  fetchReturnOrders: async () => {
    try {
      set({ loading: true, error: null });

      const returnOrders = await shopDB.getAllReturnOrders();

      set({ returnOrders, loading: false });
      return returnOrders;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },

  getReturnOrderById: (returnOrderId: string) => {
    const returnOrder = get().returnOrders.find(
      (returnOrder) => returnOrder.id === returnOrderId,
    );
    if (returnOrder) return returnOrder;

    shopDB.getReturnOrderById(returnOrderId).then((dbReturnOrder) => {
      if (dbReturnOrder) {
        set((state) => ({
          returnOrders: [...state.returnOrders, dbReturnOrder],
        }));
      }
    });
    return returnOrder || null;
  },

  deleteOrder: async (orderId: string) => {
    try {
      set({ loading: true, error: null });

      // Delete from database
      await shopDB.deleteOrder(orderId);

      // Remove from local state
      set((state) => ({
        orders: state.orders.filter((order) => order.id !== orderId),
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

  setCurrentOrder: (order: Order | null) => {
    set({ currentOrder: order });
  },

  setCurrentReturnOrder: (returnOrder: ReturnOrder | null) => {
    set({ currentReturnOrder: returnOrder });
  },

  applyDiscount: async (orderId: string, discountCode: string) => {
    try {
      set({ loading: true, error: null });

      const orders = [...get().orders];
      const orderIndex = orders.findIndex((order) => order.id === orderId);

      if (orderIndex === -1) {
        throw new Error("Order not found");
      }

      const order = orders[orderIndex];

      const discountAmount = Math.round(order.totalAmount * 0.1);
      const finalAmount = order.totalAmount - discountAmount;

      const updatedOrder: Order = {
        ...order,
        discountCode,
        discountAmount,
        finalAmount,
      };

      orders[orderIndex] = updatedOrder;

      set({
        orders,
        currentOrder: updatedOrder,
        loading: false,
      });

      return updatedOrder;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  },
}));
