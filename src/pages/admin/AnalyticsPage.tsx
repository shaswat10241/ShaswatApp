import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Menu,
  MenuItem as MenuItemOption,
  Chip,
  Divider,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import DownloadIcon from "@mui/icons-material/Download";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useOrderStore } from "../../services/orderStore";
import { useShopStore } from "../../services/shopStore";
import { useUserStore, User } from "../../services/userStore";
import { useDeliveryStore } from "../../services/deliveryStore";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isAdmin, users, fetchAllUsers, syncUserFromClerk, currentUser } = useUserStore();
  const { orders, fetchOrders } = useOrderStore();
  const { shops, fetchShops } = useShopStore();
  const { deliveries, fetchDeliveries } = useDeliveryStore();

  const [tabValue, setTabValue] = useState(0);
  const [salesPeriod, setSalesPeriod] = useState("monthly");
  const [productPeriod, setProductPeriod] = useState("monthly");
  const [employeePeriod, setEmployeePeriod] = useState("monthly");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Sync user from Clerk to database
  useEffect(() => {
    const syncUser = async () => {
      if (user?.emailAddresses?.[0]?.emailAddress && user?.fullName) {
        const email = user.emailAddresses[0].emailAddress;
        const name = user.fullName || "User";

        try {
          await syncUserFromClerk(email, name);
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      }
    };
    syncUser();
  }, [user, syncUserFromClerk]);

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/");
      return;
    }

    fetchOrders();
    fetchShops();
    fetchAllUsers();
    fetchDeliveries();
  }, [
    isAdmin,
    navigate,
    fetchOrders,
    fetchShops,
    fetchAllUsers,
    fetchDeliveries,
  ]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    signOut();
    navigate("/");
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Download Daily Order Summary as CSV
  const downloadDailyOrderSummary = () => {
    const dateStr = new Date(selectedDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // CSV Headers
    let csv =
      "Order Date,Time,Marketing Personnel,Email,Shop Name,Address,Phone,";
    csv +=
      "Product Name,Quantity,Unit Type,Unit Price,Line Total,Subtotal,Discount,Final Amount\n";

    // Add data rows
    dailyOrderSummary.orders.forEach((order) => {
      const orderDate = new Date(order.orderDate);
      const dateString = orderDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timeString = orderDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      order.orderItems.forEach((item, idx) => {
        const lineTotal =
          item.quantity *
          (item.unitType === "box" ? item.sku.boxPrice : item.sku.price);

        csv += `"${dateString}","${timeString}","${order.employeeName}","${order.employeeEmail}",`;
        csv += `"${order.shopName}","${order.shopLocation}","${order.shopPhone}",`;
        csv += `"${item.sku.name}",${item.quantity},"${item.unitType}",`;
        csv += `${item.unitType === "box" ? item.sku.boxPrice : item.sku.price},${lineTotal},`;

        // Only add totals on first item
        if (idx === 0) {
          csv += `${order.totalAmount},${order.discountAmount},${order.finalAmount}`;
        } else {
          csv += ",,";
        }
        csv += "\n";
      });
    });

    // Add grand total row
    csv += `\nGRAND TOTAL,,,,,,,,,,,${dailyOrderSummary.totalRevenue}\n`;

    // Create and download file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Daily_Order_Summary_${dateStr.replace(/\s/g, "_")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Preparation Summary as CSV
  const downloadPreparationSummary = () => {
    const dateStr = new Date(selectedDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // CSV Headers
    let csv =
      "Product Name,SKU ID,Packets to Prepare,Boxes to Prepare,Total Units\n";

    // Add data rows
    dailyOrderSummary.preparationSummary.forEach((item) => {
      csv += `"${item.skuName}","${item.skuId}",${item.packetQty},${item.boxQty},${item.packetQty + item.boxQty}\n`;
    });

    // Add totals row
    const totalPackets = dailyOrderSummary.preparationSummary.reduce(
      (sum, item) => sum + item.packetQty,
      0,
    );
    const totalBoxes = dailyOrderSummary.preparationSummary.reduce(
      (sum, item) => sum + item.boxQty,
      0,
    );
    const totalUnits = dailyOrderSummary.preparationSummary.reduce(
      (sum, item) => sum + item.packetQty + item.boxQty,
      0,
    );

    csv += `\nTOTAL,,${totalPackets},${totalBoxes},${totalUnits}\n`;

    // Create and download file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Preparation_Summary_${dateStr.replace(/\s/g, "_")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate sales data (exclude cancelled orders)
  const calculateSalesData = () => {
    const now = new Date();
    // Filter out cancelled orders
    const activeOrders = orders.filter((order) => {
      const delivery = deliveries.find((d) => d.orderId === order.id);
      return !delivery || delivery.status !== "Cancelled";
    });
    let filteredOrders = [...activeOrders];

    switch (salesPeriod) {
      case "daily":
        filteredOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === now.toDateString();
        });
        break;
      case "weekly":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredOrders = orders.filter(
          (order) => new Date(order.createdAt) >= weekAgo,
        );
        break;
      case "monthly":
        filteredOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        });
        break;
      case "annually":
        filteredOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getFullYear() === now.getFullYear();
        });
        break;
    }

    const totalSales = filteredOrders.reduce(
      (sum, order) => sum + order.finalAmount,
      0,
    );
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return { totalSales, totalOrders, averageOrderValue };
  };

  // Calculate product performance (exclude cancelled orders)
  const calculateProductPerformance = () => {
    const now = new Date();
    // Filter out cancelled orders
    const activeOrders = orders.filter((order) => {
      const delivery = deliveries.find((d) => d.orderId === order.id);
      return !delivery || delivery.status !== "Cancelled";
    });
    let filteredOrders = [...activeOrders];

    switch (productPeriod) {
      case "monthly":
        filteredOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        });
        break;
      case "annually":
        filteredOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getFullYear() === now.getFullYear();
        });
        break;
    }

    const productStats: {
      [key: string]: {
        name: string;
        quantity: number;
        revenue: number;
        orders: number;
      };
    } = {};

    filteredOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const key = item.sku.id;
        if (!productStats[key]) {
          productStats[key] = {
            name: item.sku.name,
            quantity: 0,
            revenue: 0,
            orders: 0,
          };
        }
        const pricePerUnit =
          item.unitType === "box" ? item.sku.boxPrice : item.sku.price;
        productStats[key].quantity += Number(item.quantity);
        productStats[key].revenue += pricePerUnit * item.quantity;
        productStats[key].orders += 1;
      });
    });

    return Object.values(productStats).sort((a, b) => b.revenue - a.revenue);
  };

  // Calculate employee sales using real order data with employee_id (exclude cancelled orders)
  const calculateEmployeeSales = () => {
    // Filter out cancelled orders
    const activeOrders = orders.filter((order) => {
      const delivery = deliveries.find((d) => d.orderId === order.id);
      return !delivery || delivery.status !== "Cancelled";
    });

    // Use filtered orders for employee calculations
    const ordersToUse = activeOrders;

    const employeeStats: {
      [key: string]: {
        employeeId: string;
        name: string;
        email: string;
        orders: number;
        revenue: number;
        totalUnits: number;
        avgOrderValue: number;
        runRatePerUnit: number;
      };
    } = {};

    // Filter orders by period (use activeOrders instead of all orders)
    const filteredOrders = ordersToUse.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (employeePeriod === "today") {
        return orderDate.toDateString() === new Date().toDateString();
      } else if (employeePeriod === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      } else if (employeePeriod === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return orderDate >= monthAgo;
      }
      return true; // all time
    });

    // Aggregate stats by employee
    filteredOrders.forEach((order) => {
      if (order.employeeId) {
        const employeeId = order.employeeId;

        if (!employeeStats[employeeId]) {
          // Find employee details from users store
          const employee = users.find((u: User) => u.id === employeeId);

          employeeStats[employeeId] = {
            employeeId: employeeId,
            name: employee?.name || "Unknown Employee",
            email: employee?.email || "N/A",
            orders: 0,
            revenue: 0,
            totalUnits: 0,
            avgOrderValue: 0,
            runRatePerUnit: 0,
          };
        }

        employeeStats[employeeId].orders += 1;
        employeeStats[employeeId].revenue += order.finalAmount;

        // Calculate total units from order items
        const orderUnits = order.orderItems.reduce((sum, item) => sum + Number(item.quantity), 0);
        employeeStats[employeeId].totalUnits += Number(orderUnits);
      }
    });

    // Calculate average order value, run rate per unit and convert to array
    const employeeArray = Object.values(employeeStats).map((emp) => ({
      ...emp,
      avgOrderValue: emp.orders > 0 ? emp.revenue / emp.orders : 0,
      runRatePerUnit: emp.totalUnits > 0 ? emp.revenue / emp.totalUnits : 0,
    }));

    return employeeArray.sort((a, b) => b.revenue - a.revenue);
  };

  // Calculate daily order summary (exclude cancelled orders)
  const calculateDailyOrderSummary = () => {
    const selectedDateObj = new Date(selectedDate);

    // Filter out cancelled orders
    const activeOrders = orders.filter((order) => {
      const delivery = deliveries.find((d) => d.orderId === order.id);
      return !delivery || delivery.status !== "Cancelled";
    });

    // Filter orders for the selected date
    const filteredOrders = activeOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === selectedDateObj.toDateString();
    });

    // Map orders with additional details
    const ordersWithDetails = filteredOrders.map((order) => {
      // Find shop details
      const shop = shops.find((s) => s.id === order.shopId);

      // Find employee details
      const employee = users.find((u) => u.id === order.employeeId);

      return {
        orderId: order.id,
        orderDate: new Date(order.createdAt),
        shopName: shop?.name || "Unknown Shop",
        shopLocation: shop?.location || "N/A",
        shopPhone: shop?.phoneNumber || "N/A",
        latitude: shop?.latitude,
        longitude: shop?.longitude,
        employeeName: employee?.name || "Unknown",
        employeeEmail: employee?.email || "N/A",
        orderItems: order.orderItems,
        totalAmount: order.totalAmount,
        discountAmount: order.discountAmount || 0,
        finalAmount: order.finalAmount,
      };
    });

    // Calculate preparation summary - aggregate by SKU
    const preparationSummary: {
      [key: string]: {
        skuId: string;
        skuName: string;
        packetQty: number;
        boxQty: number;
      };
    } = {};

    filteredOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const skuId = item.sku.id;

        if (!preparationSummary[skuId]) {
          preparationSummary[skuId] = {
            skuId: skuId,
            skuName: item.sku.name,
            packetQty: 0,
            boxQty: 0,
          };
        }

        // Add quantities based on unit type
        if (item.unitType === "packet") {
          preparationSummary[skuId].packetQty =
            Number(preparationSummary[skuId].packetQty || 0) +
            Number(item.quantity || 0);
        } else if (item.unitType === "box") {
          preparationSummary[skuId].boxQty =
            Number(preparationSummary[skuId].boxQty || 0) +
            Number(item.quantity || 0);
        }
      });
    });

    return {
      orders: ordersWithDetails,
      totalOrders: filteredOrders.length,
      totalRevenue: filteredOrders.reduce(
        (sum, order) => sum + order.finalAmount,
        0,
      ),
      preparationSummary: Object.values(preparationSummary).sort((a, b) =>
        a.skuName.localeCompare(b.skuName),
      ),
    };
  };

  const salesData = calculateSalesData();
  const productData = calculateProductPerformance();
  const employeeData = calculateEmployeeSales();
  const dailyOrderSummary = calculateDailyOrderSummary();

  // Calculate growth percentage (mock)
  const salesGrowth = 12.5;
  const ordersGrowth = 8.3;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "white",
          color: "text.primary",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            fontWeight="bold"
            sx={{ flexGrow: 1 }}
          >
            Analytics & Reports
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2">
              {user?.firstName || user?.username || "Admin"}
            </Typography>
            {currentUser && (
              <Chip
                label={currentUser.role.toUpperCase()}
                color={isAdmin() ? "error" : "primary"}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItemOption onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                Logout
              </MenuItemOption>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Business Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track performance, analyze trends, and make data-driven decisions
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Sales Performance" icon={<AttachMoneyIcon />} />
            <Tab label="Product Performance" icon={<InventoryIcon />} />
            <Tab label="Employee Sales" icon={<PeopleIcon />} />
            <Tab label="Daily Order Summary" icon={<ShoppingCartIcon />} />
          </Tabs>
        </Paper>

        {/* Tab 1: Sales Performance */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Period Selector */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Time Period</InputLabel>
                  <Select
                    value={salesPeriod}
                    label="Time Period"
                    onChange={(e) => setSalesPeriod(e.target.value)}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="annually">Annually</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Grid>

            {/* Summary Cards */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <AttachMoneyIcon
                      sx={{ fontSize: 40, color: "success.main", mr: 2 }}
                    />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Sales
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        ₹{salesData.totalSales.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {salesGrowth > 0 ? (
                      <TrendingUpIcon sx={{ color: "success.main", mr: 1 }} />
                    ) : (
                      <TrendingDownIcon sx={{ color: "error.main", mr: 1 }} />
                    )}
                    <Typography
                      variant="body2"
                      color={salesGrowth > 0 ? "success.main" : "error.main"}
                    >
                      {salesGrowth > 0 ? "+" : ""}
                      {salesGrowth}% from last period
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <ShoppingCartIcon
                      sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
                    />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Orders
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {salesData.totalOrders}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {ordersGrowth > 0 ? (
                      <TrendingUpIcon sx={{ color: "success.main", mr: 1 }} />
                    ) : (
                      <TrendingDownIcon sx={{ color: "error.main", mr: 1 }} />
                    )}
                    <Typography
                      variant="body2"
                      color={ordersGrowth > 0 ? "success.main" : "error.main"}
                    >
                      {ordersGrowth > 0 ? "+" : ""}
                      {ordersGrowth}% from last period
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <TrendingUpIcon
                      sx={{ fontSize: 40, color: "info.main", mr: 2 }}
                    />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Average Order Value
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        ₹{salesData.averageOrderValue.toFixed(0)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Per order average
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Sales Breakdown */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Sales Breakdown -{" "}
                  {salesPeriod.charAt(0).toUpperCase() + salesPeriod.slice(1)}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Revenue
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        ₹{salesData.totalSales.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Number of Transactions
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {salesData.totalOrders}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Product Performance */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Period Selector */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Time Period</InputLabel>
                  <Select
                    value={productPeriod}
                    label="Time Period"
                    onChange={(e) => setProductPeriod(e.target.value)}
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="annually">Annually</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Grid>

            {/* Product Performance Table */}
            <Grid item xs={12}>
              <Paper>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Product Performance Report -{" "}
                    {productPeriod.charAt(0).toUpperCase() +
                      productPeriod.slice(1)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Individual product sales and revenue breakdown
                  </Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: "grey.100" }}>
                      <TableRow>
                        <TableCell>
                          <strong>Rank</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Product Name</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Units Sold</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Total Revenue</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Orders</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Avg per Order</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productData.length > 0 ? (
                        productData.map((product, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Chip
                                label={`#${index + 1}`}
                                size="small"
                                color={index === 0 ? "success" : "default"}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="500">
                                {product.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {product.quantity}
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                fontWeight="bold"
                                color="success.main"
                              >
                                ₹{product.revenue.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {product.orders}
                            </TableCell>
                            <TableCell align="right">
                              ₹{(product.revenue / product.orders).toFixed(0)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography color="text.secondary">
                              No product data available for this period
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Employee Sales */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Period Selector */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Time Period</InputLabel>
                  <Select
                    value={employeePeriod}
                    label="Time Period"
                    onChange={(e) => setEmployeePeriod(e.target.value)}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="annually">Annually</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Grid>

            {/* Employee Performance Table */}
            <Grid item xs={12}>
              <Paper>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Employee Sales Report -{" "}
                    {employeePeriod.charAt(0).toUpperCase() +
                      employeePeriod.slice(1)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Individual employee performance with minimum thresholds
                  </Typography>
                </Box>
                <Divider />
                {employeeData.length > 0 ? (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: "grey.100" }}>
                          <TableRow>
                            <TableCell>
                              <strong>Rank</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Employee</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Total Orders</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Total Revenue</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Total Units</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Run rate per unit</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Avg Order Value</strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>Status</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {employeeData.map((employee, index) => {
                            const minOrders = 30;
                            const meetsMinimum = employee.orders >= minOrders;

                            return (
                              <TableRow key={index} hover>
                                <TableCell>
                                  <Chip
                                    label={`#${index + 1}`}
                                    size="small"
                                    color={index === 0 ? "success" : "default"}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography fontWeight="500">
                                      {employee.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {employee.email}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  {employee.orders}
                                </TableCell>
                                <TableCell align="right">
                                  <Typography
                                    fontWeight="bold"
                                    color="success.main"
                                  >
                                    ₹{employee.revenue.toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography fontWeight="500">
                                    {employee.totalUnits}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography fontWeight="500" color="primary.main">
                                    ₹{employee.runRatePerUnit.toFixed(2)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  ₹{employee.avgOrderValue.toLocaleString()}
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={
                                      meetsMinimum ? "On Target" : "Below Min"
                                    }
                                    color={meetsMinimum ? "success" : "warning"}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                      <Typography variant="caption" color="text.secondary">
                        * Minimum threshold: 30 orders per month
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ p: 6, textAlign: "center" }}>
                    <PeopleIcon
                      sx={{ fontSize: 60, color: "grey.400", mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No Employee Data Available
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Employee performance data will appear here once orders are
                      created with employee tracking.
                    </Typography>
                    <Box
                      sx={{
                        bgcolor: "info.light",
                        p: 2,
                        borderRadius: 1,
                        mt: 3,
                      }}
                    >
                      <Typography variant="body2" fontWeight="500" gutterBottom>
                        📝 To start tracking employee performance:
                      </Typography>
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{ textAlign: "left", mt: 1 }}
                      >
                        <strong>1. Run the database migration</strong> (if not
                        done yet):
                        <br />
                        &nbsp;&nbsp;&nbsp;• Go to Supabase Dashboard → SQL
                        Editor
                        <br />
                        &nbsp;&nbsp;&nbsp;• Run the file:{" "}
                        <code>
                          supabase/migration_add_employee_to_orders.sql
                        </code>
                        <br />
                        <br />
                        <strong>2. Create new orders</strong>:
                        <br />
                        &nbsp;&nbsp;&nbsp;• Log in as an employee
                        <br />
                        &nbsp;&nbsp;&nbsp;• Create orders normally
                        <br />
                        &nbsp;&nbsp;&nbsp;• Employee ID will be tracked
                        automatically
                        <br />
                        <br />
                        <strong>3. View performance</strong>:
                        <br />
                        &nbsp;&nbsp;&nbsp;• Return to this page to see employee
                        sales data
                        <br />
                        &nbsp;&nbsp;&nbsp;• Filter by time period to analyze
                        performance
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4: Daily Order Summary */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* Date Selector and Summary Cards */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Daily Order Summary
                  </Typography>
                  <TextField
                    type="date"
                    label="Select Date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{ minWidth: 200 }}
                  />
                </Box>
                <Divider sx={{ mb: 3 }} />

                {/* Summary Cards */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ bgcolor: "primary.main", color: "white" }}>
                      <CardContent>
                        <Typography variant="body2" gutterBottom>
                          Total Orders
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {dailyOrderSummary.totalOrders}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ bgcolor: "success.main", color: "white" }}>
                      <CardContent>
                        <Typography variant="body2" gutterBottom>
                          Total Revenue
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          ₹{dailyOrderSummary.totalRevenue.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ bgcolor: "info.main", color: "white" }}>
                      <CardContent>
                        <Typography variant="body2" gutterBottom>
                          Avg Order Value
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          ₹
                          {dailyOrderSummary.totalOrders > 0
                            ? Math.round(
                                dailyOrderSummary.totalRevenue /
                                  dailyOrderSummary.totalOrders,
                              ).toLocaleString()
                            : 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Orders Details Table */}
            <Grid item xs={12}>
              <Paper>
                <Box
                  sx={{
                    p: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Orders for{" "}
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Complete order details including shop information,
                      products ordered, and amounts
                    </Typography>
                  </Box>
                  <IconButton
                    color="primary"
                    onClick={downloadDailyOrderSummary}
                    sx={{
                      bgcolor: "primary.light",
                      "&:hover": { bgcolor: "primary.main", color: "white" },
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Box>
                <Divider />
                {dailyOrderSummary.orders.length > 0 ? (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "grey.100" }}>
                            <TableCell>
                              <Typography fontWeight="bold">
                                Order Date
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="bold">Timing</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="bold">
                                Marketing Personnel
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="bold">
                                Shop Name
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="bold">Address</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="bold">
                                Phone Number
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="bold">
                                Products Ordered
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="bold">
                                Total Amount
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dailyOrderSummary.orders.map((order, index) => {
                            const orderDate = new Date(order.orderDate);
                            const timeString = orderDate.toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              },
                            );
                            const dateString = orderDate.toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            );

                            // Create Google Maps link
                            const mapsLink =
                              order.latitude && order.longitude
                                ? `https://maps.google.com/?q=${order.latitude},${order.longitude}`
                                : order.shopLocation;

                            return (
                              <TableRow
                                key={order.orderId}
                                sx={{
                                  "&:hover": { bgcolor: "grey.50" },
                                  bgcolor:
                                    index % 2 === 0 ? "white" : "grey.50",
                                }}
                              >
                                <TableCell>
                                  <Typography variant="body2">
                                    {dateString}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {timeString}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography fontWeight="500">
                                      {order.employeeName}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {order.employeeEmail}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography fontWeight="500">
                                    {order.shopName}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <a
                                    href={mapsLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "#1976d2",
                                      textDecoration: "none",
                                    }}
                                  >
                                    <Typography variant="body2">
                                      📍 View on Map
                                    </Typography>
                                  </a>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: "block", mt: 0.5 }}
                                  >
                                    {order.shopLocation}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {order.shopPhone}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    {order.orderItems.map((item, idx) => (
                                      <Box
                                        key={idx}
                                        sx={{
                                          mb: 0.5,
                                          pb: 0.5,
                                          borderBottom:
                                            idx < order.orderItems.length - 1
                                              ? "1px dashed #e0e0e0"
                                              : "none",
                                        }}
                                      >
                                        <Typography variant="body2">
                                          <strong>{item.sku.name}</strong>
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {item.quantity} {item.unitType}
                                          {item.quantity > 1 ? "s" : ""} × ₹
                                          {item.unitType === "box"
                                            ? item.sku.boxPrice
                                            : item.sku.price}{" "}
                                          = ₹
                                          {(
                                            item.quantity *
                                            (item.unitType === "box"
                                              ? item.sku.boxPrice
                                              : item.sku.price)
                                          ).toLocaleString()}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Subtotal: ₹
                                      {order.totalAmount.toLocaleString()}
                                    </Typography>
                                    {order.discountAmount > 0 && (
                                      <Typography
                                        variant="caption"
                                        color="error"
                                      >
                                        Discount: -₹
                                        {order.discountAmount.toLocaleString()}
                                      </Typography>
                                    )}
                                    <Typography
                                      fontWeight="bold"
                                      color="success.main"
                                      sx={{ mt: 0.5 }}
                                    >
                                      ₹{order.finalAmount.toLocaleString()}
                                    </Typography>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {/* Totals Row */}
                          <TableRow sx={{ bgcolor: "primary.main" }}>
                            <TableCell colSpan={7}>
                              <Typography fontWeight="bold" color="white">
                                GRAND TOTAL ({dailyOrderSummary.totalOrders}{" "}
                                orders)
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                fontWeight="bold"
                                color="white"
                                variant="h6"
                              >
                                ₹
                                {dailyOrderSummary.totalRevenue.toLocaleString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                      <Typography variant="caption" color="text.secondary">
                        <strong>Note:</strong> This summary shows all orders
                        placed on the selected date. The "Products Ordered"
                        column lists each product with its quantity, unit type
                        (packet/box), unit price, and line total. The "Total
                        Amount" column shows the subtotal before discount, any
                        discount applied, and the final amount paid.
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ p: 6, textAlign: "center" }}>
                    <ShoppingCartIcon
                      sx={{ fontSize: 60, color: "grey.400", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      No Orders Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      There are no orders for the selected date. Try selecting a
                      different date.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Preparation Summary */}
            {dailyOrderSummary.preparationSummary.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ bgcolor: "warning.light" }}>
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: "warning.main",
                      color: "white",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        📦 Preparation Summary
                      </Typography>
                      <Typography variant="body2">
                        Total quantities to prepare for all orders on{" "}
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={downloadPreparationSummary}
                      sx={{
                        color: "white",
                        bgcolor: "rgba(255,255,255,0.2)",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.3)",
                        },
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "grey.100" }}>
                          <TableCell>
                            <Typography fontWeight="bold">
                              Product Name
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight="bold">
                              Packets to Prepare
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight="bold">
                              Boxes to Prepare
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight="bold">
                              Total Units
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dailyOrderSummary.preparationSummary.map(
                          (item, index) => (
                            <TableRow
                              key={item.skuId}
                              sx={{
                                "&:hover": { bgcolor: "warning.50" },
                                bgcolor: index % 2 === 0 ? "white" : "grey.50",
                              }}
                            >
                              <TableCell>
                                <Box>
                                  <Typography
                                    fontWeight="600"
                                    color="primary.main"
                                  >
                                    {item.skuName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    SKU: {item.skuId}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                {item.packetQty > 0 ? (
                                  <Chip
                                    label={`${item.packetQty} packets`}
                                    color="primary"
                                    size="medium"
                                    sx={{ fontWeight: "bold", minWidth: 100 }}
                                  />
                                ) : (
                                  <Typography color="text.secondary">
                                    -
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {item.boxQty > 0 ? (
                                  <Chip
                                    label={`${item.boxQty} boxes`}
                                    color="secondary"
                                    size="medium"
                                    sx={{ fontWeight: "bold", minWidth: 100 }}
                                  />
                                ) : (
                                  <Typography color="text.secondary">
                                    -
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <Typography fontWeight="bold" fontSize="1.1rem">
                                  {item.packetQty + item.boxQty}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                        {/* Totals Row */}
                        <TableRow sx={{ bgcolor: "warning.main" }}>
                          <TableCell>
                            <Typography fontWeight="bold" color="white">
                              TOTAL TO PREPARE
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight="bold" color="white">
                              {dailyOrderSummary.preparationSummary.reduce(
                                (sum, item) => sum + item.packetQty,
                                0,
                              )}{" "}
                              packets
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight="bold" color="white">
                              {dailyOrderSummary.preparationSummary.reduce(
                                (sum, item) => sum + item.boxQty,
                                0,
                              )}{" "}
                              boxes
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight="bold" color="white">
                              {dailyOrderSummary.preparationSummary.reduce(
                                (sum, item) =>
                                  sum + item.packetQty + item.boxQty,
                                0,
                              )}{" "}
                              units
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ p: 2, bgcolor: "warning.50" }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight="500"
                    >
                      💡 <strong>Tip:</strong> Use this summary to plan your
                      production and packaging for the day. Prepare these
                      quantities before starting deliveries.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default AnalyticsPage;
