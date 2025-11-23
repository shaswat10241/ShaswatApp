import React from "react";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Order } from "../../models/Order";
import { Shop } from "../../models/Shop";

interface MonthlyRevenueChartProps {
  orders: Order[];
  shops: Shop[];
  chartType?: "line" | "bar";
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

interface MonthlySkuData {
  month: string;
  [skuName: string]: number | string; // Dynamic SKU names with revenue values
}

// Color palette for SKUs
const SKU_COLORS = [
  "#1976d2", // Blue
  "#2e7d32", // Green
  "#d32f2f", // Red
  "#f57c00", // Orange
  "#7b1fa2", // Purple
  "#0288d1", // Light Blue
  "#388e3c", // Light Green
  "#c62828", // Dark Red
  "#ef6c00", // Dark Orange
  "#5e35b1", // Deep Purple
  "#0097a7", // Cyan
  "#689f38", // Light Green
  "#f44336", // Red
  "#ff9800", // Orange
  "#9c27b0", // Purple
];

const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({
  orders,
  shops,
  chartType = "bar",
}) => {
  // Group orders by month
  const getMonthlyData = (): MonthlyData[] => {
    const monthlyMap = new Map<string, { revenue: number; orderCount: number }>();

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { revenue: 0, orderCount: 0 });
      }

