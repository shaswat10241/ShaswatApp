import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StoreIcon from "@mui/icons-material/Store";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useShopStore } from "../services/shopStore";
import { Shop } from "../models/Shop";

const ShopDetailPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { getShopById, shops, fetchShops, deleteShop } = useShopStore();

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
      setLoading(true);
      await fetchShops();
      setLoading(false);
    };

    loadData();
  }, [fetchShops]);

  useEffect(() => {
    if (shopId && shops.length > 0) {
      const foundShop = getShopById(shopId);
      setShop(foundShop || null);
    }
  }, [shopId, shops, getShopById]);

  const handleEdit = () => {
    navigate(`/shop/${shopId}/edit`);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!shop?.id) return;

    try {
      await deleteShop(shop.id);
      setSnackbar({
        open: true,
        message: `Shop "${shop.name}" deleted successfully`,
        severity: "success",
      });
      setDeleteDialogOpen(false);
      // Navigate back to shop list after a short delay
      setTimeout(() => {
        navigate("/shops");
      }, 1500);
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
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading shop details...</Typography>
      </Container>
    );
  }

  if (!shop) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box textAlign="center" py={8}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Shop Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The shop you're looking for doesn't exist or has been removed.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/shops")}
          >
            Back to Shops
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/shops")} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Shop Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {shop.name}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            icon={<StoreIcon />}
            label={shop.isNew ? "New Shop" : "Existing Shop"}
            color={shop.isNew ? "success" : "default"}
            variant={shop.isNew ? "filled" : "outlined"}
          />
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            size="small"
          >
            Edit Shop
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
            size="small"
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <StoreIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Basic Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Shop Name
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {shop.name}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Category
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    icon={<CategoryIcon />}
                    label={
                      shop.category === "wholeseller"
                        ? "Wholeseller"
                        : "Retailer"
                    }
                    color={
                      shop.category === "wholeseller" ? "primary" : "secondary"
                    }
                    size="small"
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Created Date
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                  <CalendarTodayIcon fontSize="small" color="action" />
                  <Typography variant="body1">
                    {new Date(shop.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PhoneIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Contact Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Phone Number
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body1" fontWeight="500">
                    {shop.phoneNumber}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Location
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body1">{shop.location}</Typography>
                </Box>
                {shop.latitude && shop.longitude && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 3, display: "block", mt: 0.5 }}>
                    Coordinates: {shop.latitude.toFixed(6)}, {shop.longitude.toFixed(6)}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Map Preview (if coordinates available) */}
        {shop.latitude && shop.longitude && (
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="600">
                    Location Map
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{
                    width: "100%",
                    height: 300,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <iframe
                    title="Shop Location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${shop.longitude - 0.01},${shop.latitude - 0.01},${shop.longitude + 0.01},${shop.latitude + 0.01}&layer=mapnik&marker=${shop.latitude},${shop.longitude}`}
                  />
                </Box>
                <Button
                  sx={{ mt: 2 }}
                  variant="outlined"
                  size="small"
                  href={`https://www.openstreetmap.org/?mlat=${shop.latitude}&mlon=${shop.longitude}#map=15/${shop.latitude}/${shop.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Larger Map
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/shops")}
        >
          Back to Shops
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit Shop Details
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the shop "{shop.name}"? This action
            cannot be undone.
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
    </Container>
  );
};

export default ShopDetailPage;
