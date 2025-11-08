import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Collapse,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useTimesheetStore } from "../../services/timesheetStore";
import { MonthlyTimesheetSummary } from "../../models/Timesheet";

const AdminTimesheetPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    allEmployeeEntries,
    isLoading,
    loadAllEntriesForMonth,
    getMonthlyTimesheetSummaries,
  } = useTimesheetStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<MonthlyTimesheetSummary[]>([]);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  useEffect(() => {
    loadAllEntriesForMonth(month, year);
  }, [month, year, loadAllEntriesForMonth]);

  useEffect(() => {
    const monthlySummaries = getMonthlyTimesheetSummaries(month, year);
    setSummaries(monthlySummaries);
  }, [allEmployeeEntries, month, year, getMonthlyTimesheetSummaries]);

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

  const handleToggleEmployee = (employeeId: string) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const totalCompanyHours = summaries.reduce(
    (sum, summary) => sum + summary.totalHours,
    0,
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "#1976d2",
      "#d32f2f",
      "#388e3c",
      "#f57c00",
      "#7b1fa2",
      "#0097a7",
      "#c2185b",
      "#5d4037",
    ];
    const index = name.length % colors.length;
    return colors[index];
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
            Employee Timesheets
          </Typography>
          <Chip
            label="Admin View"
            size="small"
            color="secondary"
            sx={{ ml: 2 }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: 600 }}
                >
                  Total Company Hours
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ color: "white", fontWeight: 700 }}
                >
                  {totalCompanyHours} hrs
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {monthName} {year}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: 600 }}
                >
                  Active Employees
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ color: "white", fontWeight: 700 }}
                >
                  {summaries.length}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Logged hours this month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Month Navigation */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <IconButton onClick={handlePreviousMonth} color="primary">
              <ArrowBackIosIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">
                {monthName} {year}
              </Typography>
            </Box>
            <IconButton onClick={handleNextMonth} color="primary">
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* Employee Timesheets */}
        {isLoading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography>Loading timesheets...</Typography>
          </Box>
        ) : summaries.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No timesheet entries found for {monthName} {year}
          </Alert>
        ) : (
          <Paper sx={{ overflow: "hidden" }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell width="50px"></TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Employee
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Days Logged
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Total Hours
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Avg Hours/Day
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summaries.map((summary) => (
                    <React.Fragment key={summary.employeeId}>
                      <TableRow
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleToggleEmployee(summary.employeeId)}
                      >
                        <TableCell>
                          <IconButton size="small">
                            {expandedEmployee === summary.employeeId ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: getAvatarColor(summary.employeeName),
                                width: 36,
                                height: 36,
                              }}
                            >
                              {getInitials(summary.employeeName)}
                            </Avatar>
                            <Typography fontWeight="medium">
                              {summary.employeeName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={summary.entries.length}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight="bold" color="primary">
                            {summary.totalHours} hrs
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography>
                            {(
                              summary.totalHours / summary.entries.length
                            ).toFixed(1)}{" "}
                            hrs
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={5}
                        >
                          <Collapse
                            in={expandedEmployee === summary.employeeId}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ p: 3, bgcolor: "#fafafa" }}>
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                  mb: 2,
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <PersonIcon sx={{ mr: 1 }} />
                                Detailed Entries
                              </Typography>
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>
                                        <Typography
                                          variant="caption"
                                          fontWeight="bold"
                                        >
                                          Date
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography
                                          variant="caption"
                                          fontWeight="bold"
                                        >
                                          Work Description
                                        </Typography>
                                      </TableCell>
                                      <TableCell align="right">
                                        <Typography
                                          variant="caption"
                                          fontWeight="bold"
                                        >
                                          Hours
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {summary.entries.map((entry) => (
                                      <TableRow key={entry.id}>
                                        <TableCell>
                                          <Chip
                                            label={entry.date.toLocaleDateString(
                                              "en-US",
                                              {
                                                month: "short",
                                                day: "numeric",
                                              },
                                            )}
                                            size="small"
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {entry.workDescription}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Chip
                                            label={`${entry.hoursWorked}h`}
                                            size="small"
                                            color="success"
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AdminTimesheetPage;
