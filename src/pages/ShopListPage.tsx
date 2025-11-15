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
  ArrowBack as ArrowBackIcon,
  Storefront as StorefrontIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useShopStore } from "../services/shopStore";
import { Shop } from "../models/Shop";

const ShopListPage: React.FC = () => {
  const navigate = useNavigate();
  const { shops, fetchShops, deleteShop, loading } = useShopStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);
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
        await fetchShops();
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to load shops",
          severity: "error",
        });
      }
    };
    loadData();
  }, [fetchShops]);

  // Filter shops based on search and filters
  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.phoneNumber.includes(searchTerm);

    const matchesCategory =
      categoryFilter === "all" || shop.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "new" && shop.isNew) ||
      (statusFilter === "existing" && !shop.isNew);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteClick = (shop: Shop) => {
    setShopToDelete(shop);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!shopToDelete?.id) return;

    try {
      await deleteShop(shopToDelete.id);
      setSnackbar({
        open: true,
        message: `Shop "${shopToDelete.name}" deleted successfully`,
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setShopToDelete(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete shop",
        severity: "error",
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setShopToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
          <StorefrontIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Shop Details
          </Typography>
          <Button color="inherit" onClick={() => navigate("/new-shop")}>
            Add New Shop
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {/* Search and Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search by name, location, or phone..."
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
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="wholeseller">Wholeseller</MenuItem>
              <MenuItem value="retailer">Retailer</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="existing">Existing</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Statistics */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Paper sx={{ p: 2, flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total Shops
            </Typography>
            <Typography variant="h4">{filteredShops.length}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Wholesellers
            </Typography>
            <Typography variant="h4">
              {filteredShops.filter((s) => s.category === "wholeseller").length}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Retailers
            </Typography>
            <Typography variant="h4">
              {filteredShops.filter((s) => s.category === "retailer").length}
            </Typography>
          </Paper>
        </Box>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredShops.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <StorefrontIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No shops found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first shop"}
            </Typography>
            {!searchTerm && categoryFilter === "all" && statusFilter === "all" && (
              <Button
                variant="contained"
                onClick={() => navigate("/new-shop")}
                sx={{ mt: 2 }}
              >
                Add New Shop
              </Button>
            )}
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredShops.map((shop) => (
                  <TableRow key={shop.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <StorefrontIcon color="primary" />
                        <Typography variant="body2" fontWeight={500}>
                          {shop.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        {shop.location}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        {shop.phoneNumber}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={shop.category}
                        color={
                          shop.category === "wholeseller" ? "primary" : "secondary"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={shop.isNew ? "New" : "Existing"}
                        color={shop.isNew ? "success" : "default"}
                        size="small"
                        variant={shop.isNew ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(shop.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/shop-detail/${shop.id}`)}
                        size="small"
                        title="View Details"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(shop)}
                        size="small"
                        title="Delete"
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
            Are you sure you want to delete the shop "{shopToDelete?.name}"?
            This action cannot be undone.
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

export default ShopListPage;
