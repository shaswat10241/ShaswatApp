import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Order } from "../../models/Order";
import { Shop } from "../../models/Shop";

interface ProductCategoryChartProps {
  orders: Order[];
  shops: Shop[];
}

interface ProductCategoryData {
  productName: string;
  productId: string;
  wholeseller: {
    quantity: number;
    revenue: number;
    orders: number;
  };
  retailer: {
    quantity: number;
    revenue: number;
    orders: number;
  };
}

interface CategorySummary {
  category: "wholeseller" | "retailer";
  totalRevenue: number;
  totalOrders: number;
  totalQuantity: number;
  avgOrderValue: number;
}

const COLORS = {
  wholeseller: "#1976d2",
  retailer: "#2e7d32",
};

const ProductCategoryChart: React.FC<ProductCategoryChartProps> = ({
  orders,
  shops,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  // Process product category data
  const getProductCategoryData = (): ProductCategoryData[] => {
    const productMap = new Map<string, ProductCategoryData>();

    orders.forEach((order) => {
      const shop = shops.find((s) => s.id === order.shopId);
      if (!shop) return;

      const category = shop.category;

      order.orderItems.forEach((item) => {
        const productId = item.sku.id;
        const productName = item.sku.name;

        if (!productMap.has(productId)) {
          productMap.set(productId, {
            productId,
            productName,
            wholeseller: { quantity: 0, revenue: 0, orders: 0 },
            retailer: { quantity: 0, revenue: 0, orders: 0 },
          });
        }

        const prodData = productMap.get(productId)!;
        const itemRevenue =
          item.quantity *
          (item.unitType === "box" ? item.sku.boxPrice : item.sku.price);

        prodData[category].quantity += Number(item.quantity);
        prodData[category].revenue += itemRevenue;
        prodData[category].orders += 1;
      });
    });

    return Array.from(productMap.values()).sort(
      (a, b) =>
        b.wholeseller.revenue +
        b.retailer.revenue -
        (a.wholeseller.revenue + a.retailer.revenue)
    );
  };

  // Calculate category summary
  const getCategorySummary = (): CategorySummary[] => {
    const summary: { [key: string]: CategorySummary } = {
      wholeseller: {
        category: "wholeseller",
        totalRevenue: 0,
        totalOrders: 0,
        totalQuantity: 0,
        avgOrderValue: 0,
      },
      retailer: {
        category: "retailer",
        totalRevenue: 0,
        totalOrders: 0,
        totalQuantity: 0,
        avgOrderValue: 0,
      },
    };

    orders.forEach((order) => {
      const shop = shops.find((s) => s.id === order.shopId);
      if (!shop) return;

      const category = shop.category;
      summary[category].totalRevenue += order.finalAmount;
      summary[category].totalOrders += 1;

      order.orderItems.forEach((item) => {
        summary[category].totalQuantity += Number(item.quantity);
      });
    });

    summary.wholeseller.avgOrderValue =
      summary.wholeseller.totalOrders > 0
        ? summary.wholeseller.totalRevenue / summary.wholeseller.totalOrders
        : 0;
    summary.retailer.avgOrderValue =
      summary.retailer.totalOrders > 0
        ? summary.retailer.totalRevenue / summary.retailer.totalOrders
        : 0;

    return Object.values(summary);
  };

  const productData = getProductCategoryData();
  const categorySummary = getCategorySummary();
  const products = productData.map((p) => ({
    id: p.productId,
    name: p.productName,
  }));

  // Filter data based on selected product
  const filteredData =
    selectedProduct === "all"
      ? productData
      : productData.filter((p) => p.productId === selectedProduct);

  // Prepare data for charts
  const chartData = filteredData.map((p) => ({
    name: p.productName,
    Wholeseller: Math.round(p.wholeseller.revenue),
    Retailer: Math.round(p.retailer.revenue),
  }));

  const pieData = [
    {
      name: "Wholeseller",
      value: Math.round(categorySummary[0].totalRevenue),
    },
    {
      name: "Retailer",
      value: Math.round(categorySummary[1].totalRevenue),
    },
  ];

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString()}`;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Product Orders by Customer Category
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Compare sales performance between wholesellers and retailers
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "#e3f2fd", border: "2px solid #1976d2" }}>
            <CardContent>
              <Typography variant="subtitle2" color="#1976d2" fontWeight="bold">
                Wholeseller Sales
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="#1976d2">
                {formatCurrency(categorySummary[0].totalRevenue)}
              </Typography>
              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Orders
                  </Typography>
                  <Typography variant="h6">
                    {categorySummary[0].totalOrders}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Avg Order Value
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(categorySummary[0].avgOrderValue)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Units
                  </Typography>
                  <Typography variant="h6">
                    {categorySummary[0].totalQuantity}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "#e8f5e9", border: "2px solid #2e7d32" }}>
            <CardContent>
              <Typography variant="subtitle2" color="#2e7d32" fontWeight="bold">
                Retailer Sales
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                {formatCurrency(categorySummary[1].totalRevenue)}
              </Typography>
              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Orders
                  </Typography>
                  <Typography variant="h6">
                    {categorySummary[1].totalOrders}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Avg Order Value
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(categorySummary[1].avgOrderValue)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Units
                  </Typography>
                  <Typography variant="h6">
                    {categorySummary[1].totalQuantity}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Product Filter</InputLabel>
          <Select
            value={selectedProduct}
            label="Product Filter"
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <MenuItem value="all">All Products</MenuItem>
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Chart Type</InputLabel>
          <Select
            value={chartType}
            label="Chart Type"
            onChange={(e) => setChartType(e.target.value as "bar" | "pie")}
          >
            <MenuItem value="bar">Bar Chart</MenuItem>
            <MenuItem value="pie">Pie Chart</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Charts */}
      {chartType === "bar" ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={120}
              style={{ fontSize: "11px" }}
            />
            <YAxis tickFormatter={formatCurrency} style={{ fontSize: "12px" }} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ fontSize: "12px" }}
            />
            <Legend />
            <Bar
              dataKey="Wholeseller"
              fill={COLORS.wholeseller}
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="Retailer"
              fill={COLORS.retailer}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${percent ? (percent * 100).toFixed(1) : 0}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "Wholeseller"
                        ? COLORS.wholeseller
                        : COLORS.retailer
                    }
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Product Breakdown Table */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Product-wise Category Breakdown
        </Typography>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell align="right">
                  <strong>Wholeseller Revenue</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Wholeseller Orders</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Retailer Revenue</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Retailer Orders</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Total Revenue</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((product) => {
                const totalRevenue =
                  product.wholeseller.revenue + product.retailer.revenue;
                return (
                  <TableRow key={product.productId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {product.productName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="#1976d2" fontWeight="bold">
                        {formatCurrency(product.wholeseller.revenue)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({product.wholeseller.quantity} units)
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={product.wholeseller.orders}
                        size="small"
                        sx={{ bgcolor: "#1976d2", color: "white" }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="#2e7d32" fontWeight="bold">
                        {formatCurrency(product.retailer.revenue)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({product.retailer.quantity} units)
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={product.retailer.orders}
                        size="small"
                        sx={{ bgcolor: "#2e7d32", color: "white" }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatCurrency(totalRevenue)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default ProductCategoryChart;
