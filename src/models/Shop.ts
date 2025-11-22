export interface Shop {
  id?: string;
  name: string;
  location: string;
  district?: string;
  phoneNumber: string;
  category: "wholeseller" | "retailer";
  isNew: boolean;
  createdAt: Date;
  latitude?: number;
  longitude?: number;
}

// This will be used for the shop creation form
export interface ShopFormData {
  name: string;
  location: string;
  district?: string;
  phoneNumber: string;
  category: "wholeseller" | "retailer";
  latitude?: number;
  longitude?: number;
}
