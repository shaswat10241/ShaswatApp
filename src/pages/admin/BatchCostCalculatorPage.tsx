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

const BatchCostCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { skus, fetchSKUs } = useOrderStore();

  const [formData, setFormData] = useState<BatchCostFormData>(
    createEmptyBatchCostForm(),
  );
  const [perUnitCost, setPerUnitCost] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [breakdowns, setBreakdowns] = useState<CostBreakdown[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchSKUs();
  }, [fetchSKUs]);

  // Calculate costs in real-time
  const calculateCosts = () => {
    // Raw Material Cost
    const rawMaterialCost = formData.rawMaterials.reduce(
      (sum, item) =>
        sum +
        item.quantity * (item.totalCost / (item.quantity || 1)) * item.ratio,
      0,
    );

    // Labour Cost
    const labourCost =
      formData.labourCost.numberOfPeople * formData.labourCost.averageSalary;

    // Electricity Cost
    const electricityCost =
      formData.electricityCost.unitsUsed * formData.electricityCost.costPerUnit;

    // Packaging Cost
    const packagingCost =
      formData.packagingCost.unitCost * formData.packagingCost.numberOfUnits;

    // Transportation Cost
    const transportationCost =
      formData.transportationCost.fuelCost +
      formData.transportationCost.numberOfKMs +
      formData.transportationCost.driverCost;

    // Marketing Cost
    const marketingCost = formData.marketingEmployees.reduce(
      (sum, emp) => sum + emp.salary,
      0,
    );

    // Other Expenses
    const otherExpensesCost = formData.otherExpenses.reduce(
      (sum, expense) => sum + expense.totalCost,
      0,
    );

    // Grand Total
    const total =
      rawMaterialCost +
      labourCost +
      electricityCost +
      packagingCost +
      transportationCost +
      marketingCost +
      otherExpensesCost;

    setGrandTotal(total);

    // Per Unit Cost
    const perUnit =
      formData.totalQuantityProduced > 0
        ? total / formData.totalQuantityProduced
        : 0;
    setPerUnitCost(perUnit);

    // Create breakdowns for analysis
    const totalForPercentage = total || 1;
    const newBreakdowns: CostBreakdown[] = [
      {
        category: "Raw Material Cost",
        total: rawMaterialCost,
        percentage: (rawMaterialCost / totalForPercentage) * 100,
        items: formData.rawMaterials.map((item) => ({
          label: item.name || "Unnamed Item",
          value:
            item.quantity *
            (item.totalCost / (item.quantity || 1)) *
            item.ratio,
          calculation: `${item.quantity} × ₹${(item.totalCost / (item.quantity || 1)).toFixed(2)} × ${item.ratio}`,
          details: `Quantity: ${item.quantity}, Unit Cost: ₹${(item.totalCost / (item.quantity || 1)).toFixed(2)}, Ratio: ${item.ratio}`,
        })),
      },
      {
        category: "Labour Cost",
        total: labourCost,
        percentage: (labourCost / totalForPercentage) * 100,
        items: [
          {
            label: "Total Labour Cost",
            value: labourCost,
            calculation: `${formData.labourCost.numberOfPeople} × ₹${formData.labourCost.averageSalary}`,
            details: `${formData.labourCost.numberOfPeople} people × ₹${formData.labourCost.averageSalary} avg salary`,
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
            value: electricityCost,
            calculation: `${formData.electricityCost.unitsUsed} × ₹${formData.electricityCost.costPerUnit}`,
            details: `${formData.electricityCost.unitsUsed} units × ₹${formData.electricityCost.costPerUnit} per unit`,
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
            value: packagingCost,
            calculation: `${formData.packagingCost.numberOfUnits} × ₹${formData.packagingCost.unitCost}`,
            details: `${formData.packagingCost.numberOfUnits} units × ₹${formData.packagingCost.unitCost} per unit`,
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
            calculation: `₹${formData.transportationCost.fuelCost}`,
            details: "Fuel expenses",
          },
          {
            label: "Distance Cost",
            value: formData.transportationCost.numberOfKMs,
            calculation: `₹${formData.transportationCost.numberOfKMs}`,
            details: "Cost based on kilometers",
          },
          {
            label: "Driver Cost",
            value: formData.transportationCost.driverCost,
            calculation: `₹${formData.transportationCost.driverCost}`,
            details: "Driver salary/wages",
          },
        ],
      },
      {
        category: "Marketing Cost",
        total: marketingCost,
        percentage: (marketingCost / totalForPercentage) * 100,
        items: formData.marketingEmployees.map((emp) => ({
          label: emp.employeeName || "Unnamed Employee",
          value: emp.salary,
          calculation: `₹${emp.salary}`,
          details: `Marketing employee salary`,
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
                label="Total Quantity Produced"
                type="number"
                value={formData.totalQuantityProduced}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalQuantityProduced: Number(e.target.value),
                  })
                }
                placeholder="ENTER QUANTITY"
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
                  <TableCell sx={{ fontWeight: "bold" }}>Total Cost</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Ratio</TableCell>
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
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="ENTER TOTAL COST"
                        value={item.totalCost || ""}
                        onChange={(e) =>
                          handleRawMaterialChange(
                            item.id,
                            "totalCost",
                            Number(e.target.value),
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={item.ratio || ""}
                        onChange={(e) =>
                          handleRawMaterialChange(
                            item.id,
                            "ratio",
                            Number(e.target.value),
                          )
                        }
                        inputProps={{ step: 0.1 }}
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
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Average Salary"
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
                  label="No. of Units Used"
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
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cost per Unit"
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
                  label="Unit Cost"
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
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="No. of Units Used"
                  type="number"
                  value={formData.packagingCost.numberOfUnits || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      packagingCost: {
                        ...formData.packagingCost,
                        numberOfUnits: Number(e.target.value),
                      },
                    })
                  }
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
                  label="Fuel Cost"
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
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cost of Driver"
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
                    <TableCell sx={{ fontWeight: "bold" }}>Salary</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.marketingEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="SELECT EMPLOYEE"
                          value={emp.employeeName}
                          onChange={(e) =>
                            handleMarketingEmployeeChange(
                              emp.id,
                              "employeeName",
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
                          value={emp.salary || ""}
                          onChange={(e) =>
                            handleMarketingEmployeeChange(
                              emp.id,
                              "salary",
                              Number(e.target.value),
                            )
                          }
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
                      Total Cost
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
                      For {formData.totalQuantityProduced} units
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
                Per Unit Cost = Total Cost ÷ Total Quantity Produced
                {"\n\n"}
                Where Total Cost = {"\n"}
                Raw Material Cost + {"\n"}
                Labour Cost + {"\n"}
                Electricity Cost + {"\n"}
                Packaging Cost + {"\n"}
                Transportation Cost + {"\n"}
                Marketing Cost + {"\n"}
                Other Expenses
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" fontWeight="bold">
                Final Calculation:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontFamily: "monospace", mt: 1 }}
              >
                ₹{grandTotal.toFixed(2)} ÷ {formData.totalQuantityProduced}{" "}
                units = ₹{perUnitCost.toFixed(2)} per unit
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => {
              // Future: Save calculation to database
              alert("Save functionality coming soon!");
            }}
          >
            Save Calculation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchCostCalculatorPage;
