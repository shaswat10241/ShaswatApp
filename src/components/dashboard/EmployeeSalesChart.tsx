import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Order } from "../../models/Order";
import { Shop } from "../../models/Shop";
import { User } from "../../services/userStore";

interface EmployeeSalesChartProps {
  orders: Order[];
  shops: Shop[];
  employees: User[];
}

interface EmployeeData {
  employeeId: string;
  employeeName: string;
  revenue: number;
  orderCount: number;
  districts: { [district: string]: { revenue: number; orders: number } };
}

interface DistrictData {
  district: string;
  revenue: number;
  orders: number;
  employees: number;
}

const COLORS = [
  "#1976d2",
  "#2e7d32",
  "#d32f2f",
  "#f57c00",
  "#7b1fa2",
  "#0288d1",
  "#388e3c",
  "#c62828",
];

const EmployeeSalesChart: React.FC<EmployeeSalesChartProps> = ({
  orders,
  shops,
  employees,
}) => {
  const [viewMode, setViewMode] = useState<"employee" | "district">(
    "employee"
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  // Process employee sales data
  const getEmployeeData = (): EmployeeData[] => {
    const employeeMap = new Map<string, EmployeeData>();

    orders.forEach((order) => {
      if (!order.employeeId) return;

      const shop = shops.find((s) => s.id === order.shopId);
      const district = shop?.district || "Unknown";

      if (!employeeMap.has(order.employeeId)) {
        const employee = employees.find((e) => e.id === order.employeeId);
        employeeMap.set(order.employeeId, {
          employeeId: order.employeeId,
          employeeName: employee?.name || "Unknown Employee",
          revenue: 0,
          orderCount: 0,
          districts: {},
        });
      }

      const empData = employeeMap.get(order.employeeId)!;
      empData.revenue += order.finalAmount;
      empData.orderCount += 1;

      if (!empData.districts[district]) {
        empData.districts[district] = { revenue: 0, orders: 0 };
      }
      empData.districts[district].revenue += order.finalAmount;
      empData.districts[district].orders += 1;
    });

    return Array.from(employeeMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );
  };

  // Process district sales data
  const getDistrictData = (): DistrictData[] => {
    const districtMap = new Map<string, DistrictData>();

    orders.forEach((order) => {
      const shop = shops.find((s) => s.id === order.shopId);
      const district = shop?.district || "Unknown";

      if (!districtMap.has(district)) {
        districtMap.set(district, {
          district,
          revenue: 0,
          orders: 0,
          employees: new Set<string>().size,
        });
      }

      const distData = districtMap.get(district)!;
      distData.revenue += order.finalAmount;
      distData.orders += 1;
    });

    // Count unique employees per district
    districtMap.forEach((data, district) => {
      const employeeSet = new Set(
        orders
          .filter((o) => {
            const shop = shops.find((s) => s.id === o.shopId);
            return (shop?.district || "Unknown") === district && o.employeeId;
          })
          .map((o) => o.employeeId!)
      );
      data.employees = employeeSet.size;
    });

    return Array.from(districtMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );
  };

  const employeeData = getEmployeeData();
  const districtData = getDistrictData();
  const districts = Array.from(
    new Set(districtData.map((d) => d.district))
  ).sort();

  // Filter employee data by district if selected
  const filteredEmployeeData =
    selectedDistrict === "all"
      ? employeeData
      : employeeData
          .map((emp) => {
            const districtRevenue =
              emp.districts[selectedDistrict]?.revenue || 0;
            const districtOrders = emp.districts[selectedDistrict]?.orders || 0;
            return {
              ...emp,
              revenue: districtRevenue,
              orderCount: districtOrders,
            };
          })
          .filter((emp) => emp.revenue > 0)
          .sort((a, b) => b.revenue - a.revenue);

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
            Employee Sales Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Performance breakdown by employee and district
          </Typography>
        </Box>
      </Box>

      {/* View Mode Tabs */}
      <Tabs
        value={viewMode}
        onChange={(_, newValue) => setViewMode(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="By Employee" value="employee" />
        <Tab label="By District" value="district" />
      </Tabs>

      {viewMode === "employee" && (
        <>
          {/* District Filter for Employee View */}
          <Box sx={{ mb: 3 }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Filter by District</InputLabel>
              <Select
                value={selectedDistrict}
                label="Filter by District"
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <MenuItem value="all">All Districts</MenuItem>
                {districts.map((district) => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Employee Bar Chart */}
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredEmployeeData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="employeeName"
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
              <Bar dataKey="revenue" name="Revenue" radius={[8, 8, 0, 0]}>
                {filteredEmployeeData.slice(0, 10).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Employee District Breakdown Table */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              District-wise Breakdown
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Employee</strong></TableCell>
                    {districts.slice(0, 5).map((district) => (
                      <TableCell key={district} align="right">
                        <strong>{district}</strong>
                      </TableCell>
                    ))}
                    <TableCell align="right"><strong>Total</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employeeData.slice(0, 10).map((emp) => (
                    <TableRow key={emp.employeeId} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {emp.employeeName}
                        </Typography>
                      </TableCell>
                      {districts.slice(0, 5).map((district) => (
                        <TableCell key={district} align="right">
                          {emp.districts[district] ? (
                            <Box>
                              <Typography variant="caption" color="success.main">
                                {formatCurrency(emp.districts[district].revenue)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                ({emp.districts[district].orders} orders)
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatCurrency(emp.revenue)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({emp.orderCount} orders)
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}

      {viewMode === "district" && (
        <>
          {/* District Bar Chart */}
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={districtData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="district"
                angle={-45}
                textAnchor="end"
                height={100}
                style={{ fontSize: "12px" }}
              />
              <YAxis tickFormatter={formatCurrency} style={{ fontSize: "12px" }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ fontSize: "12px" }}
              />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#1976d2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* District Summary Table */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              District Performance Summary
            </Typography>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "grey.100" }}>
                  <TableRow>
                    <TableCell><strong>District</strong></TableCell>
                    <TableCell align="right"><strong>Revenue</strong></TableCell>
                    <TableCell align="right"><strong>Orders</strong></TableCell>
                    <TableCell align="right"><strong>Active Employees</strong></TableCell>
                    <TableCell align="right"><strong>Avg Order Value</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {districtData.map((district) => (
                    <TableRow key={district.district} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {district.district}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          {formatCurrency(district.revenue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={district.orders} size="small" color="primary" />
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={district.employees} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(
                            Math.round(district.revenue / district.orders)
                          )}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default EmployeeSalesChart;
