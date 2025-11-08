// Batch Cost Calculator Model

export interface RawMaterialItem {
  id: string;
  name: string;
  quantity: number;
  totalCost: number;
  ratio: number;
}

export interface MarketingEmployee {
  id: string;
  employeeId: string;
  employeeName: string;
  salary: number;
}

export interface OtherExpenseItem {
  id: string;
  name: string;
  totalCost: number;
}

export interface LabourCost {
  numberOfPeople: number;
  averageSalary: number;
}

export interface ElectricityCost {
  unitsUsed: number;
  costPerUnit: number;
}

export interface PackagingCost {
  unitCost: number;
  numberOfUnits: number;
}

export interface TransportationCost {
  fuelCost: number;
  numberOfKMs: number;
  driverCost: number;
}

export interface BatchCostCalculation {
  id?: string;
  productName: string;
  productSKUId?: string;
  totalQuantityProduced: number;

  // Cost Components
  rawMaterials: RawMaterialItem[];
  labourCost: LabourCost;
  electricityCost: ElectricityCost;
  packagingCost: PackagingCost;
  transportationCost: TransportationCost;
  marketingEmployees: MarketingEmployee[];
  otherExpenses: OtherExpenseItem[];

  // Calculated Results
  totalRawMaterialCost: number;
  totalLabourCost: number;
  totalElectricityCost: number;
  totalPackagingCost: number;
  totalTransportationCost: number;
  totalMarketingCost: number;
  totalOtherExpenses: number;
  grandTotal: number;
  perUnitCost: number;

  // Metadata
  calculatedBy?: string;
  calculatedAt: Date;
  notes?: string;
}

export interface CostBreakdown {
  category: string;
  items: CostBreakdownItem[];
  total: number;
  percentage: number;
}

export interface CostBreakdownItem {
  label: string;
  value: number;
  calculation?: string;
  details?: string;
}

export interface BatchCostFormData {
  productName: string;
  productSKUId?: string;
  totalQuantityProduced: number;
  rawMaterials: RawMaterialItem[];
  labourCost: LabourCost;
  electricityCost: ElectricityCost;
  packagingCost: PackagingCost;
  transportationCost: TransportationCost;
  marketingEmployees: MarketingEmployee[];
  otherExpenses: OtherExpenseItem[];
}

// Helper type for empty form initialization
export const createEmptyRawMaterial = (): RawMaterialItem => ({
  id: crypto.randomUUID(),
  name: "",
  quantity: 0,
  totalCost: 0,
  ratio: 1,
});

export const createEmptyMarketingEmployee = (): MarketingEmployee => ({
  id: crypto.randomUUID(),
  employeeId: "",
  employeeName: "",
  salary: 0,
});

export const createEmptyOtherExpense = (): OtherExpenseItem => ({
  id: crypto.randomUUID(),
  name: "",
  totalCost: 0,
});

export const createEmptyBatchCostForm = (): BatchCostFormData => ({
  productName: "",
  productSKUId: undefined,
  totalQuantityProduced: 0,
  rawMaterials: [createEmptyRawMaterial()],
  labourCost: {
    numberOfPeople: 0,
    averageSalary: 0,
  },
  electricityCost: {
    unitsUsed: 0,
    costPerUnit: 0,
  },
  packagingCost: {
    unitCost: 0,
    numberOfUnits: 0,
  },
  transportationCost: {
    fuelCost: 0,
    numberOfKMs: 0,
    driverCost: 0,
  },
  marketingEmployees: [createEmptyMarketingEmployee()],
  otherExpenses: [createEmptyOtherExpense()],
});
