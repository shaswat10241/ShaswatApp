import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  CircularProgress,
} from "@mui/material";
import ShopForm from "../components/ShopForm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import PersonIcon from "@mui/icons-material/Person";
import { useShopStore } from "../services/shopStore";
import { Shop } from "../models/Shop";

const ShopFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { shopId } = useParams<{ shopId: string }>();
  const { getShopById, fetchShops } = useShopStore();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!shopId;

  useEffect(() => {
    const loadData = async () => {
      if (isEdit) {
        setLoading(true);
        await fetchShops();
        setLoading(false);
      }
    };

    loadData();
  }, [isEdit, fetchShops]);

  useEffect(() => {
    if (isEdit && shopId) {
      const foundShop = getShopById(shopId);
      setShop(foundShop || null);
    }
  }, [isEdit, shopId, getShopById]);

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
                {user?.firstName?.charAt(0) || <PersonIcon />}
              </Avatar>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton
            onClick={() => navigate(isEdit && shopId ? `/shop-detail/${shopId}` : "/")}
            sx={{ mr: 2 }}
            aria-label={isEdit ? "back to shop details" : "back to dashboard"}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {isEdit ? "Edit Shop" : "Create New Shop"}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : isEdit && !shop ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Shop not found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                The shop you're trying to edit doesn't exist.
              </Typography>
            </Box>
          ) : (
            <ShopForm shop={shop || undefined} isEdit={isEdit} />
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ShopFormPage;
