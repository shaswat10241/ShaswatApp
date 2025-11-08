import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Collapse,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CalculateIcon from "@mui/icons-material/Calculate";
import HistoryIcon from "@mui/icons-material/History";
import DeleteIcon from "@mui/icons-material/Delete";
import { shopDB } from "../../services/database";
import { CostRevisionSummary, SavedBatchCost } from "../../models/BatchCost";

const CostManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<CostRevisionSummary[]>([]);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [productRevisions, setProductRevisions] = useState<SavedBatchCost[]>(
    [],
  );
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<SavedBatchCost | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [revisionToDelete, setRevisionToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    setLoading(true);
    try {
      const data = await shopDB.getCostRevisionSummaries();
      setSummaries(data);
    } catch (error) {
      console.error("Error loading cost summaries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandProduct = async (productName: string) => {
    if (expandedProduct === productName) {
      setExpandedProduct(null);
      setProductRevisions([]);
    } else {
      setExpandedProduct(productName);
      setLoadingRevisions(true);
      try {
        const revisions = await shopDB.getBatchCostsByProduct(productName);
        setProductRevisions(revisions);
      } catch (error) {
        console.error("Error loading revisions:", error);
      } finally {
        setLoadingRevisions(false);
      }
    }
  };

  const handleViewDetails = (revision: SavedBatchCost) => {
    setSelectedRevision(revision);
    setDetailDialogOpen(true);
  };

  const handleDeleteClick = (revisionId: string) => {
    setRevisionToDelete(revisionId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!revisionToDelete) return;

    try {
      await shopDB.deleteBatchCost(revisionToDelete);
      // Reload data
      await loadSummaries();
      if (expandedProduct) {
        const revisions = await shopDB.getBatchCostsByProduct(expandedProduct);
        setProductRevisions(revisions);
      }
    } catch (error) {
      console.error("Error deleting revision:", error);
    } finally {
      setDeleteDialogOpen(false);
      setRevisionToDelete(null);
    }
  };

  const calculateCostChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const totalProducts = summaries.length;
  const totalRevisions = summaries.reduce((sum, s) => sum + s.totalRevisions, 0);
  const avgCostPerUnit =
    summaries.length > 0
      ? summaries.reduce((sum, s) => sum + s.latestPerUnitCost, 0) /
        summaries.length
      : 0;

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
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/dashboard")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <CalculateIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" component="div" fontWeight="bold">
            Cost Manager
          </Typography>
          <Chip
            label="Admin Dashboard"
            size="small"
            color="secondary"
            sx={{ ml: 2 }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Products
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {totalProducts}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  With cost calculations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Revisions
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {totalRevisions}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  All calculations tracked
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Avg Cost Per Unit
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  ₹{avgCostPerUnit.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Across all products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Paper sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Product Cost History
            </Typography>
            <Button
              variant="contained"
              startIcon={<CalculateIcon />}
              onClick={() => navigate("/admin/batch-cost-calculator")}
            >
              New Calculation
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Loading cost data...</Typography>
            </Box>
          ) : summaries.length === 0 ? (
            <Alert severity="info">
              No cost calculations found. Create your first calculation using the
              Batch Cost Calculator.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell width="50px"></TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Product Name
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Revisions
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Latest Cost/Unit
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Latest Total
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Last Updated
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        By
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summaries.map((summary) => (
                    <React.Fragment key={summary.productName}>
                      <TableRow
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleExpandProduct(summary.productName)}
                      >
                        <TableCell>
                          <IconButton size="small">
                            {expandedProduct === summary.productName ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="600">
                            {summary.productName}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={summary.totalRevisions}
                            size="small"
                            color="primary"
                            icon={<HistoryIcon />}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color="primary">
                            ₹{summary.latestPerUnitCost.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography>
                            ₹{summary.latestGrandTotal.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {summary.latestCalculationDate.toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {summary.calculatedBy}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={7}
                        >
                          <Collapse
                            in={expandedProduct === summary.productName}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ p: 3, bgcolor: "#fafafa" }}>
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <HistoryIcon />
                                Revision History
                              </Typography>

                              {loadingRevisions ? (
                                <Box sx={{ textAlign: "center", py: 2 }}>
                                  <CircularProgress size={24} />
                                </Box>
                              ) : (
                                <TableContainer>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                          >
                                            Revision
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                          >
                                            Date
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                          >
                                            Per Unit Cost
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                          >
                                            Grand Total
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                          >
                                            Quantity
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                          >
                                            Change
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                          >
                                            By
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                          >
                                            Actions
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {productRevisions.map((revision, index) => {
                                        const previousRevision =
                                          productRevisions[index + 1];
                                        const costChange = previousRevision
                                          ? calculateCostChange(
                                              revision.perUnitCost,
                                              previousRevision.perUnitCost,
                                            )
                                          : 0;

                                        return (
                                          <TableRow key={revision.id}>
                                            <TableCell>
                                              <Chip
                                                label={`Rev ${revision.revisionNumber}`}
                                                size="small"
                                                color={
                                                  index === 0
                                                    ? "success"
                                                    : "default"
                                                }
                                                variant={
                                                  index === 0
                                                    ? "filled"
                                                    : "outlined"
                                                }
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <Typography variant="body2">
                                                {revision.calculationDate.toLocaleDateString()}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                              <Typography
                                                variant="body2"
                                                fontWeight="600"
                                              >
                                                ₹{revision.perUnitCost.toFixed(2)}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                              <Typography variant="body2">
                                                ₹{revision.grandTotal.toFixed(2)}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                              <Typography variant="body2">
                                                {revision.totalQuantityProduced}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                              {index < productRevisions.length - 1 ? (
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: 0.5,
                                                  }}
                                                >
                                                  {costChange > 0 ? (
                                                    <TrendingUpIcon
                                                      fontSize="small"
                                                      color="error"
                                                    />
                                                  ) : costChange < 0 ? (
                                                    <TrendingDownIcon
                                                      fontSize="small"
                                                      color="success"
                                                    />
                                                  ) : null}
                                                  <Typography
                                                    variant="caption"
                                                    color={
                                                      costChange > 0
                                                        ? "error.main"
                                                        : costChange < 0
                                                          ? "success.main"
                                                          : "text.secondary"
                                                    }
                                                    fontWeight="600"
                                                  >
                                                    {costChange > 0 ? "+" : ""}
                                                    {costChange.toFixed(1)}%
                                                  </Typography>
                                                </Box>
                                              ) : (
                                                <Typography
                                                  variant="caption"
                                                  color="text.secondary"
                                                >
                                                  -
                                                </Typography>
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              <Typography variant="caption">
                                                {revision.calculatedBy}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  gap: 0.5,
                                                  justifyContent: "center",
                                                }}
                                              >
                                                <IconButton
                                                  size="small"
                                                  color="primary"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewDetails(revision);
                                                  }}
                                                >
                                                  <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                  size="small"
                                                  color="error"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(
                                                      revision.id || "",
                                                    );
                                                  }}
                                                >
                                                  <DeleteIcon fontSize="small" />
                                                </IconButton>
                                              </Box>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRevision && (
          <>
            <DialogTitle>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {selectedRevision.productName} - Revision{" "}
                  {selectedRevision.revisionNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Calculated on{" "}
                  {selectedRevision.calculationDate.toLocaleDateString()} by{" "}
                  {selectedRevision.calculatedBy}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Alert severity="info">
                    <Typography variant="h6" fontWeight="bold">
                      ₹{selectedRevision.perUnitCost.toFixed(2)}
                    </Typography>
                    <Typography variant="caption">Cost Per Unit</Typography>
                  </Alert>
                </Grid>
                <Grid item xs={6}>
                  <Alert severity="success">
                    <Typography variant="h6" fontWeight="bold">
                      ₹{selectedRevision.grandTotal.toFixed(2)}
                    </Typography>
                    <Typography variant="caption">Total Cost</Typography>
                  </Alert>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Cost Breakdown
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Raw Materials</TableCell>
                      <TableCell align="right">
                        ₹{selectedRevision.totalRawMaterialCost.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {(
                          (selectedRevision.totalRawMaterialCost /
                            selectedRevision.grandTotal) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Labour</TableCell>
                      <TableCell align="right">
                        ₹{selectedRevision.totalLabourCost.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {(
                          (selectedRevision.totalLabourCost /
                            selectedRevision.grandTotal) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Electricity</TableCell>
                      <TableCell align="right">
                        ₹{selectedRevision.totalElectricityCost.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {(
                          (selectedRevision.totalElectricityCost /
                            selectedRevision.grandTotal) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Packaging</TableCell>
                      <TableCell align="right">
                        ₹{selectedRevision.totalPackagingCost.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {(
                          (selectedRevision.totalPackagingCost /
                            selectedRevision.grandTotal) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Transportation</TableCell>
                      <TableCell align="right">
                        ₹{selectedRevision.totalTransportationCost.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {(
                          (selectedRevision.totalTransportationCost /
                            selectedRevision.grandTotal) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Marketing</TableCell>
                      <TableCell align="right">
                        ₹{selectedRevision.totalMarketingCost.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {(
                          (selectedRevision.totalMarketingCost /
                            selectedRevision.grandTotal) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Other Expenses</TableCell>
                      <TableCell align="right">
                        ₹{selectedRevision.totalOtherExpenses.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {(
                          (selectedRevision.totalOtherExpenses /
                            selectedRevision.grandTotal) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell>
                        <strong>Grand Total</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          ₹{selectedRevision.grandTotal.toFixed(2)}
                        </strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>100%</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedRevision.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Notes:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRevision.notes}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this cost calculation revision? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CostManagerPage;
