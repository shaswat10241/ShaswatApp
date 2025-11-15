import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Shop, ShopFormData } from "../models/Shop";
import { useShopStore } from "../services/shopStore";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface ShopFormProps {
  shop?: Shop;
  isEdit?: boolean;
}

const ShopForm: React.FC<ShopFormProps> = ({ shop, isEdit = false }) => {
  const navigate = useNavigate();
  const { addShop, updateShop, loading } = useShopStore();
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ShopFormData>({
    defaultValues: {
      name: shop?.name || "",
      location: shop?.location || "",
      phoneNumber: shop?.phoneNumber || "",
      category: shop?.category || "retailer",
      latitude: shop?.latitude || undefined,
      longitude: shop?.longitude || undefined,
    },
  });

  // Set initial location when editing
  useEffect(() => {
    if (isEdit && shop?.latitude && shop?.longitude) {
      setCurrentLocation({
        latitude: shop.latitude,
        longitude: shop.longitude,
        address: shop.location,
      });
    }
  }, [isEdit, shop]);

  const getGeolocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        },
      );

      const { latitude, longitude } = position.coords;

      // Try to get address from coordinates using reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        );
        const data = await response.json();

        if (data && data.display_name) {
          setValue("location", data.display_name);
          setCurrentLocation({
            latitude,
            longitude,
            address: data.display_name,
          });
        } else {
          // If reverse geocoding fails, just use coordinates
          setValue(
            "location",
            `Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
          );
          setCurrentLocation({
            latitude,
            longitude,
            address: `Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
          });
        }

        // Save the coordinates regardless of whether we got an address
        setValue("latitude", latitude);
        setValue("longitude", longitude);
      } catch (geocodeError) {
        // If reverse geocoding fails, just use coordinates
        setValue(
          "location",
          `Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
        );
        setValue("latitude", latitude);
        setValue("longitude", longitude);
        console.error("Error getting address:", geocodeError);
      }
    } catch (error) {
      setLocationError(
        error instanceof GeolocationPositionError
          ? getPositionErrorMessage(error)
          : "Failed to get your location",
      );
      console.error("Geolocation error:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  const getPositionErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location permission denied. Please allow access to your location.";
      case error.POSITION_UNAVAILABLE:
        return "Location information is unavailable.";
      case error.TIMEOUT:
        return "The request to get location timed out.";
      default:
        return "An unknown error occurred getting your location.";
    }
  };

  // Try to get location when component mounts (only for new shops)
  useEffect(() => {
    if (!isEdit) {
      getGeolocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  const onSubmit = async (data: ShopFormData) => {
    try {
      const shopData = {
        ...data,
        latitude: currentLocation?.latitude || data.latitude || undefined,
        longitude: currentLocation?.longitude || data.longitude || undefined,
      };

      if (isEdit && shop?.id) {
        // Update existing shop
        await updateShop(shop.id, shopData);
        // After successful update, navigate to shop detail page
        navigate(`/shop-detail/${shop.id}`);
      } else {
        // Create new shop
        await addShop(shopData);
        // After successful creation, navigate back to home page or shops list
        navigate("/");
      }
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} shop:`, error);
    }
  };

  return (
    <Paper className="form-container">
      <Typography variant="h5" component="h2" gutterBottom>
        {isEdit ? "Edit Shop" : "Create New Shop"}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Controller
            name="name"
            control={control}
            rules={{ required: "Shop name is required" }}
            render={({ field }) => (
              <FormControl error={!!errors.name} fullWidth>
                <FormLabel>Shop Name</FormLabel>
                <TextField
                  {...field}
                  placeholder="Enter shop name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </FormControl>
            )}
          />

          <Controller
            name="location"
            control={control}
            rules={{ required: "Location is required" }}
            render={({ field }) => (
              <FormControl error={!!errors.location} fullWidth>
                <FormLabel>Location</FormLabel>
                <TextField
                  {...field}
                  placeholder="Enter shop location"
                  error={!!errors.location}
                  helperText={errors.location?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={getGeolocation}
                          edge="end"
                          disabled={locationLoading}
                          aria-label="get current location"
                          title="Get current location"
                        >
                          {locationLoading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <MyLocationIcon color="primary" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                    startAdornment: currentLocation && (
                      <InputAdornment position="start">
                        <LocationOnIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                {locationError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {locationError}
                  </Alert>
                )}
                {currentLocation && !locationError && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Using your current location. Coordinates:{" "}
                    {currentLocation.latitude.toFixed(6)},{" "}
                    {currentLocation.longitude.toFixed(6)}
                  </Alert>
                )}
              </FormControl>
            )}
          />

          {/* Hidden fields for latitude and longitude */}
          <Controller
            name="latitude"
            control={control}
            render={({ field }) => <input type="hidden" {...field} />}
          />

          <Controller
            name="longitude"
            control={control}
            render={({ field }) => <input type="hidden" {...field} />}
          />

          <Controller
            name="phoneNumber"
            control={control}
            rules={{
              required: "Phone number is required",
              pattern: {
                value: /^[0-9-+\s()]*$/,
                message: "Invalid phone number format",
              },
            }}
            render={({ field }) => (
              <FormControl error={!!errors.phoneNumber} fullWidth>
                <FormLabel>Phone Number</FormLabel>
                <TextField
                  {...field}
                  placeholder="Enter phone number"
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                />
              </FormControl>
            )}
          />

          <Controller
            name="category"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <FormControl error={!!errors.category} fullWidth>
                <FormLabel>Category</FormLabel>
                <RadioGroup row {...field}>
                  <FormControlLabel
                    value="retailer"
                    control={<Radio />}
                    label="Retailer"
                  />
                  <FormControlLabel
                    value="wholeseller"
                    control={<Radio />}
                    label="Wholeseller"
                  />
                </RadioGroup>
                {errors.category && (
                  <FormHelperText error>
                    {errors.category.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Box className="button-container">
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(isEdit && shop?.id ? `/shop-detail/${shop.id}` : "/")}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading
                ? (isEdit ? "Updating..." : "Creating...")
                : (isEdit ? "Update Shop" : "Create Shop")}
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};

export default ShopForm;
