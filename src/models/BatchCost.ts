// Batch Cost Calculator Model

export type QuantityUnit = "kg" | "g";

export interface SavedBatchCost {
  id?: string;
  productName: string;
  productSKUId?: string;
  calculationDate: Date;
  revisionNumber: number;
  calculatedBy: string;
  calculatedByEmail: string;

  // Cost data
  totalQuantityProduced: number;
  rawMaterials: RawMaterialItem[];
  labourCost: LabourCost;
  electricityCost: ElectricityCost;
  packagingCost: PackagingCost;
  transportationCost: TransportationCost;
  marketingEmployees: MarketingEmployee[];
  otherExpenses: OtherExpenseItem[];

  // Calculated results
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
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostRevisionSummary {
  productName: string;
  productSKUId?: string;
  totalRevisions: number;
  latestRevision: number;
  latestPerUnitCost: number;
  latestGrandTotal: number;
  latestCalculationDate: Date;
  firstCalculationDate: Date;
  calculatedBy: string;
}

export interface RawMaterialItem {
  id: string;
  name: string;
  quantity: number;
  quantityUnit: QuantityUnit;
  unitCost: number; // Cost per kg
}

export interface MarketingEmployee {
  id: string;
  employeeId: string;
  employeeName: string;
  unitCost: number; // Marketing cost per unit
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
}

export interface TransportationCost {
  fuelCost: number;
  numberOfKMs: number; // Just for reference/details
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
  quantityUnit: "kg",
  unitCost: 0,
});

export const createEmptyMarketingEmployee = (): MarketingEmployee => ({
  id: crypto.randomUUID(),
  employeeId: "",
  employeeName: "",
  unitCost: 0,
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
  },
  transportationCost: {
    fuelCost: 0,
    numberOfKMs: 0, // For reference only
    driverCost: 0,
  },
  marketingEmployees: [createEmptyMarketingEmployee()],
  otherExpenses: [createEmptyOtherExpense()],
});

export const createSavedBatchCostFromForm = (
  formData: BatchCostFormData,
  calculations: {
    totalRawMaterialCost: number;
    totalLabourCost: number;
    totalElectricityCost: number;
    totalPackagingCost: number;
    totalTransportationCost: number;
    totalMarketingCost: number;
    totalOtherExpenses: number;
    grandTotal: number;
    perUnitCost: number;
  },
  metadata: {
    calculatedBy: string;
    calculatedByEmail: string;
    revisionNumber: number;
    notes?: string;
  },
): SavedBatchCost => ({
  productName: formData.productName,
  productSKUId: formData.productSKUId,
  calculationDate: new Date(),
  revisionNumber: metadata.revisionNumber,
  calculatedBy: metadata.calculatedBy,
  calculatedByEmail: metadata.calculatedByEmail,
  totalQuantityProduced: formData.totalQuantityProduced,
  rawMaterials: formData.rawMaterials,
  labourCost: formData.labourCost,
  electricityCost: formData.electricityCost,
  packagingCost: formData.packagingCost,
  transportationCost: formData.transportationCost,
  marketingEmployees: formData.marketingEmployees,
  otherExpenses: formData.otherExpenses,
  ...calculations,
  notes: metadata.notes,
  createdAt: new Date(),
  updatedAt: new Date(),
});
