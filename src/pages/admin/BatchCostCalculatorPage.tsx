import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CalculateIcon from "@mui/icons-material/Calculate";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SaveIcon from "@mui/icons-material/Save";
import {
  BatchCostFormData,
  RawMaterialItem,
  MarketingEmployee,
  OtherExpenseItem,
  CostBreakdown,
  createEmptyRawMaterial,
  createEmptyMarketingEmployee,
  createEmptyOtherExpense,
  createEmptyBatchCostForm,
} from "../../models/BatchCost";
import { useOrderStore } from "../../services/orderStore";
import { useUserStore } from "../../services/userStore";
import { useUser } from "@clerk/clerk-react";
import { shopDB } from "../../services/database";
import { createSavedBatchCostFromForm } from "../../models/BatchCost";

const BatchCostCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { skus, fetchSKUs } = useOrderStore();
  const { users, fetchAllUsers } = useUserStore();

  const [formData, setFormData] = useState<BatchCostFormData>(
    createEmptyBatchCostForm(),
  );
  const [perUnitCost, setPerUnitCost] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [breakdowns, setBreakdowns] = useState<CostBreakdown[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  // Store calculation results for saving
  const [calculationResults, setCalculationResults] = useState({
    totalRawMaterialCost: 0,
    totalLabourCost: 0,
    totalElectricityCost: 0,
    totalPackagingCost: 0,
    totalTransportationCost: 0,
    totalMarketingCost: 0,
    totalOtherExpenses: 0,
  });

  useEffect(() => {
    fetchSKUs();
    fetchAllUsers();
  }, [fetchSKUs, fetchAllUsers]);

  // Calculate costs in real-time
  const calculateCosts = () => {
    const totalQty = formData.totalQuantityProduced || 1;

    // Raw Material Cost per unit = Σ(Quantity_kg × Unit_Cost) / Total_Units
    const rawMaterialCost = formData.rawMaterials.reduce((sum, item) => {
      // Convert quantity to kg if in grams
      const quantityInKg =
        item.quantityUnit === "g" ? item.quantity / 1000 : item.quantity;
      return sum + (quantityInKg * item.unitCost) / totalQty;
    }, 0);

    // Labour Cost per unit = (Number_of_People × Average_Salary) / Total_Units
    const labourCost =
      (formData.labourCost.numberOfPeople * formData.labourCost.averageSalary) /
      totalQty;

    // Electricity Cost per unit = (Units × Cost_per_Unit) / Total_Units
    const electricityCost =
      (formData.electricityCost.unitsUsed *
        formData.electricityCost.costPerUnit) /
      totalQty;

    // Packaging Cost per unit = Unit_Cost (already per unit)
    const packagingCost = formData.packagingCost.unitCost;

    // Transportation Cost per unit = (Fuel_Cost + Driver_Cost) / Total_Units
    // Note: numberOfKMs is just for reference/details
    const transportationCost =
      (formData.transportationCost.fuelCost +
        formData.transportationCost.driverCost) /
      totalQty;

    // Marketing Cost per unit = Σ(Unit_Cost) - one person per selection
    const marketingCost = formData.marketingEmployees.reduce(
      (sum, emp) => sum + emp.unitCost,
      0,
    );

    // Other Expenses per unit = Σ(Expense_Items)
    const otherExpensesCost = formData.otherExpenses.reduce(
      (sum, expense) => sum + expense.totalCost,
      0,
    );

    // Per Unit Cost
    const perUnit =
      rawMaterialCost +
      labourCost +
      electricityCost +
      packagingCost +
      transportationCost +
      marketingCost +
      otherExpensesCost;

    setPerUnitCost(perUnit);

    // Grand Total = Per Unit Cost × Total Quantity
    const total = perUnit * formData.totalQuantityProduced;
    setGrandTotal(total);

    // Store calculation results (as totals for saving)
    setCalculationResults({
      totalRawMaterialCost: rawMaterialCost * formData.totalQuantityProduced,
      totalLabourCost: labourCost * formData.totalQuantityProduced,
      totalElectricityCost: electricityCost * formData.totalQuantityProduced,
      totalPackagingCost: packagingCost * formData.totalQuantityProduced,
      totalTransportationCost:
        transportationCost * formData.totalQuantityProduced,
      totalMarketingCost: marketingCost * formData.totalQuantityProduced,
      totalOtherExpenses: otherExpensesCost * formData.totalQuantityProduced,
    });

    // Create breakdowns for analysis
    const totalForPercentage = total || 1;
    const newBreakdowns: CostBreakdown[] = [
      {
        category: "Raw Material Cost",
        total: rawMaterialCost,
        percentage: (rawMaterialCost / totalForPercentage) * 100,
        items: formData.rawMaterials.map((item) => {
          const quantityInKg =
            item.quantityUnit === "g" ? item.quantity / 1000 : item.quantity;
          const totalQty = formData.totalQuantityProduced || 1;
          const itemCost = (quantityInKg * item.unitCost) / totalQty;
          return {
            label: item.name || "Unnamed Item",
            value: itemCost * totalQty,
            calculation: `(${item.quantity}${item.quantityUnit} × ₹${item.unitCost.toFixed(2)}) / ${totalQty} units`,
            details: `Quantity: ${item.quantity}${item.quantityUnit}, Unit Cost: ₹${item.unitCost.toFixed(2)}/kg`,
          };
        }),
      },
      {
        category: "Labour Cost",
        total: labourCost,
        percentage: (labourCost / totalForPercentage) * 100,
        items: [
          {
            label: "Total Labour Cost",
            value: labourCost * formData.totalQuantityProduced,
            calculation: `(${formData.labourCost.numberOfPeople} × ₹${formData.labourCost.averageSalary}) / ${formData.totalQuantityProduced} units`,
            details: `${formData.labourCost.numberOfPeople} people × ₹${formData.labourCost.averageSalary} avg salary per unit`,
          },
        ],
      },
      {
        category: "Electricity Cost",
        total: electricityCost,
        percentage: (electricityCost / totalForPercentage) * 100,
        items: [
          {
            label: "Total Electricity Cost",
            value: electricityCost * formData.totalQuantityProduced,
            calculation: `(${formData.electricityCost.unitsUsed} kWh × ₹${formData.electricityCost.costPerUnit}) / ${formData.totalQuantityProduced} units`,
            details: `${formData.electricityCost.unitsUsed} kWh × ₹${formData.electricityCost.costPerUnit} per kWh per unit`,
          },
        ],
      },
      {
        category: "Packaging Cost",
        total: packagingCost,
        percentage: (packagingCost / totalForPercentage) * 100,
        items: [
          {
            label: "Total Packaging Cost",
            value: packagingCost * formData.totalQuantityProduced,
            calculation: `₹${formData.packagingCost.unitCost} per unit`,
            details: `Unit cost already calculated per package`,
          },
        ],
      },
      {
        category: "Transportation Cost",
        total: transportationCost,
        percentage: (transportationCost / totalForPercentage) * 100,
        items: [
          {
            label: "Fuel Cost",
            value: formData.transportationCost.fuelCost,
            calculation: `(₹${formData.transportationCost.fuelCost}) / ${formData.totalQuantityProduced} units`,
            details: `Fuel expenses for ${formData.transportationCost.numberOfKMs} KMs`,
          },
          {
            label: "Driver Cost",
            value: formData.transportationCost.driverCost,
            calculation: `(₹${formData.transportationCost.driverCost}) / ${formData.totalQuantityProduced} units`,
            details: "Driver salary/wages per unit",
          },
        ],
      },
      {
        category: "Marketing Cost",
        total: marketingCost,
        percentage: (marketingCost / totalForPercentage) * 100,
        items: formData.marketingEmployees.map((emp) => ({
          label: emp.employeeName || "Unnamed Employee",
          value: emp.unitCost * formData.totalQuantityProduced,
          calculation: `₹${emp.unitCost} per unit`,
          details: `Marketing unit cost for selected employee`,
        })),
      },
      {
        category: "Other Expenses",
        total: otherExpensesCost,
        percentage: (otherExpensesCost / totalForPercentage) * 100,
        items: formData.otherExpenses.map((expense) => ({
          label: expense.name || "Unnamed Expense",
          value: expense.totalCost,
          calculation: `₹${expense.totalCost}`,
          details: "Miscellaneous expense",
        })),
      },
    ];

    setBreakdowns(newBreakdowns);
  };

  useEffect(() => {
    calculateCosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleAddRawMaterial = () => {
    setFormData({
      ...formData,
      rawMaterials: [...formData.rawMaterials, createEmptyRawMaterial()],
    });
  };

  const handleRemoveRawMaterial = (id: string) => {
    setFormData({
      ...formData,
      rawMaterials: formData.rawMaterials.filter((item) => item.id !== id),
    });
  };

  const handleRawMaterialChange = (
    id: string,
    field: keyof RawMaterialItem,
    value: any,
  ) => {
    setFormData({
      ...formData,
      rawMaterials: formData.rawMaterials.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    });
  };

  const handleAddMarketingEmployee = () => {
    setFormData({
      ...formData,
      marketingEmployees: [
        ...formData.marketingEmployees,
        createEmptyMarketingEmployee(),
      ],
    });
  };

  const handleRemoveMarketingEmployee = (id: string) => {
    setFormData({
      ...formData,
      marketingEmployees: formData.marketingEmployees.filter(
        (emp) => emp.id !== id,
      ),
    });
  };

  const handleMarketingEmployeeChange = (
    id: string,
    field: keyof MarketingEmployee,
    value: any,
  ) => {
    setFormData({
      ...formData,
      marketingEmployees: formData.marketingEmployees.map((emp) =>
        emp.id === id ? { ...emp, [field]: value } : emp,
      ),
    });
  };

  const handleAddOtherExpense = () => {
    setFormData({
      ...formData,
      otherExpenses: [...formData.otherExpenses, createEmptyOtherExpense()],
    });
  };

  const handleRemoveOtherExpense = (id: string) => {
    setFormData({
      ...formData,
      otherExpenses: formData.otherExpenses.filter((exp) => exp.id !== id),
    });
  };

  const handleOtherExpenseChange = (
    id: string,
    field: keyof OtherExpenseItem,
    value: any,
  ) => {
    setFormData({
      ...formData,
      otherExpenses: formData.otherExpenses.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp,
      ),
    });
  };

  const handleCalculate = () => {
    calculateCosts();
    setShowResults(true);
  };

  const handleAnalyze = () => {
    setAnalysisOpen(true);
  };

  const handleReset = () => {
    setFormData(createEmptyBatchCostForm());
    setPerUnitCost(0);
    setGrandTotal(0);
    setShowResults(false);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.productName || formData.productName.trim() === "") {
      setSnackbarMessage("Please select a product name");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (formData.totalQuantityProduced <= 0) {
      setSnackbarMessage("Please enter total quantity produced");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (!showResults) {
      setSnackbarMessage("Please calculate costs first");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSaving(true);

    try {
      // Get next revision number
      const latestRevision = await shopDB.getLatestRevisionNumber(
        formData.productName,
      );
      const newRevisionNumber = latestRevision + 1;

      // Create saved batch cost
      const savedCost = createSavedBatchCostFromForm(
        formData,
        {
          ...calculationResults,
          grandTotal,
          perUnitCost,
        },
        {
          calculatedBy: user?.fullName || user?.firstName || "User",
          calculatedByEmail:
            user?.emailAddresses?.[0]?.emailAddress || "unknown@example.com",
          revisionNumber: newRevisionNumber,
        },
      );

      // Save to database
      await shopDB.saveBatchCost(savedCost);

      setSnackbarMessage(
        `Cost calculation saved successfully! (Revision ${newRevisionNumber})`,
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Close analysis dialog if open
      setAnalysisOpen(false);
    } catch (error) {
      console.error("Error saving batch cost:", error);
      setSnackbarMessage("Failed to save calculation. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "white",
          color: "text.primary",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/dashboard")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <CalculateIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" component="div" fontWeight="bold">
            Batch Cost Calculator
          </Typography>
          <Chip
            label="Admin Tool"
            size="small"
            color="secondary"
            sx={{ ml: 2 }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {/* Product Information */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: "#e8f5e9" }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Product Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Product Name</InputLabel>
                <Select
                  value={formData.productSKUId || ""}
                  label="Product Name"
                  onChange={(e) => {
                    const selectedSKU = skus.find(
                      (sku) => sku.id === e.target.value,
                    );
                    setFormData({
                      ...formData,
                      productSKUId: e.target.value,
                      productName: selectedSKU?.name || "",
                    });
                  }}
                >
                  <MenuItem value="">
                    <em>Select Your SKU</em>
                  </MenuItem>
                  {skus.map((sku) => (
                    <MenuItem key={sku.id} value={sku.id}>
                      {sku.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Total Quantity Produced (Units)"
                type="number"
                value={formData.totalQuantityProduced || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalQuantityProduced: Number(e.target.value),
                  })
                }
                placeholder="ENTER QUANTITY"
                helperText="Total number of units to be produced"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Raw Material Cost */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="success.main">
              Raw Material Cost
            </Typography>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={handleAddRawMaterial}
              size="small"
            >
              Add More
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Unit Cost (₹/kg)
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.rawMaterials.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="ENTER RAW MATERIAL ITEM"
                        value={item.name}
                        onChange={(e) =>
                          handleRawMaterialChange(
                            item.id,
                            "name",
                            e.target.value,
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="ENTER QUANTITY"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          handleRawMaterialChange(
                            item.id,
                            "quantity",
                            Number(e.target.value),
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        fullWidth
                        size="small"
                        value={item.quantityUnit}
                        onChange={(e) =>
                          handleRawMaterialChange(
                            item.id,
                            "quantityUnit",
                            e.target.value,
                          )
                        }
                      >
                        <MenuItem value="kg">kg</MenuItem>
                        <MenuItem value="g">g</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="COST PER KG"
                        value={item.unitCost || ""}
                        onChange={(e) =>
                          handleRawMaterialChange(
                            item.id,
                            "unitCost",
                            Number(e.target.value),
                          )
                        }
                        InputProps={{
                          startAdornment: (
                            <span style={{ marginRight: 4 }}>₹</span>
                          ),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveRawMaterial(item.id)}
                        disabled={formData.rawMaterials.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Basic Expense */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: "#fce4ec" }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="secondary.main"
            gutterBottom
          >
            Basic Expense
          </Typography>

          {/* Labour Cost */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Labour Cost
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="No. of People"
                  type="number"
                  value={formData.labourCost.numberOfPeople || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      labourCost: {
                        ...formData.labourCost,
                        numberOfPeople: Number(e.target.value),
                      },
                    })
                  }
                  helperText="Total number of workers"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Average Salary (₹)"
                  type="number"
                  value={formData.labourCost.averageSalary || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      labourCost: {
                        ...formData.labourCost,
                        averageSalary: Number(e.target.value),
                      },
                    })
                  }
                  InputProps={{
                    startAdornment: <span style={{ marginRight: 4 }}>₹</span>,
                  }}
                  helperText="Average wage per worker"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Electricity */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Electricity
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="No. of Units Used (kWh)"
                  type="number"
                  value={formData.electricityCost.unitsUsed || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      electricityCost: {
                        ...formData.electricityCost,
                        unitsUsed: Number(e.target.value),
                      },
                    })
                  }
                  helperText="Electricity consumed in kilowatt-hours"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cost per Unit (₹/kWh)"
                  type="number"
                  value={formData.electricityCost.costPerUnit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      electricityCost: {
                        ...formData.electricityCost,
                        costPerUnit: Number(e.target.value),
                      },
                    })
                  }
                  InputProps={{
                    startAdornment: <span style={{ marginRight: 4 }}>₹</span>,
                  }}
                  helperText="Rate per kilowatt-hour"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Packaging */}
          <Box>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Packaging
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Unit Cost (₹)"
                  type="number"
                  value={formData.packagingCost.unitCost || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      packagingCost: {
                        ...formData.packagingCost,
                        unitCost: Number(e.target.value),
                      },
                    })
                  }
                  InputProps={{
                    startAdornment: <span style={{ marginRight: 4 }}>₹</span>,
                  }}
                  helperText="Cost per packaging unit (already per unit)"
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Transportation & Marketing */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: "#e3f2fd" }}>
          {/* Transportation */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary.main"
              gutterBottom
            >
              Transportation
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Fuel Cost (₹)"
                  type="number"
                  value={formData.transportationCost.fuelCost || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transportationCost: {
                        ...formData.transportationCost,
                        fuelCost: Number(e.target.value),
                      },
                    })
                  }
                  InputProps={{
                    startAdornment: <span style={{ marginRight: 4 }}>₹</span>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="No. of KMs"
                  type="number"
                  value={formData.transportationCost.numberOfKMs || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transportationCost: {
                        ...formData.transportationCost,
                        numberOfKMs: Number(e.target.value),
                      },
                    })
                  }
                  helperText="For reference only (not included in calculation)"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cost of Driver (₹)"
                  type="number"
                  value={formData.transportationCost.driverCost || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transportationCost: {
                        ...formData.transportationCost,
                        driverCost: Number(e.target.value),
                      },
                    })
                  }
                  InputProps={{
                    startAdornment: <span style={{ marginRight: 4 }}>₹</span>,
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Marketing Cost */}
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                Marketing Cost
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddMarketingEmployee}
                size="small"
              >
                Add More
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Unit Cost (₹/unit)
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.marketingEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={emp.employeeId || ""}
                            displayEmpty
                            onChange={(e) => {
                              const selectedUserId = e.target.value;
                              const selectedUser = users.find(
                                (u) => u.id === selectedUserId,
                              );

                              // Update both employeeId and employeeName in one call
                              setFormData({
                                ...formData,
                                marketingEmployees:
                                  formData.marketingEmployees.map((employee) =>
                                    employee.id === emp.id
                                      ? {
                                          ...employee,
                                          employeeId: selectedUserId,
                                          employeeName:
                                            selectedUser?.name || "",
                                        }
                                      : employee,
                                  ),
                              });
                            }}
                          >
                            <MenuItem value="">
                              <em>SELECT EMPLOYEE</em>
                            </MenuItem>
                            {users.map((user) => (
                              <MenuItem key={user.id} value={user.id}>
                                {user.name} ({user.email})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="COST PER UNIT"
                          value={emp.unitCost || ""}
                          onChange={(e) =>
                            handleMarketingEmployeeChange(
                              emp.id,
                              "unitCost",
                              Number(e.target.value),
                            )
                          }
                          InputProps={{
                            startAdornment: (
                              <span style={{ marginRight: 4 }}>₹</span>
                            ),
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveMarketingEmployee(emp.id)}
                          disabled={formData.marketingEmployees.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Other Expense */}
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                Other Expense
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddOtherExpense}
                size="small"
              >
                Add More
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Total Cost (₹)
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.otherExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="ENTER ITEM NAME"
                          value={expense.name}
                          onChange={(e) =>
                            handleOtherExpenseChange(
                              expense.id,
                              "name",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={expense.totalCost || ""}
                          onChange={(e) =>
                            handleOtherExpenseChange(
                              expense.id,
                              "totalCost",
                              Number(e.target.value),
                            )
                          }
                          InputProps={{
                            startAdornment: (
                              <span style={{ marginRight: 4 }}>₹</span>
                            ),
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveOtherExpense(expense.id)}
                          disabled={formData.otherExpenses.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>

        {/* Results and Actions */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Per Unit Cost
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    ₹{perUnitCost.toFixed(2)}
                  </Typography>
                  {formData.totalQuantityProduced > 0 && (
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                      Based on {formData.totalQuantityProduced} units
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Cost
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    ₹{grandTotal.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    Grand total of all expenses
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CalculateIcon />}
              onClick={handleCalculate}
              sx={{ minWidth: 200 }}
            >
              Calculate
            </Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<AnalyticsIcon />}
              onClick={handleAnalyze}
              disabled={!showResults || grandTotal === 0}
              sx={{ minWidth: 200 }}
            >
              Analyze Breakdown
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="large"
              onClick={handleReset}
              sx={{ minWidth: 200 }}
            >
              Reset
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Analysis Dialog */}
      <Dialog
        open={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AnalyticsIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Cost Breakdown Analysis
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Alert severity="info" sx={{ height: "100%" }}>
                  <Typography variant="h6" fontWeight="bold">
                    ₹{perUnitCost.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">Cost Per Unit</Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={6}>
                <Alert severity="success" sx={{ height: "100%" }}>
                  <Typography variant="h6" fontWeight="bold">
                    ₹{grandTotal.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">Total Production Cost</Typography>
                </Alert>
              </Grid>
            </Grid>

            {/* Cost Breakdowns */}
            {breakdowns.map((breakdown, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {breakdown.category}
                    </Typography>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="h6"
                        color="primary"
                        fontWeight="bold"
                      >
                        ₹{breakdown.total.toFixed(2)}
                      </Typography>
                      <Chip
                        label={`${breakdown.percentage.toFixed(1)}%`}
                        size="small"
                        color={
                          breakdown.percentage > 30
                            ? "error"
                            : breakdown.percentage > 15
                              ? "warning"
                              : "success"
                        }
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {breakdown.items.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <strong>Item</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Calculation</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Amount</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {breakdown.items.map((item, itemIndex) => (
                            <TableRow key={itemIndex}>
                              <TableCell>{item.label}</TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ fontFamily: "monospace" }}
                                >
                                  {item.calculation}
                                </Typography>
                                {item.details && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    {item.details}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <Typography fontWeight="600">
                                  ₹{item.value.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                            <TableCell colSpan={2}>
                              <strong>Subtotal</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>₹{breakdown.total.toFixed(2)}</strong>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" align="center">
                      No items in this category
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Formula Display */}
            <Paper sx={{ p: 3, bgcolor: "#f5f5f5", mt: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Calculation Formula
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
              >
                Per Unit Cost = {"\n"}
                [Σ(Raw Material Qty_kg × Unit Cost) / Total Units] + {"\n"}
                [(No. of People × Avg Salary) / Total Units] + {"\n"}
                [(Electricity kWh × Cost per kWh) / Total Units] + {"\n"}
                [Packaging Unit Cost] + {"\n"}
                [(Fuel Cost + Driver Cost) / Total Units] + {"\n"}
                [Σ(Marketing Unit Cost per Employee)] + {"\n"}
                [Σ(Other Expense Items)]
                {"\n\n"}
                Total Cost = Per Unit Cost × Total Quantity
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" fontWeight="bold">
                Final Calculation:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontFamily: "monospace", mt: 1 }}
              >
                Per Unit Cost = ₹{perUnitCost.toFixed(2)}
                {"\n"}
                Quantity Produced = {formData.totalQuantityProduced} units
                {"\n"}
                Total Cost = ₹{perUnitCost.toFixed(2)} ×{" "}
                {formData.totalQuantityProduced} = ₹{grandTotal.toFixed(2)}
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisOpen(false)}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Calculation"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BatchCostCalculatorPage;
