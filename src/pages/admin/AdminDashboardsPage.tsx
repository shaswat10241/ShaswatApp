import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem as MenuItemOption,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import PeopleIcon from "@mui/icons-material/People";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useOrderStore } from "../../services/orderStore";
import { useShopStore } from "../../services/shopStore";
import { useUserStore } from "../../services/userStore";
import { useDeliveryStore } from "../../services/deliveryStore";
import MonthlyRevenueChart from "../../components/dashboard/MonthlyRevenueChart";
import ChhattisgarhMap from "../../components/dashboard/ChhattisgarhMap";
import EmployeeSalesChart from "../../components/dashboard/EmployeeSalesChart";
import ProductCategoryChart from "../../components/dashboard/ProductCategoryChart";

const AdminDashboardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isAdmin, users, fetchAllUsers, syncUserFromClerk, currentUser } =
    useUserStore();
  const { orders, fetchOrders } = useOrderStore();
  const { shops, fetchShops } = useShopStore();
  const { deliveries, fetchDeliveries } = useDeliveryStore();

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

  // Filter out cancelled orders for accurate metrics
  const activeOrders = orders.filter((order) => {
    const delivery = deliveries.find((d) => d.orderId === order.id);
    return !delivery || delivery.status !== "Cancelled";
  });

  // Calculate key metrics
  const totalRevenue = activeOrders.reduce(
    (sum, order) => sum + order.finalAmount,
    0
  );
  const totalOrders = activeOrders.length;
  const totalShops = shops.length;
  const totalEmployees = users.filter((u) => u.role === "employee").length;

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
            Admin Dashboards
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
            Business Intelligence Dashboards
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive insights into sales, market penetration, employee
            performance, and customer segments
          </Typography>
        </Box>

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <TrendingUpIcon sx={{ color: "success.main", mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  ₹{totalRevenue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <ShoppingCartIcon sx={{ color: "primary.main", mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {totalOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <StoreIcon sx={{ color: "info.main", mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Total Shops
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {totalShops}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <PeopleIcon sx={{ color: "warning.main", mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Active Employees
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {totalEmployees}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        {/* Dashboard Sections */}
        <Grid container spacing={4}>
          {/* 1. Monthly Sales Performance */}
          <Grid item xs={12}>
            <MonthlyRevenueChart orders={activeOrders} chartType="bar" />
          </Grid>

          {/* 2. Chhattisgarh Map */}
          <Grid item xs={12}>
            <ChhattisgarhMap shops={shops} />
          </Grid>

          {/* 3. Employee Sales Visualization */}
          <Grid item xs={12}>
            <EmployeeSalesChart
              orders={activeOrders}
              shops={shops}
              employees={users}
            />
          </Grid>

          {/* 4. Product Category Comparison */}
          <Grid item xs={12}>
            <ProductCategoryChart orders={activeOrders} shops={shops} />
          </Grid>
        </Grid>

        {/* Footer Note */}
        <Box sx={{ mt: 6, p: 3, bgcolor: "info.light", borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="500" gutterBottom>
            Dashboard Information
          </Typography>
          <Typography variant="caption" color="text.secondary">
            All data shown is in real-time and excludes cancelled orders. The
            dashboards automatically update when new orders are created or when
            shop information is modified. For district-based analysis, ensure
            that shop records include district information. To add district data
            to existing shops, run the migration file:{" "}
            <code>supabase/migration_add_district_to_shops.sql</code>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminDashboardsPage;
