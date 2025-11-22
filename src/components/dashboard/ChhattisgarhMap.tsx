import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Shop } from "../../models/Shop";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ChhattisgarhMapProps {
  shops: Shop[];
}

// Create custom icons for different shop categories
const createCustomIcon = (category: "wholeseller" | "retailer") => {
  const color = category === "wholeseller" ? "#1976d2" : "#2e7d32";
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          text-align: center;
          line-height: 24px;
          font-size: 14px;
        ">
          ${category === "wholeseller" ? "W" : "R"}
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Component to fit map bounds to markers (within Chhattisgarh bounds)
const MapBounds: React.FC<{ shops: Shop[]; maxBounds: L.LatLngBoundsExpression }> = ({ shops, maxBounds }) => {
  const map = useMap();

  useEffect(() => {
    const shopsWithCoords = shops.filter(
      (shop) => shop.latitude && shop.longitude
    );

    if (shopsWithCoords.length > 0) {
      const shopBounds = L.latLngBounds(
        shopsWithCoords.map((shop) => [shop.latitude!, shop.longitude!])
      );
      // Fit to shop bounds but don't zoom out beyond Chhattisgarh bounds
      map.fitBounds(shopBounds, { padding: [50, 50], maxZoom: 10 });
    } else {
      // If no shops, show entire Chhattisgarh state
      map.fitBounds(maxBounds);
    }
  }, [shops, map, maxBounds]);

  return null;
};

const ChhattisgarhMap: React.FC<ChhattisgarhMapProps> = ({ shops }) => {
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<{
    wholeseller: boolean;
    retailer: boolean;
  }>({
    wholeseller: true,
    retailer: true,
  });

  // Chhattisgarh center coordinates
  const chhattisgarhCenter: [number, number] = [21.2514, 81.6296];

  // Chhattisgarh state boundaries (approximate)
  const chhattisgarhBounds: L.LatLngBoundsExpression = [
    [17.46, 80.15],  // Southwest corner (lat, lng)
    [24.10, 84.40],  // Northeast corner (lat, lng)
  ];

  // Get shops with valid coordinates
  const shopsWithCoords = shops.filter(
    (shop) => shop.latitude && shop.longitude
  );

  // Get unique districts
  const districts = Array.from(
    new Set(
      shops
        .map((shop) => shop.district)
        .filter((d) => d) as string[]
    )
  ).sort();

  // Filter shops based on selected filters
  const filteredShops = shopsWithCoords.filter((shop) => {
    const matchesDistrict =
      districtFilter === "all" || shop.district === districtFilter;
    const matchesCategory = categoryFilter[shop.category];
    return matchesDistrict && matchesCategory;
  });

  // Calculate statistics
  const stats = {
    total: filteredShops.length,
    wholesellers: filteredShops.filter((s) => s.category === "wholeseller")
      .length,
    retailers: filteredShops.filter((s) => s.category === "retailer").length,
    districts: new Set(filteredShops.map((s) => s.district).filter((d) => d))
      .size,
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Chhattisgarh Market Penetration Map
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Geographic distribution of shops across Chhattisgarh
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>District Filter</InputLabel>
          <Select
            value={districtFilter}
            label="District Filter"
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <MenuItem value="all">All Districts</MenuItem>
            {districts.map((district) => (
              <MenuItem key={district} value={district}>
                {district}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={categoryFilter.wholeseller}
                onChange={(e) =>
                  setCategoryFilter({
                    ...categoryFilter,
                    wholeseller: e.target.checked,
                  })
                }
                sx={{ "& .MuiSvgIcon-root": { color: "#1976d2" } }}
              />
            }
            label="Wholesellers"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={categoryFilter.retailer}
                onChange={(e) =>
                  setCategoryFilter({
                    ...categoryFilter,
                    retailer: e.target.checked,
                  })
                }
                sx={{ "& .MuiSvgIcon-root": { color: "#2e7d32" } }}
              />
            }
            label="Retailers"
          />
        </FormGroup>
      </Box>

      {/* Statistics */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip
          label={`Total Shops: ${stats.total}`}
          color="default"
          variant="outlined"
        />
        <Chip
          label={`Wholesellers: ${stats.wholesellers}`}
          sx={{ bgcolor: "#1976d2", color: "white" }}
        />
        <Chip
          label={`Retailers: ${stats.retailers}`}
          sx={{ bgcolor: "#2e7d32", color: "white" }}
        />
        <Chip
          label={`Districts Covered: ${stats.districts}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Map */}
      <Box sx={{ height: 500, borderRadius: 1, overflow: "hidden", border: "1px solid #e0e0e0" }}>
        <MapContainer
          center={chhattisgarhCenter}
          zoom={7}
          minZoom={7}
          maxZoom={12}
          maxBounds={chhattisgarhBounds}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredShops.length > 0 ? (
            <>
              <MapBounds shops={filteredShops} maxBounds={chhattisgarhBounds} />
              {filteredShops.map((shop) => (
                <Marker
                  key={shop.id}
                  position={[shop.latitude!, shop.longitude!]}
                  icon={createCustomIcon(shop.category)}
                >
                  <Popup>
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {shop.name}
                      </Typography>
                      <Typography variant="caption" display="block">
                        <strong>Category:</strong>{" "}
                        {shop.category === "wholeseller" ? "Wholeseller" : "Retailer"}
                      </Typography>
                      <Typography variant="caption" display="block">
                        <strong>District:</strong> {shop.district || "N/A"}
                      </Typography>
                      <Typography variant="caption" display="block">
                        <strong>Location:</strong> {shop.location}
                      </Typography>
                      <Typography variant="caption" display="block">
                        <strong>Phone:</strong> {shop.phoneNumber}
                      </Typography>
                      <Chip
                        label={shop.isNew ? "New Shop" : "Existing"}
                        size="small"
                        color={shop.isNew ? "success" : "default"}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Popup>
                </Marker>
              ))}
            </>
          ) : null}
        </MapContainer>
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 2, display: "flex", gap: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              bgcolor: "#1976d2",
              borderRadius: "50%",
              border: "2px solid white",
            }}
          />
          <Typography variant="caption">Wholeseller (W)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              bgcolor: "#2e7d32",
              borderRadius: "50%",
              border: "2px solid white",
            }}
          />
          <Typography variant="caption">Retailer (R)</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ChhattisgarhMap;
