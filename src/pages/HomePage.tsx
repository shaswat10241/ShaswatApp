import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import UndoIcon from "@mui/icons-material/Undo";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalculateIcon from "@mui/icons-material/Calculate";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ListAltIcon from "@mui/icons-material/ListAlt";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { useUser, useClerk } from "@clerk/clerk-react";
import { useUserStore } from "../services/userStore";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { currentUser, isAdmin, syncUserFromClerk } =
    useUserStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [directLoginUser, setDirectLoginUser] = useState<string | null>(null);
  const [isDirectLogin, setIsDirectLogin] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in directly (without Clerk)
    const directLogin = localStorage.getItem("directLogin") === "true";
    if (directLogin) {
      setIsDirectLogin(true);
      setDirectLoginUser(localStorage.getItem("userEmail"));
    }
  }, []);

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

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    if (isDirectLogin) {
      // Handle direct login logout
      localStorage.removeItem("directLogin");
      localStorage.removeItem("userEmail");
      navigate("/");
    } else {
      // Handle Clerk logout
      signOut();
      navigate("/");
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
          <Typography
            variant="h6"
            component="div"
            fontWeight="bold"
            sx={{ flexGrow: 1 }}
          >
            Snack Basket Order Management
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ mr: 2 }}>
              <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
                {isDirectLogin
                  ? directLoginUser?.charAt(0)?.toUpperCase() || <PersonIcon />
                  : user?.firstName?.charAt(0) || <PersonIcon />}
              </Avatar>
            </Box>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 4 }} className="page-header">
          <Typography variant="h4" component="h1" gutterBottom>
            Snack Basket Order Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your shops and orders efficiently
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Welcome Message */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: "white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography variant="h5" gutterBottom fontWeight="600">
                    Welcome,{" "}
                    {isDirectLogin
                      ? directLoginUser?.split("@")[0] || "User"
                      : user?.firstName || user?.username || "User"}
                  </Typography>
                  <Typography color="text.secondary">
                    What would you like to do today? Choose from the options
                    below.
                  </Typography>
                </Box>
                {currentUser && (
                  <Chip
                    label={currentUser.role.toUpperCase()}
                    color={isAdmin() ? "error" : "primary"}
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>

          {/* New Shop Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 2,
                bgcolor: "white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                },
              }}
              onClick={() => navigate("/new-shop")}
            >
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <AddIcon sx={{ fontSize: 40, color: "white" }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  New Shop
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Add a new shop to your network
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<StoreIcon />}
                  sx={{
                    px: 4,
                    py: 1.25,
                    borderRadius: 8,
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  CREATE SHOP
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Existing Shop Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 2,
                bgcolor: "white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                },
              }}
              onClick={() => navigate("/order")}
            >
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "secondary.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 40, color: "white" }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Existing Shop
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Create orders for existing shops
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<ReceiptIcon />}
                  sx={{
                    px: 4,
                    py: 1.25,
                    borderRadius: 8,
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  CREATE ORDER
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Return Order Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 2,
                bgcolor: "white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                },
              }}
              onClick={() => navigate("/return-order")}
            >
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "#ff9800",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <UndoIcon sx={{ fontSize: 40, color: "white" }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Return Order
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Process product returns and exchanges
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<UndoIcon />}
                  sx={{
                    px: 4,
                    py: 1.25,
                    borderRadius: 8,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    bgcolor: "#ff9800",
                    "&:hover": { bgcolor: "#f57c00" },
                  }}
                >
                  RETURN ITEMS
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Delivery Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 2,
                bgcolor: "white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                },
              }}
              onClick={() => navigate("/delivery")}
            >
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "#2196f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <LocalShippingIcon sx={{ fontSize: 40, color: "white" }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Delivery
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Manage deliveries and track shipments
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LocalShippingIcon />}
                  sx={{
                    px: 4,
                    py: 1.25,
                    borderRadius: 8,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    bgcolor: "#2196f3",
                    "&:hover": { bgcolor: "#1976d2" },
                  }}
                >
                  MANAGE DELIVERY
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Shop Details Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 2,
                bgcolor: "white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                },
              }}
              onClick={() => navigate("/shops")}
            >
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "#673ab7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <StorefrontIcon sx={{ fontSize: 40, color: "white" }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Shop Details
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  View and manage all shops
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<StorefrontIcon />}
                  sx={{
                    px: 4,
                    py: 1.25,
                    borderRadius: 8,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    bgcolor: "#673ab7",
                    "&:hover": { bgcolor: "#5e35b1" },
                  }}
                >
                  VIEW SHOPS
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Order Details Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 2,
                bgcolor: "white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                },
              }}
              onClick={() => navigate("/orders")}
            >
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "#009688",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <ListAltIcon sx={{ fontSize: 40, color: "white" }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Order Details
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  View and manage all orders
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ListAltIcon />}
                  sx={{
                    px: 4,
                    py: 1.25,
                    borderRadius: 8,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    bgcolor: "#009688",
                    "&:hover": { bgcolor: "#00796b" },
                  }}
                >
                  VIEW ORDERS
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Survey Card */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                bgcolor: "#f3f4f6",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                },
                mt: 2,
              }}
              onClick={() => navigate("/survey")}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "center",
                  p: 4,
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    bgcolor: "#4caf50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: { xs: 0, md: 3 },
                    mb: { xs: 2, md: 0 },
                  }}
                >
                  <AssignmentTurnedInIcon
                    sx={{ fontSize: 30, color: "white" }}
                  />
                </Box>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: { xs: "center", md: "flex-start" },
                    justifyContent: "space-between",
                    textAlign: { xs: "center", md: "left" },
                  }}
                >
                  <Box>
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                      Customer Survey
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Collect valuable feedback from your customers to improve
                      your services
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AssignmentTurnedInIcon />}
                    sx={{
                      px: 4,
                      py: 1.25,
                      borderRadius: 8,
                      textTransform: "uppercase",
                      fontWeight: 600,
                      bgcolor: "#4caf50",
                      "&:hover": { bgcolor: "#388e3c" },
                      mt: { xs: 2, md: 0 },
                    }}
                  >
                    TAKE SURVEY
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Timesheet Card - Available to all employees */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                bgcolor: "#e3f2fd",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                },
                mt: 2,
              }}
              onClick={() => navigate("/timesheet")}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "center",
                  p: 4,
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    bgcolor: "#1976d2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: { xs: 0, md: 3 },
                    mb: { xs: 2, md: 0 },
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 30, color: "white" }} />
                </Box>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: { xs: "center", md: "flex-start" },
                    justifyContent: "space-between",
                    textAlign: { xs: "center", md: "left" },
                  }}
                >
                  <Box>
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                      My Timesheet
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Log your daily work hours and track your time
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AccessTimeIcon />}
                    sx={{
                      px: 4,
                      py: 1.25,
                      borderRadius: 8,
                      textTransform: "uppercase",
                      fontWeight: 600,
                      bgcolor: "#1976d2",
                      "&:hover": { bgcolor: "#1565c0" },
                      mt: { xs: 2, md: 0 },
                    }}
                  >
                    LOG TIME
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Admin Only Section */}
          {isAdmin() && (
            <>
              {/* Admin Section Header */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 4,
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "error.light",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <SettingsIcon sx={{ mr: 1, color: "white" }} />
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    sx={{ color: "white" }}
                  >
                    Admin Panel
                  </Typography>
                </Box>
              </Grid>

              {/* User Management Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    bgcolor: "white",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    },
                  }}
                  onClick={() => navigate("/admin/users")}
                >
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 4,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: "error.light",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 40, color: "white" }} />
                    </Box>
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                      User Management
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Manage users and assign roles
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      size="large"
                      startIcon={<PeopleIcon />}
                      sx={{
                        px: 4,
                        py: 1.25,
                        borderRadius: 8,
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      MANAGE USERS
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Analytics Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    bgcolor: "white",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    },
                  }}
                  onClick={() => navigate("/admin/analytics")}
                >
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 4,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: "info.light",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      <BarChartIcon sx={{ fontSize: 40, color: "white" }} />
                    </Box>
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                      Analytics
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      View reports and business insights
                    </Typography>
                    <Button
                      variant="contained"
                      color="info"
                      size="large"
                      startIcon={<BarChartIcon />}
                      sx={{
                        px: 4,
                        py: 1.25,
                        borderRadius: 8,
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      VIEW REPORTS
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Admin Timesheets Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    bgcolor: "white",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    },
                  }}
                  onClick={() => navigate("/admin/timesheets")}
                >
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 4,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: "#9c27b0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 40, color: "white" }} />
                    </Box>
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                      Employee Timesheets
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      View all employee time logs
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AccessTimeIcon />}
                      sx={{
                        px: 4,
                        py: 1.25,
                        borderRadius: 8,
                        textTransform: "uppercase",
                        fontWeight: 600,
                        bgcolor: "#9c27b0",
                        "&:hover": { bgcolor: "#7b1fa2" },
                      }}
                    >
                      VIEW TIMESHEETS
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Batch Cost Calculator Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    bgcolor: "white",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    },
                  }}
                  onClick={() => navigate("/admin/batch-cost-calculator")}
                >
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 4,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: "#ff9800",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      <CalculateIcon sx={{ fontSize: 40, color: "white" }} />
                    </Box>
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                      Batch Cost Calculator
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Calculate product unit costs
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CalculateIcon />}
                      sx={{
                        px: 4,
                        py: 1.25,
                        borderRadius: 8,
                        textTransform: "uppercase",
                        fontWeight: 600,
                        bgcolor: "#ff9800",
                        "&:hover": { bgcolor: "#f57c00" },
                      }}
                    >
                      CALCULATE COSTS
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Cost Manager Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    bgcolor: "white",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    },
                  }}
                  onClick={() => navigate("/admin/cost-manager")}
                >
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 4,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: "#00bcd4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      <AssessmentIcon sx={{ fontSize: 40, color: "white" }} />
                    </Box>
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                      Cost Manager
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      View all cost calculations
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AssessmentIcon />}
                      sx={{
                        px: 4,
                        py: 1.25,
                        borderRadius: 8,
                        textTransform: "uppercase",
                        fontWeight: 600,
                        bgcolor: "#00bcd4",
                        "&:hover": { bgcolor: "#0097a7" },
                      }}
                    >
                      VIEW COSTS
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Settings Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    bgcolor: "white",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    },
                  }}
                  onClick={() => navigate("/admin/settings")}
                >
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 4,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: "warning.light",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      <SettingsIcon sx={{ fontSize: 40, color: "white" }} />
                    </Box>
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                      System Settings
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Configure system preferences
                    </Typography>
                    <Button
                      variant="contained"
                      color="warning"
                      size="large"
                      startIcon={<SettingsIcon />}
                      sx={{
                        px: 4,
                        py: 1.25,
                        borderRadius: 8,
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      SETTINGS
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
