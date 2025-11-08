import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  Divider,
  Rating,
  Slider,
  MenuItem,
  Select,
  InputLabel,
  Checkbox,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { shopDB } from "../../services/database";

interface SurveyFormData {
  shopId: string;
  respondentName: string;
  respondentContact: string;
  respondentRole: string;
  productQualityRating: number;
  serviceRating: number;
  deliveryRating: number;
  priceRating: number;
  recommendationLikelihood: number;
  purchaseFrequency: string;
  feedback: string;
  concerns: string[];
  productSuggestions: string;
}

const CONCERNS = [
  { value: "QUALITY", label: "Product Quality" },
  { value: "PRICE", label: "Pricing" },
  { value: "DELIVERY", label: "Delivery Time" },
  { value: "SERVICE", label: "Customer Service" },
  { value: "VARIETY", label: "Product Variety" },
  { value: "OTHER", label: "Other Concerns" },
];

const FREQUENCY_OPTIONS = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
  { value: "OCCASIONALLY", label: "Occasionally" },
  { value: "FIRST_TIME", label: "First Time Purchase" },
];

const SurveyForm: React.FC<{ shopId?: string }> = ({ shopId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SurveyFormData>({
    defaultValues: {
      shopId: shopId || "",
      respondentName: "",
      respondentContact: "",
      respondentRole: "CUSTOMER",
      productQualityRating: 3,
      serviceRating: 3,
      deliveryRating: 3,
      priceRating: 3,
      recommendationLikelihood: 7,
      purchaseFrequency: "",
      feedback: "",
      concerns: [],
      productSuggestions: "",
    },
  });

  const onSubmit = async (data: SurveyFormData) => {
    try {
      setLoading(true);

      const surveyData = {
        id: Date.now().toString(),
        shopId: data.shopId || undefined,
        respondentName: data.respondentName,
        respondentContact: data.respondentContact,
        respondentRole: data.respondentRole,
        productQualityRating: data.productQualityRating,
        serviceRating: data.serviceRating,
        deliveryRating: data.deliveryRating,
        priceRating: data.priceRating,
        recommendationLikelihood: data.recommendationLikelihood,
        purchaseFrequency: data.purchaseFrequency,
        feedback: data.feedback,
        concerns: data.concerns,
        productSuggestions: data.productSuggestions,
        createdAt: new Date(),
      };

      await shopDB.addSurvey(surveyData);

      console.log("Survey data submitted:", surveyData);

      // Redirect to dashboard
      navigate("/");
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("Error submitting survey. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const concerns = watch("concerns");

  const handleConcernToggle = (value: string) => {
    const currentConcerns = [...concerns];
    const currentIndex = currentConcerns.indexOf(value);

    if (currentIndex === -1) {
      currentConcerns.push(value);
    } else {
      currentConcerns.splice(currentIndex, 1);
    }

    setValue("concerns", currentConcerns);
  };

  return (
    <Paper className="form-container" sx={{ p: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Customer Feedback Survey
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Your feedback helps us improve our products and services
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          {/* Respondent Information */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Your Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="respondentName"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Your Name"
                      fullWidth
                      error={!!errors.respondentName}
                      helperText={errors.respondentName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="respondentContact"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Contact Number (Optional)"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="respondentRole"
                  control={control}
                  render={({ field }) => (
                    <FormControl component="fieldset">
                      <FormLabel component="legend">You are a:</FormLabel>
                      <RadioGroup row {...field}>
                        <FormControlLabel
                          value="CUSTOMER"
                          control={<Radio />}
                          label="Customer"
                        />
                        <FormControlLabel
                          value="SHOP_OWNER"
                          control={<Radio />}
                          label="Shop Owner"
                        />
                        <FormControlLabel
                          value="DISTRIBUTOR"
                          control={<Radio />}
                          label="Distributor"
                        />
                        <FormControlLabel
                          value="OTHER"
                          control={<Radio />}
                          label="Other"
                        />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Product & Service Ratings */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Ratings
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Product Quality
                </Typography>
                <Controller
                  name="productQualityRating"
                  control={control}
                  render={({ field }) => (
                    <Rating
                      {...field}
                      precision={0.5}
                      onChange={(_, value) => field.onChange(value)}
                      size="large"
                    />
                  )}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Customer Service
                </Typography>
                <Controller
                  name="serviceRating"
                  control={control}
                  render={({ field }) => (
                    <Rating
                      {...field}
                      precision={0.5}
                      onChange={(_, value) => field.onChange(value)}
                      size="large"
                    />
                  )}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Delivery Experience
                </Typography>
                <Controller
                  name="deliveryRating"
                  control={control}
                  render={({ field }) => (
                    <Rating
                      {...field}
                      precision={0.5}
                      onChange={(_, value) => field.onChange(value)}
                      size="large"
                    />
                  )}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Price Satisfaction
                </Typography>
                <Controller
                  name="priceRating"
                  control={control}
                  render={({ field }) => (
                    <Rating
                      {...field}
                      precision={0.5}
                      onChange={(_, value) => field.onChange(value)}
                      size="large"
                    />
                  )}
                />
              </Box>
            </Stack>
          </Box>

          {/* Recommendation and Purchase Frequency */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  How likely are you to recommend us to others? (1-10)
                </Typography>
                <Controller
                  name="recommendationLikelihood"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={value}
                        onChange={(_, newValue) => onChange(newValue)}
                        step={1}
                        marks
                        min={1}
                        max={10}
                        valueLabelDisplay="auto"
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Not likely
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Very likely
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Box>

              <Controller
                name="purchaseFrequency"
                control={control}
                rules={{ required: "Please select purchase frequency" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.purchaseFrequency}>
                    <InputLabel id="frequency-label">
                      How often do you purchase our products?
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="frequency-label"
                      label="How often do you purchase our products?"
                    >
                      {FREQUENCY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.purchaseFrequency && (
                      <FormHelperText>
                        {errors.purchaseFrequency.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Stack>
          </Box>

          {/* Concerns and Feedback */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Concerns & Feedback
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Do you have any concerns about our products or services?
                </Typography>
                <Grid container spacing={2}>
                  {CONCERNS.map((concern) => (
                    <Grid item xs={6} md={4} key={concern.value}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={concerns.includes(concern.value)}
                            onChange={() => handleConcernToggle(concern.value)}
                          />
                        }
                        label={concern.label}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Controller
                name="feedback"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Additional Feedback"
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Please share any additional feedback or suggestions"
                  />
                )}
              />

              <Controller
                name="productSuggestions"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Product Suggestions"
                    multiline
                    rows={2}
                    fullWidth
                    placeholder="Any products you'd like us to offer?"
                  />
                )}
              />
            </Stack>
          </Box>

          {/* Submit Button */}
          <Box className="button-container">
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate("/")}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={<AssignmentTurnedInIcon />}
              sx={{ minWidth: 150 }}
            >
              {loading ? "Submitting..." : "Submit Survey"}
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};

export default SurveyForm;
