import React from "react";
import { Paper, Typography, Box } from "@mui/material";
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

interface MonthlyRevenueChartProps {
  orders: Order[];
  chartType?: "line" | "bar";
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({
  orders,
  chartType = "bar",
}) => {
  // Group orders by month
  const getMonthlyData = (): MonthlyData[] => {
    const monthlyMap = new Map<string, { revenue: number; orderCount: number }>();

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

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
    </Paper>
  );
};

export default MonthlyRevenueChart;
