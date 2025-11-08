import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useUser } from "@clerk/clerk-react";
import { useTimesheetStore } from "../services/timesheetStore";
import { TimesheetEntry } from "../models/Timesheet";

const TimesheetPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const {
    currentMonthEntries,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    loadEmployeeEntriesForMonth,
  } = useTimesheetStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [workDescription, setWorkDescription] = useState("");
  const [hoursWorked, setHoursWorked] = useState<number>(8);
  const [selectedEntry, setSelectedEntry] = useState<TimesheetEntry | null>(
    null,
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const employeeId = user?.id || "";
  const employeeName = user?.fullName || user?.firstName || "Employee";

  useEffect(() => {
    if (employeeId) {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      loadEmployeeEntriesForMonth(employeeId, month, year);
    }
  }, [employeeId, currentDate, loadEmployeeEntriesForMonth]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEntryForDay = (date: Date | null): TimesheetEntry | undefined => {
    if (!date) return undefined;
    return currentMonthEntries.find(
      (entry) =>
        entry.date.getFullYear() === date.getFullYear() &&
        entry.date.getMonth() === date.getMonth() &&
        entry.date.getDate() === date.getDate(),
    );
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const handleDayClick = async (date: Date) => {
    const entry = getEntryForDay(date);
    setSelectedDate(date);

    if (entry) {
      setIsEditMode(true);
      setSelectedEntry(entry);
      setWorkDescription(entry.workDescription);
      setHoursWorked(entry.hoursWorked);
    } else {
      setIsEditMode(false);
      setSelectedEntry(null);
      setWorkDescription("");
      setHoursWorked(8);
    }

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDate(null);
    setSelectedEntry(null);
    setWorkDescription("");
    setHoursWorked(8);
    setIsEditMode(false);
  };

  const handleSaveEntry = async () => {
    if (!selectedDate || !workDescription.trim() || hoursWorked <= 0) {
      setSnackbarMessage("Please fill in all fields with valid data");
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEditMode && selectedEntry) {
        await updateEntry({
          ...selectedEntry,
          workDescription,
          hoursWorked,
          updatedAt: new Date(),
        });
        setSnackbarMessage("Timesheet entry updated successfully!");
      } else {
        await addEntry(
          employeeId,
          employeeName,
          selectedDate,
          workDescription,
          hoursWorked,
        );
        setSnackbarMessage("Timesheet entry added successfully!");
      }
      setSnackbarOpen(true);
      handleCloseDialog();
    } catch (error) {
      setSnackbarMessage("Failed to save entry. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteEntry = async () => {
    if (selectedEntry?.id) {
      try {
        await deleteEntry(selectedEntry.id);
        setSnackbarMessage("Timesheet entry deleted successfully!");
        setSnackbarOpen(true);
        handleCloseDialog();
      } catch (error) {
        setSnackbarMessage("Failed to delete entry. Please try again.");
        setSnackbarOpen(true);
      }
    }
  };

  const getTotalHoursForMonth = () => {
    return currentMonthEntries.reduce(
      (total, entry) => total + entry.hoursWorked,
      0,
    );
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  const totalHours = getTotalHoursForMonth();

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isFutureDate = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

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
          <AccessTimeIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" component="div" fontWeight="bold">
            My Timesheet
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {/* Summary Card */}
        <Card
          sx={{
            mb: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: 600 }}
                >
                  {employeeName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Employee Timesheet
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: { md: "right" } }}>
                <Typography
                  variant="h4"
                  sx={{ color: "white", fontWeight: 700 }}
                >
                  {totalHours} hrs
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Total Hours This Month
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Paper sx={{ p: 3 }}>
          {/* Month Navigation */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <IconButton onClick={handlePreviousMonth} color="primary">
              <ArrowBackIosIcon />
            </IconButton>
            <Typography variant="h5" fontWeight="bold">
              {monthName} {year}
            </Typography>
            <IconButton onClick={handleNextMonth} color="primary">
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>

          {/* Day Headers */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Grid item xs={12 / 7} key={day}>
                <Typography
                  variant="subtitle2"
                  align="center"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar Days */}
          <Grid container spacing={1}>
            {days.map((date, index) => {
              const entry = getEntryForDay(date);
              const hasEntry = !!entry;
              const today = isToday(date);
              const future = isFutureDate(date);

              return (
                <Grid item xs={12 / 7} key={index}>
                  <Card
                    sx={{
                      height: 100,
                      cursor: date && !future ? "pointer" : "default",
                      border: today ? "2px solid #667eea" : "1px solid #e0e0e0",
                      bgcolor: date
                        ? hasEntry
                          ? "#e8f5e9"
                          : future
                            ? "#f5f5f5"
                            : "white"
                        : "transparent",
                      boxShadow: hasEntry
                        ? "0 2px 8px rgba(0,0,0,0.1)"
                        : "none",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow:
                          date && !future
                            ? "0 4px 12px rgba(0,0,0,0.15)"
                            : "none",
                        transform:
                          date && !future ? "translateY(-2px)" : "none",
                      },
                      opacity: date ? (future ? 0.5 : 1) : 0,
                    }}
                    onClick={() => date && !future && handleDayClick(date)}
                  >
                    <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                      {date && (
                        <>
                          <Typography
                            variant="body2"
                            fontWeight={today ? "bold" : "normal"}
                            sx={{ mb: 0.5 }}
                          >
                            {date.getDate()}
                          </Typography>
                          {hasEntry && entry && (
                            <>
                              <Chip
                                label={`${entry.hoursWorked}h`}
                                size="small"
                                color="success"
                                sx={{ fontSize: "0.7rem", height: 20 }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  mt: 0.5,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {entry.workDescription}
                              </Typography>
                            </>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Container>

      {/* Entry Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? "Edit" : "Add"} Timesheet Entry
          {selectedDate && (
            <Typography variant="body2" color="text.secondary">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Work Description"
              multiline
              rows={4}
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder="Describe what you worked on..."
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Hours Worked"
              type="number"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(Number(e.target.value))}
              inputProps={{ min: 0.5, max: 24, step: 0.5 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          {isEditMode && (
            <Button
              onClick={handleDeleteEntry}
              color="error"
              startIcon={<DeleteIcon />}
              sx={{ mr: "auto" }}
            >
              Delete
            </Button>
          )}
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveEntry}
            variant="contained"
            startIcon={isEditMode ? <EditIcon /> : <AddIcon />}
          >
            {isEditMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TimesheetPage;
