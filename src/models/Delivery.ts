export type DeliveryStatus =
  | "Packaging"
  | "Transit"
  | "ShipToOutlet"
  | "OutForDelivery"
  | "Delivered"
  | "Cancelled";

export interface Delivery {
  id?: string;
  orderId: string;
  shopId: string;
  status: DeliveryStatus;
  currentLocation?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  trackingNumber?: string;
  deliveryNotes?: string;
  statusHistory: StatusUpdate[];
  cancellationReason?: CancellationReason;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusUpdate {
  status: DeliveryStatus;
  timestamp: Date;
  notes?: string;
  location?: string;
  updatedBy?: string;
}

export interface CancellationReason {
  reason: string;
  cancelledBy?: string;
  cancelledAt: Date;
  notes?: string;
}

export const DeliveryStatusLabels: Record<DeliveryStatus, string> = {
  Packaging: "Packaging",
  Transit: "In Transit",
  ShipToOutlet: "Ship to Outlet",
  OutForDelivery: "Out for Delivery",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
};

export const DeliveryStatusColors: Record<DeliveryStatus, string> = {
  Packaging: "#ffa726", // Orange
  Transit: "#42a5f5", // Blue
  ShipToOutlet: "#7e57c2", // Purple
  OutForDelivery: "#66bb6a", // Green
  Delivered: "#26a69a", // Teal
  Cancelled: "#f44336", // Red
};

export interface DeliveryFormData {
  orderId: string;
  shopId: string;
  status: DeliveryStatus;
  currentLocation?: string;
  estimatedDeliveryDate?: Date;
  trackingNumber?: string;
  deliveryNotes?: string;
}
