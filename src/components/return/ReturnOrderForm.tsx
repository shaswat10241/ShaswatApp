import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Divider,
  Autocomplete,
  InputLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UndoIcon from "@mui/icons-material/Undo";
import { useShopStore } from "../../services/shopStore";
import { useOrderStore } from "../../services/orderStore";
import {
  ReturnOrderFormData,
  SKU,
  Order,
} from "../../models/Order";
import { Shop } from "../../models/Shop";

const RETURN_REASONS = [
  { value: "DAMAGED", label: "Product Damaged" },
  { value: "DEFECTIVE", label: "Product Defective" },
  { value: "WRONG_ITEM", label: "Wrong Item Received" },
  { value: "CUSTOMER_CHANGED_MIND", label: "Customer Changed Mind" },
  { value: "EXPIRED", label: "Product Expired" },
  { value: "OTHER", label: "Other Reason" },
];

const ReturnOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { shops, fetchShops, loading: shopsLoading } = useShopStore();
  const {
    skus,
    fetchSKUs,
    createReturnOrder,
    loading: ordersLoading,
  } = useOrderStore();
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopOrders, setShopOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Initialize form
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ReturnOrderFormData>({
    defaultValues: {
      shopId: "",
      linkedOrderId: "",
      returnItems: [
        { sku: null as unknown as SKU, quantity: 1, unitType: "packet" },
      ],
      reasonCode: "",
      notes: "",
    },
  });

  // Setup field arrays for return items
  const {
    fields: returnItemFields,
    append: appendReturnItem,
    remove: removeReturnItem,
  } = useFieldArray({
    control,
    name: "returnItems",
  });

  // Watch values for calculations
  const watchedReturnItems = watch("returnItems") || [];

  // Load shops and SKUs when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchShops();
      await fetchSKUs();
      await useOrderStore.getState().fetchOrders();
    };

    loadInitialData();
  }, [fetchShops, fetchSKUs]);

  // Fetch orders for the selected shop
  useEffect(() => {
    if (selectedShop?.id) {
      const filteredOrders = useOrderStore
        .getState()
        .orders.filter((order) => order.shopId === selectedShop.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      setShopOrders(filteredOrders);
    } else {
      setShopOrders([]);
    }
  }, [selectedShop]);

  // Calculate return subtotal
  const calculateSubtotal = () => {
    let subtotal = 0;

    // Calculate for return items
    if (Array.isArray(watchedReturnItems)) {
      watchedReturnItems.forEach((item) => {
        if (item?.sku && item?.quantity) {
          const pricePerUnit =
            item.unitType === "box" ? item.sku.boxPrice : item.sku.price;
          subtotal += pricePerUnit * item.quantity;
        }
      });
    }

    return subtotal;
  };

  const onSubmit = async (data: ReturnOrderFormData) => {
    try {
      const returnOrder = await createReturnOrder(data);
      navigate("/return-summary", { state: { returnOrderId: returnOrder.id } });
    } catch (error) {
      console.error("Error creating return order:", error);
    }
  };

  // Handler for shop selection
  const handleShopChange = (shopId: string) => {
    const shop = shops.find((s) => s.id === shopId);
    setSelectedShop(shop || null);
    setValue("linkedOrderId", "");
    setSelectedOrder(null);
  };

  // Handler for order selection
  const handleOrderChange = (orderId: string) => {
    const order = shopOrders.find((o) => o.id === orderId);
    setSelectedOrder(order || null);
  };

  return (
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
                  handleShopChange(e.target.value as string);
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

        {/* Linked Order Selection */}
        {selectedShop && (
          <Controller
            name="linkedOrderId"
            control={control}
            rules={{ required: "Linked order is required" }}
            render={({ field }) => (
              <FormControl error={!!errors.linkedOrderId} fullWidth>
                <FormLabel>Select Order to Return</FormLabel>
                <Select
                  {...field}
                  displayEmpty
                  onChange={(e) => {
                    field.onChange(e);
                    handleOrderChange(e.target.value as string);
                  }}
                >
                  <MenuItem value="" disabled>
                    Select an order
                  </MenuItem>
                  {shopOrders.length === 0 ? (
                    <MenuItem value="" disabled>
                      No orders found for this shop
                    </MenuItem>
                  ) : (
                    shopOrders.map((order) => (
                      <MenuItem key={order.id} value={order.id}>
                        Order #{order.id} -{" "}
                        {new Date(order.createdAt).toLocaleDateString()} (
                        {order.orderItems.length} items, ₹
                        {order.finalAmount.toFixed(2)})
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.linkedOrderId && (
                  <FormHelperText error>
                    {errors.linkedOrderId.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        )}

        {/* Return Items Section */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Return Items
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {selectedOrder ? (
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: "#f8f9fa",
                borderRadius: 1,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                color="primary"
                fontWeight="500"
              >
                Available Items from Order #{selectedOrder.id} (
                {new Date(selectedOrder.createdAt).toLocaleDateString()})
              </Typography>
              <Grid container spacing={1}>
                {selectedOrder.orderItems.map((item, i) => (
                  <Grid item xs={12} sm={6} key={`available-${i}`}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: "#ffffff",
                        border: "1px solid #e0e0e0",
                        fontSize: "0.875rem",
                        "&:hover": {
                          bgcolor: "#f0f7ff",
                          borderColor: "#90caf9",
                        },
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        // Find if this item is already in the return items
                        const existingIndex = returnItemFields.findIndex(
                          (field, idx) => {
                            const fieldValue = watch(`returnItems.${idx}.sku`);
                            return fieldValue && fieldValue.id === item.sku.id;
                          },
                        );

                        if (existingIndex >= 0) {
                          // If exists, increment quantity
                          const currentQty =
                            watch(`returnItems.${existingIndex}.quantity`) || 1;
                          setValue(
                            `returnItems.${existingIndex}.quantity`,
                            Math.min(currentQty + 1, item.quantity),
                          );
                        } else {
                          // Otherwise add new return item with quantity 1
                          appendReturnItem({
                            sku: item.sku,
                            quantity: 1,
                            unitType: item.unitType,
                          });
                        }
                      }}
                    >
                      <Typography variant="body2" fontWeight="500">
                        {item.sku.name} ({item.sku.id})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Quantity: {item.quantity}{" "}
                        {item.unitType === "box" ? "boxes" : "packets"} • Price:
                        ₹
                        {(item.unitType === "box"
                          ? item.sku.boxPrice
                          : item.sku.price
                        ).toFixed(2)}{" "}
                        per {item.unitType}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Select an order to see available items for return
            </Typography>
          )}

          {returnItemFields.map((field, index) => (
            <Grid container spacing={2} key={field.id} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <Controller
                  name={`returnItems.${index}.sku` as const}
                  control={control}
                  rules={{ required: "SKU is required" }}
                  render={({ field: { onChange, value } }) => (
                    <Autocomplete
                      options={
                        selectedOrder
                          ? selectedOrder.orderItems.map((item) => item.sku)
                          : skus
                      }
                      getOptionLabel={(option) =>
                        `${option.id} - ${option.name}`
                      }
                      value={value}
                      onChange={(_, newValue) => onChange(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="SKU"
                          error={!!errors?.returnItems?.[index]?.sku}
                          helperText={
                            errors?.returnItems?.[index]?.sku?.message
                          }
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name={`returnItems.${index}.unitType`}
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
                  name={`returnItems.${index}.quantity`}
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
                      error={!!errors?.returnItems?.[index]?.quantity}
                      helperText={
                        errors?.returnItems?.[index]?.quantity?.message
                      }
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={2} md={1} display="flex" alignItems="center">
                <IconButton
                  color="error"
                  onClick={() => removeReturnItem(index)}
                  disabled={returnItemFields.length === 1}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={() =>
              appendReturnItem({
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

        {/* Return Details */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Return Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Controller
            name="reasonCode"
            control={control}
            rules={{ required: "Return reason is required" }}
            render={({ field }) => (
              <FormControl error={!!errors.reasonCode} fullWidth>
                <InputLabel id="reason-label">Return Reason</InputLabel>
                <Select
                  {...field}
                  labelId="reason-label"
                  label="Return Reason"
                  displayEmpty
                >
                  <MenuItem value="" disabled></MenuItem>
                  {RETURN_REASONS.map((reason) => (
                    <MenuItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.reasonCode && (
                  <FormHelperText error>
                    {errors.reasonCode.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Box>

        {/* Notes */}
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth sx={{ mt: 3 }}>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <TextField
                {...field}
                multiline
                rows={3}
                placeholder="Add any additional details about this return"
                variant="outlined"
              />
            </FormControl>
          )}
        />

        {/* Subtotal Display */}
        <Box
          className="summary-section"
          sx={{ mt: 4, bgcolor: "#f3f9fe", p: 3, borderRadius: 2 }}
        >
          <Typography variant="h6" gutterBottom>
            Return Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box className="summary-row">
            <Typography>Total Return Value:</Typography>
            <Typography fontWeight="bold">
              ₹{calculateSubtotal().toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* Submit Buttons */}
        <Box
          className="button-container"
          sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={shopsLoading || ordersLoading}
            startIcon={<UndoIcon />}
            sx={{ minWidth: 160, py: 1.25, borderRadius: 6 }}
          >
            {ordersLoading ? "Processing..." : "Submit Return"}
          </Button>
        </Box>
      </Stack>
    </form>
  );
};

export default ReturnOrderForm;
