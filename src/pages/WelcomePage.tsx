import React from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  alpha,
} from "@mui/material";
import { SignInButton } from "@clerk/clerk-react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InventoryIcon from "@mui/icons-material/Inventory";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const WelcomePage: React.FC = () => {

  const features = [
    {
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      title: "Order Management",
      description: "Create and track orders seamlessly with real-time updates",
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      title: "Delivery Tracking",
      description: "Monitor deliveries from packaging to final destination",
    },
    {
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      title: "Inventory Control",
      description: "Manage products, pricing, and stock levels efficiently",
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      title: "Analytics & Reports",
      description: "Get insights with comprehensive sales analytics",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0a0a0a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          py: 2.5,
          px: { xs: 2, md: 6 },
          bgcolor: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src="/snack_basket_logo.jpg"
            alt="Snack Basket Logo"
            sx={{
              height: 45,
              width: "auto",
              mr: 2,
              borderRadius: 1.5,
            }}
          />
          <Typography
            variant="h5"
            component="div"
            fontWeight="700"
            sx={{
              color: "white",
              letterSpacing: "-0.5px",
            }}
          >
            Snack Basket
          </Typography>
        </Box>
      </Box>

      {/* Hero Section */}
      <Container
        maxWidth="xl"
        sx={{
          mt: { xs: 4, md: 8 },
          mb: 8,
          flexGrow: 1,
          px: { xs: 2, md: 6 },
        }}
      >
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                animation: "fadeInUp 0.8s ease-out",
                "@keyframes fadeInUp": {
                  from: {
                    opacity: 0,
                    transform: "translateY(30px)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
              }}
            >
              {/* Badge */}
              <Box
                sx={{
                  display: "inline-block",
                  background:
                    "linear-gradient(90deg, #667eea 0%, #f093fb 100%)",
                  borderRadius: "30px",
                  px: 3,
                  py: 1,
                  mb: 3,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  Order Management Platform
                </Typography>
              </Box>

              <Typography
                variant="h1"
                component="h1"
                fontWeight="800"
                sx={{
                  color: "white",
                  mb: 3,
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  lineHeight: 1.1,
                  letterSpacing: "-2px",
                }}
              >
                Streamline Your
                <br />
                Snack Business.
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  fontWeight: 400,
                  color: alpha("#ffffff", 0.7),
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  lineHeight: 1.6,
                  maxWidth: "500px",
                }}
              >
                Complete ERP solution for managing orders, tracking deliveries,
                and monitoring inventory across all Snack Basket operations.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <SignInButton mode="modal">
                  <Button
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 0,
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderColor: "white",
                      color: "white",
                      borderWidth: 2,
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: alpha("#ffffff", 0.1),
                        borderWidth: 2,
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Login
                  </Button>
                </SignInButton>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              {/* Decorative gradient background */}
              <Box
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f093fb 100%)",
                  borderRadius: "30px",
                  transform: "rotate(-6deg)",
                  opacity: 0.3,
                  filter: "blur(40px)",
                }}
              />

              {/* Main tilted card */}
              <Box
                sx={{
                  position: "relative",
                  transform: "rotate(-6deg)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "rotate(-3deg) scale(1.02)",
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: "30px",
                    overflow: "hidden",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
                    border: "3px solid transparent",
                    background:
                      "linear-gradient(#1a1a1a, #1a1a1a) padding-box, linear-gradient(135deg, #667eea, #f093fb) border-box",
                  }}
                >
                  <Box
                    component="img"
                    src="/snack_basket_logo.jpg"
                    alt="Snack Basket Products"
                    sx={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      minWidth: "400px",
                      maxWidth: "600px",
                    }}
                  />
                </Box>

                {/* Decorative corner element */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #f093fb 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4)",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ color: "white", fontWeight: "700" }}
                  >
                    ★
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Feature Cards Section */}
        <Box sx={{ mt: 16 }}>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    bgcolor: "#1a1a1a",
                    borderRadius: 4,
                    transition: "all 0.3s ease",
                    border: "1px solid #2a2a2a",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(102, 126, 234, 0.2)",
                      borderColor: "#667eea",
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", p: 4 }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        p: 2,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #f093fb 100%)",
                        color: "white",
                        mb: 3,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight="700"
                      gutterBottom
                      sx={{ color: "white" }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: alpha("#ffffff", 0.6) }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          px: 2,
          mt: "auto",
          backgroundColor: "#0a0a0a",
          borderTop: "1px solid #2a2a2a",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            align="center"
            sx={{ color: alpha("#ffffff", 0.5) }}
          >
            © {new Date().getFullYear()} Snack Basket Order Management. All
            rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomePage;
