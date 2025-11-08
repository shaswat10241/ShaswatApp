import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Divider,
} from "@mui/material";
import ReturnOrderForm from "../components/return/ReturnOrderForm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import PersonIcon from "@mui/icons-material/Person";

const ReturnOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

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
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <IconButton
              onClick={() => navigate("/")}
              sx={{ mr: 2 }}
              aria-label="back to dashboard"
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Return Order
            </Typography>
          </Box>
          <Divider sx={{ mt: 1 }} />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            bgcolor: "white",
            overflow: "hidden",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Create Return Order
            </Typography>
          </Box>
          <ReturnOrderForm />
        </Paper>
      </Container>
    </Box>
  );
};

export default ReturnOrderPage;
