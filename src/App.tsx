import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ClerkProvider } from "@clerk/clerk-react";

// Pages
import HomePage from "./pages/HomePage";
import ShopFormPage from "./pages/ShopFormPage";
import ShopListPage from "./pages/ShopListPage";
import ShopDetailPage from "./pages/ShopDetailPage";
import OrderPage from "./pages/OrderPage";
import OrderListPage from "./pages/OrderListPage";
import OrderSummaryPage from "./pages/OrderSummaryPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import DeliveryPage from "./pages/DeliveryPage";
import SurveyPage from "./pages/SurveyPage";
import ReturnOrderPage from "./pages/ReturnOrder";
import WelcomePage from "./pages/WelcomePage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import TimesheetPage from "./pages/TimesheetPage";
import AdminTimesheetPage from "./pages/admin/AdminTimesheetPage";
import BatchCostCalculatorPage from "./pages/admin/BatchCostCalculatorPage";
import CostManagerPage from "./pages/admin/CostManagerPage";
import UserManagementPage from "./pages/admin/UserManagementPage";

// Components
import AuthWrapper from "./components/auth/AuthWrapper";

// Configuration
import { clerkPublishableKey, clerkAppearance } from "./config/clerkConfig";

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#5e35b1", // Deep purple
    },
    secondary: {
      main: "#e91e63", // Pink
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "0 3px 5px 2px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey || ""}
      appearance={clerkAppearance}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Router>
            <Routes>
              {/* Welcome page as the root route */}
              <Route
                path="/"
                element={
                  <AuthWrapper requireAuth={false}>
                    <WelcomePage />
                  </AuthWrapper>
                }
              />
              <Route path="/index.html" element={<Navigate to="/" replace />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <AuthWrapper requireAuth={true}>
                    <HomePage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/new-shop"
                element={
                  <AuthWrapper requireAuth={true}>
                    <ShopFormPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/shops"
                element={
                  <AuthWrapper requireAuth={true}>
                    <ShopListPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/shop-detail/:shopId"
                element={
                  <AuthWrapper requireAuth={true}>
                    <ShopDetailPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/shop/:shopId/edit"
                element={
                  <AuthWrapper requireAuth={true}>
                    <ShopFormPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/order"
                element={
                  <AuthWrapper requireAuth={true}>
                    <OrderPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/order/:orderId/edit"
                element={
                  <AuthWrapper requireAuth={true}>
                    <OrderPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/orders"
                element={
                  <AuthWrapper requireAuth={true}>
                    <OrderListPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/order-summary"
                element={
                  <AuthWrapper requireAuth={true}>
                    <OrderSummaryPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/order-detail/:orderId"
                element={
                  <AuthWrapper requireAuth={true}>
                    <OrderDetailPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/delivery"
                element={
                  <AuthWrapper requireAuth={true}>
                    <DeliveryPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/return-order"
                element={
                  <AuthWrapper requireAuth={true}>
                    <ReturnOrderPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/survey"
                element={
                  <AuthWrapper requireAuth={true}>
                    <SurveyPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/admin/analytics"
                element={
                  <AuthWrapper requireAuth={true}>
                    <AnalyticsPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/timesheet"
                element={
                  <AuthWrapper requireAuth={true}>
                    <TimesheetPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/admin/timesheets"
                element={
                  <AuthWrapper requireAuth={true}>
                    <AdminTimesheetPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/admin/batch-cost-calculator"
                element={
                  <AuthWrapper requireAuth={true}>
                    <BatchCostCalculatorPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/admin/cost-manager"
                element={
                  <AuthWrapper requireAuth={true}>
                    <CostManagerPage />
                  </AuthWrapper>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <AuthWrapper requireAuth={true}>
                    <UserManagementPage />
                  </AuthWrapper>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
