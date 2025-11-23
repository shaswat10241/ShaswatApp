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

interface MonthlySkuNeighborhoodData {
  month: string;
  skuName: string;
  neighborhoods: { [neighborhood: string]: { revenue: number; quantity: number } };
}

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

  const monthlyData = getMonthlyData();

  // Get neighborhood breakdown by SKU for each month
  const getMonthlySkuNeighborhoodData = (): MonthlySkuNeighborhoodData[] => {
    const dataMap = new Map<string, MonthlySkuNeighborhoodData>();

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      const shop = shops.find((s) => s.id === order.shopId);
      const neighborhood = shop?.location?.trim() || "Unknown Location";

      order.orderItems.forEach((item) => {
        const key = `${monthKey}-${item.sku.id}`;

        if (!dataMap.has(key)) {
          dataMap.set(key, {
            month: monthLabel,
            skuName: item.sku.name,
            neighborhoods: {},
          });
        }

        const data = dataMap.get(key)!;
        if (!data.neighborhoods[neighborhood]) {
          data.neighborhoods[neighborhood] = { revenue: 0, quantity: 0 };
        }

        const itemRevenue =
          item.quantity *
          (item.unitType === "box" ? item.sku.boxPrice : item.sku.price);

        data.neighborhoods[neighborhood].revenue += itemRevenue;
        data.neighborhoods[neighborhood].quantity += item.quantity;
      });
    });

    return Array.from(dataMap.values()).sort((a, b) => {
      const monthCompare = a.month.localeCompare(b.month);
      if (monthCompare !== 0) return monthCompare;
      return a.skuName.localeCompare(b.skuName);
    });
  };

  const skuNeighborhoodData = getMonthlySkuNeighborhoodData();

  // Get unique neighborhoods for table columns
  const allNeighborhoods = Array.from(
    new Set(
      skuNeighborhoodData.flatMap((data) =>
        Object.keys(data.neighborhoods)
      )
    )
  ).sort();

  // Get last 3 months for the SKU table
  const recentMonths = Array.from(
    new Set(skuNeighborhoodData.map((d) => d.month))
  ).slice(-3);

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString()}`;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Monthly Sales Performance
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Revenue and order trends over the last 12 months
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
          <BarChart data={monthlyData}>
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
              formatter={(value: number, name: string) => {
                if (name === "revenue" || name === "avgOrderValue") {
                  return formatCurrency(value);
                }
                return value;
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#1976d2" name="Revenue" />
            <Bar dataKey="avgOrderValue" fill="#2e7d32" name="Avg Order Value" />
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

      {/* SKU Neighborhood Breakdown Table */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          SKU Sales by Neighborhood (Last 3 Months)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Revenue and quantity breakdown for each product across different neighborhoods
        </Typography>
        <TableContainer sx={{ maxHeight: 500, overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "grey.100", fontWeight: "bold", minWidth: 100 }}>
                  Month
                </TableCell>
                <TableCell sx={{ bgcolor: "grey.100", fontWeight: "bold", minWidth: 150 }}>
                  Product (SKU)
                </TableCell>
                {allNeighborhoods.slice(0, 8).map((neighborhood) => (
                  <TableCell
                    key={neighborhood}
                    align="right"
                    sx={{ bgcolor: "grey.100", fontWeight: "bold", minWidth: 120 }}
                  >
                    {neighborhood}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {skuNeighborhoodData
                .filter((data) => recentMonths.includes(data.month))
                .map((data, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="caption" fontWeight="500">
                        {data.month}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {data.skuName}
                      </Typography>
                    </TableCell>
                    {allNeighborhoods.slice(0, 8).map((neighborhood) => (
                      <TableCell key={neighborhood} align="right">
                        {data.neighborhoods[neighborhood] ? (
                          <Box>
                            <Typography variant="caption" color="success.main" fontWeight="bold">
                              {formatCurrency(data.neighborhoods[neighborhood].revenue)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ fontSize: "0.7rem" }}
                            >
                              ({data.neighborhoods[neighborhood].quantity} units)
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
        {allNeighborhoods.length > 8 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Note: Showing first 8 neighborhoods out of {allNeighborhoods.length} total
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default MonthlyRevenueChart;
