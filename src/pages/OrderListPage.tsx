import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
  Storefront as StorefrontIcon,
} from "@mui/icons-material";
import { useOrderStore } from "../services/orderStore";
import { useShopStore } from "../services/shopStore";
import { useUserStore } from "../services/userStore";
import { Order } from "../models/Order";

const OrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, fetchOrders, deleteOrder, loading } = useOrderStore();
  const { shops, fetchShops } = useShopStore();
  const { users, fetchAllUsers } = useUserStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [discountFilter, setDiscountFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchOrders();
        await fetchShops();
        await fetchAllUsers();
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to load orders",
          severity: "error",
        });
      }
    };
    loadData();
  }, [fetchOrders, fetchShops, fetchAllUsers]);

  // Helper function to get shop name by ID
  const getShopName = (shopId: string) => {
    const shop = shops.find((s) => s.id === shopId);
    return shop ? shop.name : "Unknown Shop";
  };

  // Helper function to get employee name by ID
  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return "N/A";
    const employee = users.find((u) => u.id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };

  // Filter orders based on search and filters
  const filteredOrders = orders
    .filter((order) => {
      const shopName = getShopName(order.shopId);
      const employeeName = getEmployeeName(order.employeeId);
      const matchesSearch =
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.finalAmount.toString().includes(searchTerm);

      const matchesDiscount =
        discountFilter === "all" ||
        (discountFilter === "with" && order.discountCode) ||
        (discountFilter === "without" && !order.discountCode);

      const matchesEmployee =
        employeeFilter === "all" ||
        order.employeeId === employeeFilter;

      return matchesSearch && matchesDiscount && matchesEmployee;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "amount":
          return b.finalAmount - a.finalAmount;
        case "shop":
          return getShopName(a.shopId).localeCompare(getShopName(b.shopId));
        default:
          return 0;
      }
    });

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete?.id) return;

    try {
      await deleteOrder(orderToDelete.id);
      setSnackbar({
        open: true,
        message: `Order #${orderToDelete.id} deleted successfully`,
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete order",
        severity: "error",
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewDetails = (orderId: string) => {
    navigate(`/order-detail/${orderId}`);
  };

  // Calculate statistics
  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + order.finalAmount,
    0
  );
  const ordersWithDiscount = filteredOrders.filter((o) => o.discountCode).length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/dashboard")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <ShoppingCartIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Order Details
          </Typography>
          <Button color="inherit" onClick={() => navigate("/order")}>
            Create New Order
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {/* Search and Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search by order ID, shop, employee, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Employee</InputLabel>
            <Select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              label="Employee"
            >
              <MenuItem value="all">All Employees</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Discount</InputLabel>
            <Select
              value={discountFilter}
              onChange={(e) => setDiscountFilter(e.target.value)}
              label="Discount"
            >
              <MenuItem value="all">All Orders</MenuItem>
              <MenuItem value="with">With Discount</MenuItem>
              <MenuItem value="without">Without Discount</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="date">Date (Newest)</MenuItem>
              <MenuItem value="amount">Amount (Highest)</MenuItem>
              <MenuItem value="shop">Shop Name</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Statistics */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Paper sx={{ p: 2, flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total Orders
            </Typography>
            <Typography variant="h4">{filteredOrders.length}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total Revenue
            </Typography>
            <Typography variant="h4">₹{totalRevenue.toFixed(2)}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              With Discount
            </Typography>
            <Typography variant="h4">{ordersWithDiscount}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Avg Order Value
            </Typography>
            <Typography variant="h4">
              ₹
              {filteredOrders.length > 0
                ? (totalRevenue / filteredOrders.length).toFixed(2)
                : "0.00"}
            </Typography>
          </Paper>
        </Box>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <ShoppingCartIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchTerm || discountFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first order"}
            </Typography>
            {!searchTerm && discountFilter === "all" && (
              <Button
                variant="contained"
                onClick={() => navigate("/order")}
                sx={{ mt: 2 }}
              >
                Create New Order
              </Button>
            )}
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Shop Name</TableCell>
                  <TableCell>Order Taken By</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Final Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        #{order.id?.substring(0, 8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <StorefrontIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {getShopName(order.shopId)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getEmployeeName(order.employeeId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${order.orderItems.length} item${
                          order.orderItems.length !== 1 ? "s" : ""
                        }`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {order.discountCode ? (
                        <Box>
                          <Chip
                            label={order.discountCode}
                            color="success"
                            size="small"
                          />
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            -₹{order.discountAmount?.toFixed(2) || 0}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        ₹{order.finalAmount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDetails(order.id!)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(order)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete order #
            {orderToDelete?.id?.substring(0, 8)}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderListPage;
