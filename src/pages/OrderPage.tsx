import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material";
import OrderForm from "../components/OrderForm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import PersonIcon from "@mui/icons-material/Person";
import { useOrderStore } from "../services/orderStore";
import { Order } from "../models/Order";

const OrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById, fetchOrders } = useOrderStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!orderId;

  useEffect(() => {
    const loadData = async () => {
      if (isEdit) {
        setLoading(true);
        await fetchOrders();
        setLoading(false);
      }
    };

    loadData();
  }, [isEdit, fetchOrders]);

  useEffect(() => {
    if (isEdit && orderId) {
      const foundOrder = getOrderById(orderId);
      setOrder(foundOrder || null);
    }
  }, [isEdit, orderId, getOrderById]);

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
            onClick={() => navigate(isEdit && orderId ? `/order-detail/${orderId}` : "/dashboard")}
            sx={{ mr: 2 }}
            aria-label={isEdit ? "back to order details" : "back to dashboard"}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {isEdit ? "Edit Order" : "Create New Order"}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {isEdit
                ? "Update the order details"
                : "Add a new order with SKUs and quantities"}
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : isEdit && !order ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Order not found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              The order you're trying to edit doesn't exist.
            </Typography>
          </Box>
        ) : (
          <OrderForm order={order || undefined} isEdit={isEdit} />
        )}
      </Container>
    </Box>
  );
};

export default OrderPage;
