import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import StoreIcon from "@mui/icons-material/Store";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import { useOrderStore } from "../services/orderStore";
import { useShopStore } from "../services/shopStore";
import { useDeliveryStore } from "../services/deliveryStore";
import { useUserStore, User } from "../services/userStore";
import { Order } from "../models/Order";
import { Shop } from "../models/Shop";
import { Delivery } from "../models/Delivery";

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById, orders, fetchOrders } = useOrderStore();
  const { shops, fetchShops } = useShopStore();
  const { getDeliveryByOrderId, deliveries, fetchDeliveries } =
    useDeliveryStore();
  const { users, fetchAllUsers } = useUserStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchOrders();
      await fetchShops();
      await fetchDeliveries();
      await fetchAllUsers();
      setLoading(false);
    };

    loadData();
  }, [fetchOrders, fetchShops, fetchDeliveries, fetchAllUsers]);

  useEffect(() => {
    if (orderId && orders.length > 0) {
      const foundOrder = getOrderById(orderId);
      setOrder(foundOrder);

      if (foundOrder) {
        const foundShop = shops.find((s) => s.id === foundOrder.shopId);
        setShop(foundShop || null);

        const foundDelivery = getDeliveryByOrderId(orderId);
        setDelivery(foundDelivery);

        if (foundOrder.employeeId) {
          const foundEmployee = users.find((u) => u.id === foundOrder.employeeId);
          setEmployee(foundEmployee || null);
        }
      }
    }
  }, [orderId, orders, shops, deliveries, users, getOrderById, getDeliveryByOrderId]);

  const handleDownloadInvoice = () => {
    if (!order || !shop) return;

    // Create invoice content
    let invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - Order #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .header h1 { color: #1976d2; margin: 0; }
          .info-section { margin-bottom: 30px; }
          .info-section h3 { color: #333; border-bottom: 2px solid #1976d2; padding-bottom: 5px; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .totals { margin-top: 30px; }
          .totals-row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 16px; }
          .final-total { font-size: 20px; font-weight: bold; color: #1976d2; border-top: 2px solid #1976d2; padding-top: 10px; }
          .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p>Order #${order.id}</p>
          <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <div class="info-section">
          <h3>Shop Information</h3>
          <div class="info-row"><span><strong>Name:</strong></span><span>${shop.name}</span></div>
          <div class="info-row"><span><strong>Location:</strong></span><span>${shop.location}</span></div>
          <div class="info-row"><span><strong>Phone:</strong></span><span>${shop.phoneNumber}</span></div>
          <div class="info-row"><span><strong>Category:</strong></span><span>${shop.category}</span></div>
        </div>

        ${
          employee
            ? `
        <div class="info-section">
          <h3>Order Taken By</h3>
          <div class="info-row"><span><strong>Name:</strong></span><span>${employee.name}</span></div>
          <div class="info-row"><span><strong>Email:</strong></span><span>${employee.email}</span></div>
          <div class="info-row"><span><strong>Role:</strong></span><span>${employee.role}</span></div>
        </div>
        `
            : ""
        }

        ${
          delivery
            ? `
        <div class="info-section">
          <h3>Delivery Information</h3>
          <div class="info-row"><span><strong>Tracking Number:</strong></span><span>${delivery.trackingNumber || "N/A"}</span></div>
          <div class="info-row"><span><strong>Status:</strong></span><span>${delivery.status}</span></div>
          <div class="info-row"><span><strong>Current Location:</strong></span><span>${delivery.currentLocation || "N/A"}</span></div>
          <div class="info-row"><span><strong>${delivery.actualDeliveryDate ? "Delivered On:" : "Estimated Delivery:"}</strong></span><span>${delivery.actualDeliveryDate ? new Date(delivery.actualDeliveryDate).toLocaleDateString() : delivery.estimatedDeliveryDate ? new Date(delivery.estimatedDeliveryDate).toLocaleDateString() : "N/A"}</span></div>
        </div>
        `
            : ""
        }

        <div class="info-section">
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit Type</th>
                <th>Quantity</th>
                <th>Price per Unit</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems
                .map((item) => {
                  const pricePerUnit =
                    item.unitType === "box"
                      ? item.sku.boxPrice
                      : item.sku.price;
                  const itemTotal = pricePerUnit * item.quantity;
                  return `
                  <tr>
                    <td>${item.sku.name}<br><small style="color: #666;">${item.sku.description}</small></td>
                    <td>${item.sku.id}</td>
                    <td>${item.unitType === "box" ? "Box" : "Packet"}</td>
                    <td>${item.quantity}</td>
                    <td>₹${pricePerUnit.toFixed(2)}</td>
                    <td><strong>₹${itemTotal.toFixed(2)}</strong></td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>₹${order.totalAmount.toFixed(2)}</span>
          </div>
          ${
            order.discountCode
              ? `
          <div class="totals-row" style="color: green;">
            <span>Discount (${order.discountCode}):</span>
            <span>-₹${order.discountAmount?.toFixed(2) || "0.00"}</span>
          </div>
          `
              : ""
          }
          <div class="totals-row final-total">
            <span>Final Amount:</span>
            <span>₹${order.finalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice.</p>
        </div>
      </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([invoiceHTML], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_${order.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePrintInvoice = () => {
    if (!order || !shop) return;

    // Create invoice content
    let invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - Order #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .header h1 { color: #1976d2; margin: 0; }
          .info-section { margin-bottom: 30px; }
          .info-section h3 { color: #333; border-bottom: 2px solid #1976d2; padding-bottom: 5px; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .totals { margin-top: 30px; }
          .totals-row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 16px; }
          .final-total { font-size: 20px; font-weight: bold; color: #1976d2; border-top: 2px solid #1976d2; padding-top: 10px; }
          .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p>Order #${order.id}</p>
          <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <div class="info-section">
          <h3>Shop Information</h3>
          <div class="info-row"><span><strong>Name:</strong></span><span>${shop.name}</span></div>
          <div class="info-row"><span><strong>Location:</strong></span><span>${shop.location}</span></div>
          <div class="info-row"><span><strong>Phone:</strong></span><span>${shop.phoneNumber}</span></div>
          <div class="info-row"><span><strong>Category:</strong></span><span>${shop.category}</span></div>
        </div>

        ${
          employee
            ? `
        <div class="info-section">
          <h3>Order Taken By</h3>
          <div class="info-row"><span><strong>Name:</strong></span><span>${employee.name}</span></div>
          <div class="info-row"><span><strong>Email:</strong></span><span>${employee.email}</span></div>
          <div class="info-row"><span><strong>Role:</strong></span><span>${employee.role}</span></div>
        </div>
        `
            : ""
        }

        ${
          delivery
            ? `
        <div class="info-section">
          <h3>Delivery Information</h3>
          <div class="info-row"><span><strong>Tracking Number:</strong></span><span>${delivery.trackingNumber || "N/A"}</span></div>
          <div class="info-row"><span><strong>Status:</strong></span><span>${delivery.status}</span></div>
          <div class="info-row"><span><strong>Current Location:</strong></span><span>${delivery.currentLocation || "N/A"}</span></div>
          <div class="info-row"><span><strong>${delivery.actualDeliveryDate ? "Delivered On:" : "Estimated Delivery:"}</strong></span><span>${delivery.actualDeliveryDate ? new Date(delivery.actualDeliveryDate).toLocaleDateString() : delivery.estimatedDeliveryDate ? new Date(delivery.estimatedDeliveryDate).toLocaleDateString() : "N/A"}</span></div>
        </div>
        `
            : ""
        }

        <div class="info-section">
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit Type</th>
                <th>Quantity</th>
                <th>Price per Unit</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems
                .map((item) => {
                  const pricePerUnit =
                    item.unitType === "box"
                      ? item.sku.boxPrice
                      : item.sku.price;
                  const itemTotal = pricePerUnit * item.quantity;
                  return `
                  <tr>
                    <td>${item.sku.name}<br><small style="color: #666;">${item.sku.description}</small></td>
                    <td>${item.sku.id}</td>
                    <td>${item.unitType === "box" ? "Box" : "Packet"}</td>
                    <td>${item.quantity}</td>
                    <td>₹${pricePerUnit.toFixed(2)}</td>
                    <td><strong>₹${itemTotal.toFixed(2)}</strong></td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>₹${order.totalAmount.toFixed(2)}</span>
          </div>
          ${
            order.discountCode
              ? `
          <div class="totals-row" style="color: green;">
            <span>Discount (${order.discountCode}):</span>
            <span>-₹${order.discountAmount?.toFixed(2) || "0.00"}</span>
          </div>
          `
              : ""
          }
          <div class="totals-row final-total">
            <span>Final Amount:</span>
            <span>₹${order.finalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice.</p>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading order details...</Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box textAlign="center" py={8}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Order Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The order you're looking for doesn't exist or has been removed.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/delivery")}
          >
            Back to Deliveries
          </Button>
        </Box>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    const statusColors: {
      [key: string]:
        | "default"
        | "primary"
        | "secondary"
        | "error"
        | "info"
        | "success"
        | "warning";
    } = {
      Packaging: "info",
      Transit: "primary",
      ShipToOutlet: "secondary",
      OutForDelivery: "warning",
      Delivered: "success",
    };
    return statusColors[status] || "default";
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/dashboard")} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Order Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Order #{order.id}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            icon={<ShoppingBagIcon />}
            label={new Date(order.createdAt).toLocaleDateString()}
            color="primary"
            variant="outlined"
          />
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/order/${order.id}/edit`)}
            size="small"
          >
            Edit Order
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadInvoice}
            size="small"
          >
            Download Invoice
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrintInvoice}
            size="small"
          >
            Print Invoice
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Shop Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <StoreIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Shop Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {shop ? (
                <>
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
                      Location
                    </Typography>
                    <Typography variant="body1">{shop.location}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1">{shop.phoneNumber}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Chip
                      label={shop.category}
                      size="small"
                      color={
                        shop.category === "wholeseller"
                          ? "primary"
                          : "secondary"
                      }
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </>
              ) : (
                <Typography color="text.secondary">
                  Shop information not available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Delivery Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Delivery Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {delivery ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tracking Number
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {delivery.trackingNumber || "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={delivery.status}
                      color={getStatusColor(delivery.status)}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Location
                    </Typography>
                    <Typography variant="body1">
                      {delivery.currentLocation || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {delivery.actualDeliveryDate
                        ? "Delivered On"
                        : "Estimated Delivery"}
                    </Typography>
                    <Typography variant="body1">
                      {delivery.actualDeliveryDate
                        ? new Date(
                            delivery.actualDeliveryDate,
                          ).toLocaleDateString()
                        : delivery.estimatedDeliveryDate
                          ? new Date(
                              delivery.estimatedDeliveryDate,
                            ).toLocaleDateString()
                          : "N/A"}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Typography color="text.secondary">
                  Delivery information not available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Taken By */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Order Taken By
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {employee ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {employee.name}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{employee.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Chip
                      label={employee.role.toUpperCase()}
                      size="small"
                      color={employee.role === "admin" ? "error" : "primary"}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </>
              ) : (
                <Typography color="text.secondary">
                  Employee information not available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ReceiptIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Order Items
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell>
                        <strong>Product</strong>
                      </TableCell>
                      <TableCell>
                        <strong>SKU</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Unit Type</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Quantity</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Price per Unit</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Total</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.orderItems.map((item, index) => {
                      const pricePerUnit =
                        item.unitType === "box"
                          ? item.sku.boxPrice
                          : item.sku.price;
                      const itemTotal = pricePerUnit * item.quantity;
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="500">
                              {item.sku.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.sku.description}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.sku.id}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={item.unitType === "box" ? "Box" : "Packet"}
                              size="small"
                              color={
                                item.unitType === "box" ? "primary" : "default"
                              }
                            />
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">
                            ₹{pricePerUnit.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <strong>₹{itemTotal.toFixed(2)}</strong>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxWidth: 400, ml: "auto" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1">
                    ₹{order.totalAmount.toFixed(2)}
                  </Typography>
                </Box>
                {order.discountCode && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" color="success.main">
                        Discount ({order.discountCode}):
                      </Typography>
                      <Typography variant="body1" color="success.main">
                        -₹{order.discountAmount?.toFixed(2) || "0.00"}
                      </Typography>
                    </Box>
                  </>
                )}
                <Divider sx={{ my: 1 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Final Amount:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    ₹{order.finalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/delivery")}
        >
          Back to Deliveries
        </Button>
        {delivery && (
          <Button
            variant="contained"
            component={RouterLink}
            to="/delivery"
            state={{ highlightDeliveryId: delivery.id }}
          >
            View Delivery Status
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default OrderDetailPage;