      const data = monthlyMap.get(monthKey)!;
      data.revenue += order.finalAmount;
      data.orderCount += 1;
    });

    // Convert to array and sort by month
    const sortedData = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, data]) => {
        const [year, month] = key.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthLabel = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

        return {
          month: monthLabel,
          revenue: Math.round(data.revenue),
          orders: data.orderCount,
          avgOrderValue: Math.round(data.revenue / data.orderCount),
        };
      });

    // Get last 12 months
    return sortedData.slice(-12);
  };

  // Group orders by month and SKU for the chart
  const getMonthlySkuData = (): { data: MonthlySkuData[]; skus: string[] } => {
    const monthlySkuMap = new Map<string, Map<string, number>>();
    const skuSet = new Set<string>();

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthLabel = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!monthlySkuMap.has(monthLabel)) {
        monthlySkuMap.set(monthLabel, new Map<string, number>());
      }

      const monthData = monthlySkuMap.get(monthLabel)!;

      order.orderItems.forEach((item) => {
        const skuName = item.sku.name;
        skuSet.add(skuName);

        const currentRevenue = monthData.get(skuName) || 0;
        const itemRevenue =
          item.quantity *
          (item.unitType === "box" ? item.sku.boxPrice : item.sku.price);
        monthData.set(skuName, currentRevenue + itemRevenue);
      });
    });

    // Convert to array format for recharts
    const chartData: MonthlySkuData[] = [];
    const sortedMonths = Array.from(monthlySkuMap.keys()).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    sortedMonths.slice(-12).forEach((month) => {
      const monthData: MonthlySkuData = { month };
      const skuData = monthlySkuMap.get(month)!;

      skuData.forEach((revenue, skuName) => {
        monthData[skuName] = Math.round(revenue);
      });

      chartData.push(monthData);
    });

    return {
      data: chartData,
      skus: Array.from(skuSet).sort(),
    };
  };

  const monthlyData = getMonthlyData();
  const { data: monthlySkuChartData, skus: allSkus } = getMonthlySkuData();

  // Get SKU sales by month for the last 3 months
  const getSkuSalesByMonth = (): {
    skuRows: { skuName: string; months: Map<string, { revenue: number; quantity: number }> }[];
    recentMonths: string[];
  } => {
    const skuMonthMap = new Map<string, Map<string, { revenue: number; quantity: number }>>();

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthLabel = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      order.orderItems.forEach((item) => {
        const skuName = item.sku.name;

        if (!skuMonthMap.has(skuName)) {
          skuMonthMap.set(skuName, new Map());
        }

        const monthMap = skuMonthMap.get(skuName)!;
        if (!monthMap.has(monthLabel)) {
          monthMap.set(monthLabel, { revenue: 0, quantity: 0 });
        }

        const itemRevenue =
          item.quantity *
          (item.unitType === "box" ? item.sku.boxPrice : item.sku.price);

        const monthData = monthMap.get(monthLabel)!;
        monthData.revenue += itemRevenue;
        monthData.quantity += item.quantity;
      });
    });

    // Get all unique months sorted
    const allMonths = Array.from(
      new Set(
        Array.from(skuMonthMap.values()).flatMap((monthMap) =>
          Array.from(monthMap.keys())
        )
      )
    ).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    // Get last 3 months
    const recentMonths = allMonths.slice(-3);

    // Convert to array format
    const skuRows = Array.from(skuMonthMap.entries())
      .map(([skuName, months]) => ({
        skuName,
        months,
      }))
      .sort((a, b) => a.skuName.localeCompare(b.skuName));

    return { skuRows, recentMonths };
  };

  const { skuRows, recentMonths } = getSkuSalesByMonth();

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString()}`;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Monthly Sales Performance
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Revenue breakdown by product (SKU) over the last 12 months - each color represents a different SKU
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        {chartType === "line" ? (
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              angle={-45}
              textAnchor="end"
              height={80}
              style={{ fontSize: "12px" }}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={formatCurrency}
              style={{ fontSize: "12px" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "revenue" || name === "avgOrderValue") {
                  return formatCurrency(value);
                }
                return value;
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#1976d2"
              strokeWidth={3}
              name="Revenue"
              dot={{ r: 5 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#2e7d32"
              strokeWidth={2}
              name="Orders"
              dot={{ r: 4 }}
            />
          </LineChart>
        ) : (
          <BarChart data={monthlySkuChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              angle={-45}
              textAnchor="end"
              height={80}
              style={{ fontSize: "12px" }}
            />
            <YAxis tickFormatter={formatCurrency} style={{ fontSize: "12px" }} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ fontSize: "12px" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px" }}
              iconSize={10}
            />
            {allSkus.map((sku, index) => (
              <Bar
                key={sku}
                dataKey={sku}
                stackId="a"
                fill={SKU_COLORS[index % SKU_COLORS.length]}
                name={sku}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>

      {/* Summary Stats */}
      <Box sx={{ mt: 3, display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Total Revenue (Last 12 Months)
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="primary">
            {formatCurrency(monthlyData.reduce((sum, d) => sum + d.revenue, 0))}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Total Orders (Last 12 Months)
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="success.main">
            {monthlyData.reduce((sum, d) => sum + d.orders, 0)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Average Monthly Revenue
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="info.main">
            {formatCurrency(
              Math.round(
                monthlyData.reduce((sum, d) => sum + d.revenue, 0) /
                  monthlyData.length
              )
            )}
          </Typography>
        </Box>
      </Box>

      {/* SKU Sales by Month Table */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          SKU Sales by Month (Last 3 Months)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Revenue and quantity breakdown for each product over the last 3 months
        </Typography>
        <TableContainer sx={{ maxHeight: 500, overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "grey.100", fontWeight: "bold", minWidth: 150 }}>
                  Product (SKU)
                </TableCell>
                {recentMonths.map((month) => (
                  <TableCell
                    key={month}
                    align="right"
                    sx={{ bgcolor: "grey.100", fontWeight: "bold", minWidth: 120 }}
                  >
                    {month}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {skuRows.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {row.skuName}
                    </Typography>
                  </TableCell>
                  {recentMonths.map((month) => (
                    <TableCell key={month} align="right">
                      {row.months.has(month) ? (
                        <Box>
                          <Typography variant="caption" color="success.main" fontWeight="bold">
                            {formatCurrency(row.months.get(month)!.revenue)}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            ({row.months.get(month)!.quantity} units)
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default MonthlyRevenueChart;
