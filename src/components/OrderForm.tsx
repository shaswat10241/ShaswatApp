import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useDeliveryStore } from "../services/deliveryStore";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Divider,
  Autocomplete,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useShopStore } from "../services/shopStore";
import { useOrderStore } from "../services/orderStore";
import { Order, OrderFormData, SKU } from "../models/Order";

interface OrderFormProps {
  order?: Order;
  isEdit?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({ order, isEdit = false }) => {
  const navigate = useNavigate();
  const { shops, fetchShops, loading: shopsLoading } = useShopStore();
  const {
    skus,
    fetchSKUs,
    createOrder,
    updateOrder,
    loading: ordersLoading,
  } = useOrderStore();

  // Initialize form
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OrderFormData>({
    defaultValues: {
      shopId: order?.shopId || "",
      orderItems: order?.orderItems || [
        { sku: null as unknown as SKU, quantity: 1, unitType: "packet" },
      ],
      discountCode: order?.discountCode || "",
    },
  });

  // Setup field arrays for order items
  const {
    fields: orderItemFields,
    append: appendOrderItem,
    remove: removeOrderItem,
  } = useFieldArray({
    control,
    name: "orderItems",
  });

  // Watch values for calculations
  const watchedOrderItems = watch("orderItems") || [];

  // Load shops and SKUs when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchShops();
      await fetchSKUs();
    };

    loadInitialData();
  }, [fetchShops, fetchSKUs]);

  // Calculate order subtotal
  const calculateSubtotal = () => {
    let subtotal = 0;

    // Add order items
    watchedOrderItems.forEach((item) => {
      if (item.sku && item.quantity) {
        const pricePerUnit =
          item.unitType === "box" ? item.sku.boxPrice : item.sku.price;
        subtotal += pricePerUnit * item.quantity;
      }
    });

    return subtotal;
  };

  const onSubmit = async (data: OrderFormData) => {
    try {
      if (isEdit && order?.id) {
        // Update existing order
        const updatedOrder = await updateOrder(order.id, data);
        navigate(`/order-detail/${order.id}`);
      } else {
        // Create new order
        const newOrder = await createOrder(data);

        // Then automatically create a delivery entry for this order
        if (newOrder.id) {
          try {
            // Use the delivery store to create a delivery entry
            await useDeliveryStore.getState().createDeliveryFromOrder(newOrder);
            console.log("Delivery created for order", newOrder.id);
          } catch (deliveryError) {
            console.error("Error creating delivery:", deliveryError);
            // Continue even if delivery creation fails
          }
        }

        navigate("/order-summary", { state: { orderId: newOrder.id } });
      }
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} order:`, error);
    }
  };

  return (
    <Paper className="form-container">
      <Typography variant="h5" component="h2" gutterBottom>
        {isEdit ? "Edit Order" : "Create Order"}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* Shop Selection */}
          <Controller
            name="shopId"
            control={control}
            rules={{ required: "Shop is required" }}
            render={({ field }) => (
              <FormControl error={!!errors.shopId} fullWidth>
                <FormLabel>Shop</FormLabel>
                <Select
                  {...field}
                  displayEmpty
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                >
                  <MenuItem value="" disabled>
                    Select a shop
                  </MenuItem>
                  {shops.map((shop) => (
                    <MenuItem key={shop.id} value={shop.id}>
                      {shop.name} - {shop.location}
                      {shop.isNew && " (New)"}
                    </MenuItem>
                  ))}
                </Select>
                {errors.shopId && (
                  <FormHelperText error>{errors.shopId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {/* Order Items Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {orderItemFields.map((field, index) => (
              <Grid container spacing={2} key={field.id} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name={`orderItems.${index}.sku`}
                    control={control}
                    rules={{ required: "SKU is required" }}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        options={skus}
                        getOptionLabel={(option) =>
                          `${option.id} - ${option.name}`
                        }
                        value={value}
                        onChange={(_, newValue) => onChange(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="SKU"
                            error={!!errors.orderItems?.[index]?.sku}
                            helperText={
                              errors.orderItems?.[index]?.sku?.message
                            }
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name={`orderItems.${index}.unitType`}
                    control={control}
                    render={({ field }) => (
                      <FormControl>
                        <FormLabel>Unit Type</FormLabel>
                        <RadioGroup {...field} row>
                          <FormControlLabel
                            value="packet"
                            control={<Radio />}
                            label="Packet"
                          />
                          <FormControlLabel
                            value="box"
                            control={<Radio />}
                            label="Box"
                          />
                        </RadioGroup>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={10} md={5}>
                  <Controller
                    name={`orderItems.${index}.quantity`}
                    control={control}
                    rules={{
                      required: "Quantity is required",
                      min: { value: 1, message: "Minimum quantity is 1" },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Quantity"
                        type="number"
                        fullWidth
                        error={!!errors.orderItems?.[index]?.quantity}
                        helperText={
                          errors.orderItems?.[index]?.quantity?.message
                        }
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={2} md={1} display="flex" alignItems="center">
                  <IconButton
                    color="error"
                    onClick={() => removeOrderItem(index)}
                    disabled={orderItemFields.length === 1}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={() =>
                appendOrderItem({
                  sku: null as unknown as SKU,
                  quantity: 1,
                  unitType: "packet",
                })
              }
              sx={{ mt: 1 }}
            >
              Add Item
            </Button>
          </Box>

          {/* Discount Code */}
          <Controller
            name="discountCode"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <FormLabel>Discount Code (Optional)</FormLabel>
                <TextField {...field} placeholder="Enter discount code" />
              </FormControl>
            )}
          />

          {/* Subtotal Display */}
          <Box className="summary-section">
            <Typography variant="subtitle1" gutterBottom>
              Order Summary
            </Typography>
            <Box className="summary-row">
              <Typography>Subtotal:</Typography>
              <Typography>₹{calculateSubtotal().toFixed(2)}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              * Final amount including any applicable discounts will be
              calculated on submission
            </Typography>
          </Box>

          {/* Submit Buttons */}
          <Box className="button-container">
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(isEdit && order?.id ? `/order-detail/${order.id}` : "/")}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={shopsLoading || ordersLoading}
            >
              {ordersLoading
                ? "Processing..."
                : isEdit
                  ? "Update Order"
                  : "Submit Order"}
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};

export default OrderForm;
