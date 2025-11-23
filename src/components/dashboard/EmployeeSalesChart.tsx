import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
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

interface EmployeeSkuNeighborhoodData {
  employeeId: string;
  employeeName: string;
  skuName: string;
  neighborhoods: { [neighborhood: string]: { revenue: number; quantity: number } };
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
  "#ef6c00",
  "#5e35b1",
  "#0097a7",
  "#689f38",
  "#f44336",
  "#ff9800",
  "#9c27b0",
];

const EmployeeSalesChart: React.FC<EmployeeSalesChartProps> = ({
  orders,
  shops,
  employees,
}) => {
  const [viewMode, setViewMode] = useState<"employee" | "district" | "sku">(
    "employee"
  );

  // Process employee sales data
  const getEmployeeData = (): EmployeeData[] => {
    const employeeMap = new Map<string, EmployeeData>();

    orders.forEach((order) => {
      if (!order.employeeId) return;

      const shop = shops.find((s) => s.id === order.shopId);
      // Get district, treating empty strings as Unknown
      const district = shop?.district?.trim() || "Unknown";

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
      // Get district, treating empty strings as Unknown
      const district = shop?.district?.trim() || "Unknown";

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
            const shopDistrict = shop?.district?.trim() || "Unknown";
            return shopDistrict === district && o.employeeId;
          })
          .map((o) => o.employeeId!)
      );
      data.employees = employeeSet.size;
    });

    return Array.from(districtMap.values())
      .filter((d) => d.district !== "Unknown") // Exclude Unknown from district view
      .sort((a, b) => b.revenue - a.revenue);
  };

  // Process employee SKU breakdown for grouped bar chart
  const getEmployeeSkuBreakdown = (): { data: any[]; skus: string[] } => {
    const employeeSkuMap = new Map<string, Map<string, number>>();
    const skuSet = new Set<string>();

    orders.forEach((order) => {
      if (!order.employeeId) return;

      const employee = employees.find((e) => e.id === order.employeeId);
      const employeeName = employee?.name || "Unknown Employee";

      if (!employeeSkuMap.has(employeeName)) {
        employeeSkuMap.set(employeeName, new Map());
      }

      const skuMap = employeeSkuMap.get(employeeName)!;

      order.orderItems.forEach((item) => {
        const skuName = item.sku.name;
        skuSet.add(skuName);

        const itemRevenue =
          item.quantity *
          (item.unitType === "box" ? item.sku.boxPrice : item.sku.price);

        const currentRevenue = skuMap.get(skuName) || 0;
        skuMap.set(skuName, currentRevenue + itemRevenue);
      });
    });

    // Convert to chart data format
    const chartData = Array.from(employeeSkuMap.entries()).map(([employeeName, skuMap]) => {
      const dataPoint: any = { employeeName };
      skuMap.forEach((revenue, skuName) => {
        dataPoint[skuName] = Math.round(revenue);
      });
      return dataPoint;
    });

    // Sort by total revenue
    chartData.sort((a, b) => {
      const totalA = Object.keys(a).reduce((sum, key) => {
        if (key !== "employeeName") return sum + (a[key] || 0);
        return sum;
      }, 0);
      const totalB = Object.keys(b).reduce((sum, key) => {
        if (key !== "employeeName") return sum + (b[key] || 0);
        return sum;
      }, 0);
      return totalB - totalA;
    });

    return {
      data: chartData.slice(0, 10), // Top 10 employees
      skus: Array.from(skuSet).sort(),
    };
  };

  // Process employee SKU neighborhood data
  const getEmployeeSkuNeighborhoodData = (): EmployeeSkuNeighborhoodData[] => {
    const dataMap = new Map<string, EmployeeSkuNeighborhoodData>();

    orders.forEach((order) => {
      if (!order.employeeId) return;

      const employee = employees.find((e) => e.id === order.employeeId);
      const employeeName = employee?.name || "Unknown Employee";
      const shop = shops.find((s) => s.id === order.shopId);
      const neighborhood = shop?.location?.trim() || "Unknown Location";

      order.orderItems.forEach((item) => {
        const key = `${order.employeeId}-${item.sku.id}`;

        if (!dataMap.has(key)) {
          dataMap.set(key, {
            employeeId: order.employeeId!,
            employeeName,
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
      const employeeCompare = a.employeeName.localeCompare(b.employeeName);
      if (employeeCompare !== 0) return employeeCompare;
      return a.skuName.localeCompare(b.skuName);
    });
  };

  // Process SKU sales by district for stacked bar chart
  const getSkuDistrictBreakdown = (): { data: any[]; skus: string[] } => {
    const districtSkuMap = new Map<string, Map<string, number>>();
    const skuSet = new Set<string>();

    orders.forEach((order) => {
      const shop = shops.find((s) => s.id === order.shopId);
      const district = shop?.district?.trim() || "Unknown";

      // Skip Unknown districts for the chart
      if (district === "Unknown") return;

      if (!districtSkuMap.has(district)) {
        districtSkuMap.set(district, new Map());
      }

      const skuMap = districtSkuMap.get(district)!;

      order.orderItems.forEach((item) => {
        const skuName = item.sku.name;
        skuSet.add(skuName);

        const itemRevenue =
          item.quantity *
          (item.unitType === "box" ? item.sku.boxPrice : item.sku.price);

        const currentRevenue = skuMap.get(skuName) || 0;
        skuMap.set(skuName, currentRevenue + itemRevenue);
      });
    });

    // Convert to chart data format
    const chartData = Array.from(districtSkuMap.entries()).map(([district, skuMap]) => {
      const dataPoint: any = { district };
      skuMap.forEach((revenue, skuName) => {
        dataPoint[skuName] = Math.round(revenue);
      });
      return dataPoint;
    });

    // Sort by total revenue
    chartData.sort((a, b) => {
      const totalA = Object.keys(a).reduce((sum, key) => {
        if (key !== "district") return sum + (a[key] || 0);
        return sum;
      }, 0);
      const totalB = Object.keys(b).reduce((sum, key) => {
        if (key !== "district") return sum + (b[key] || 0);
        return sum;
      }, 0);
      return totalB - totalA;
    });

    return {
      data: chartData,
      skus: Array.from(skuSet).sort(),
    };
  };

  // Process district-employee breakdown for stacked bar chart
  const getDistrictEmployeeBreakdown = (): { data: any[]; employees: string[] } => {
    const districtEmployeeMap = new Map<string, Map<string, number>>();
    const employeeSet = new Set<string>();

    orders.forEach((order) => {
      if (!order.employeeId) return;

      const shop = shops.find((s) => s.id === order.shopId);
      const district = shop?.district?.trim() || "Unknown";

      // Skip Unknown districts for the chart
      if (district === "Unknown") return;

      const employee = employees.find((e) => e.id === order.employeeId);
      const employeeName = employee?.name || "Unknown Employee";

      employeeSet.add(employeeName);

      if (!districtEmployeeMap.has(district)) {
        districtEmployeeMap.set(district, new Map());
      }

      const employeeMap = districtEmployeeMap.get(district)!;
      const currentRevenue = employeeMap.get(employeeName) || 0;
      employeeMap.set(employeeName, currentRevenue + order.finalAmount);
    });

    // Convert to chart data format
    const chartData = Array.from(districtEmployeeMap.entries()).map(([district, employeeMap]) => {
      const dataPoint: any = { district };
      employeeMap.forEach((revenue, employeeName) => {
        dataPoint[employeeName] = Math.round(revenue);
      });
      return dataPoint;
    });

    // Sort by total revenue
    chartData.sort((a, b) => {
      const totalA = Object.keys(a).reduce((sum, key) => {
        if (key !== "district") return sum + (a[key] || 0);
        return sum;
      }, 0);
      const totalB = Object.keys(b).reduce((sum, key) => {
        if (key !== "district") return sum + (b[key] || 0);
        return sum;
      }, 0);
      return totalB - totalA;
    });

    return {
      data: chartData,
      employees: Array.from(employeeSet).sort(),
    };
  };

  const employeeData = getEmployeeData();
  const districtData = getDistrictData();
  const { data: employeeSkuChartData, skus: allSkus } = getEmployeeSkuBreakdown();
  const employeeSkuNeighborhoodData = getEmployeeSkuNeighborhoodData();
  const { data: districtEmployeeChartData, employees: allEmployees } = getDistrictEmployeeBreakdown();
  const { data: skuDistrictChartData, skus: allSkusForDistrict } = getSkuDistrictBreakdown();

  const districts = Array.from(
    new Set(districtData.map((d) => d.district))
  ).sort();

  // Get unique neighborhoods for table columns
  const allNeighborhoods = Array.from(
    new Set(
      employeeSkuNeighborhoodData.flatMap((data) =>
        Object.keys(data.neighborhoods)
      )
    )
  ).sort();

  // Calculate shops with missing district data
  const shopsWithoutDistrict = shops.filter(
    (shop) => !shop.district || shop.district.trim() === ""
  );
  const ordersWithoutDistrict = orders.filter((order) => {
    const shop = shops.find((s) => s.id === order.shopId);
    return !shop?.district || shop.district.trim() === "";
  });

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
        <Tab label="By SKU" value="sku" />
      </Tabs>

      {/* Warning for shops without district data */}
      {shopsWithoutDistrict.length > 0 && (
        <Box sx={{ mb: 3, p: 2, bgcolor: "warning.light", borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="500" gutterBottom>
            ⚠️ {shopsWithoutDistrict.length} shop(s) are missing district information
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {ordersWithoutDistrict.length} order(s) cannot be categorized by district.
            Please update the district field for these shops to see complete district analysis.
          </Typography>
        </Box>
      )}

      {viewMode === "employee" && (
        <>
          {/* Employee SKU Breakdown Chart */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              SKU Breakdown by Employee
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Which products each salesperson is selling - grouped by SKU
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={employeeSkuChartData}>
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
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  iconSize={10}
                />
                {allSkus.map((sku, index) => (
                  <Bar
                    key={sku}
                    dataKey={sku}
                    stackId="a"
                    fill={COLORS[index % COLORS.length]}
                    name={sku}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>

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

          {/* Employee SKU Neighborhood Breakdown Table */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              SKU Sales by Neighborhood (Per Employee)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Revenue and quantity breakdown for each product sold by employees across different neighborhoods
            </Typography>
            <TableContainer sx={{ maxHeight: 500, overflowX: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "grey.100", fontWeight: "bold", minWidth: 150 }}>
                      Employee
                    </TableCell>
                    <TableCell sx={{ bgcolor: "grey.100", fontWeight: "bold", minWidth: 150 }}>
                      Product (SKU)
                    </TableCell>
                    {allNeighborhoods.slice(0, 6).map((neighborhood) => (
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
                  {employeeSkuNeighborhoodData.map((data, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {data.employeeName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {data.skuName}
                        </Typography>
                      </TableCell>
                      {allNeighborhoods.slice(0, 6).map((neighborhood) => (
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
            {allNeighborhoods.length > 6 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Note: Showing first 6 neighborhoods out of {allNeighborhoods.length} total
              </Typography>
            )}
          </Box>
        </>
      )}

      {viewMode === "district" && (
        <>
          {/* District Employee Breakdown Chart */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Employee Breakdown by District
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Which employees are contributing to each district's sales
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={districtEmployeeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="district"
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
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  iconSize={10}
                />
                {allEmployees.map((employee, index) => (
                  <Bar
                    key={employee}
                    dataKey={employee}
                    stackId="a"
                    fill={COLORS[index % COLORS.length]}
                    name={employee}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* District Bar Chart */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Total Revenue by District
            </Typography>
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
          </Box>

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

          {/* Employee Performance by District Table */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Employee Performance by District
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Detailed breakdown of each employee's sales across districts
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "grey.100", fontWeight: "bold", minWidth: 150 }}>
                      Employee
                    </TableCell>
                    {districts.map((district) => (
                      <TableCell
                        key={district}
                        align="right"
                        sx={{ bgcolor: "grey.100", fontWeight: "bold", minWidth: 120 }}
                      >
                        {district}
                      </TableCell>
                    ))}
                    <TableCell
                      align="right"
                      sx={{ bgcolor: "grey.100", fontWeight: "bold", minWidth: 120 }}
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employeeData.map((emp) => (
                    <TableRow key={emp.employeeId} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {emp.employeeName}
                        </Typography>
                      </TableCell>
                      {districts.map((district) => (
                        <TableCell key={district} align="right">
                          {emp.districts[district] ? (
                            <Box>
                              <Typography variant="caption" color="success.main" fontWeight="bold">
                                {formatCurrency(emp.districts[district].revenue)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ fontSize: "0.7rem" }}
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
                        <Typography variant="caption" color="text.secondary" display="block">
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

      {viewMode === "sku" && (
        <>
          {/* SKU Sales by District Chart */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              SKU Sales Distribution by District
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Revenue breakdown for each product across different districts
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={skuDistrictChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="district"
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
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  iconSize={10}
                />
                {allSkusForDistrict.map((sku, index) => (
                  <Bar
                    key={sku}
                    dataKey={sku}
                    stackId="a"
                    fill={COLORS[index % COLORS.length]}
                    name={sku}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Employee SKU Neighborhood Breakdown Table */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              SKU Sales by Neighborhood
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Revenue and quantity breakdown for each product across different neighborhoods
            </Typography>
            <TableContainer sx={{ maxHeight: 500, overflowX: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "grey.100", fontWeight: "bold", minWidth: 150 }}>
                      Employee
                    </TableCell>
                    <TableCell sx={{ bgcolor: "grey.100", fontWeight: "bold", minWidth: 150 }}>
                      Product (SKU)
                    </TableCell>
                    {allNeighborhoods.slice(0, 6).map((neighborhood) => (
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
                  {employeeSkuNeighborhoodData.map((data, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {data.employeeName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {data.skuName}
                        </Typography>
                      </TableCell>
                      {allNeighborhoods.slice(0, 6).map((neighborhood) => (
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
            {allNeighborhoods.length > 6 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Note: Showing first 6 neighborhoods out of {allNeighborhoods.length} total
              </Typography>
            )}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default EmployeeSalesChart;
