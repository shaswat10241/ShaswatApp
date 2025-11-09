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
  Select,
  MenuItem,
  FormControl,
  Switch,
  Avatar,
  Card,
  CardContent,
  Grid,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useUserStore, User } from "../../services/userStore";

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, fetchAllUsers, updateUser, deleteUser, addUser, isAdmin } =
    useUserStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({
    email: "",
    name: "",
    role: "employee" as "admin" | "employee",
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/dashboard");
      return;
    }
    fetchAllUsers();
  }, [isAdmin, navigate, fetchAllUsers]);

  const handleRoleChange = async (
    user: User,
    newRole: "admin" | "employee",
  ) => {
    try {
      const updatedUser = { ...user, role: newRole, updatedAt: new Date() };
      await updateUser(updatedUser);
      await fetchAllUsers();
      setSnackbarMessage(
        `User role updated to ${newRole.toUpperCase()} successfully!`,
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating user role:", error);
      setSnackbarMessage("Failed to update user role");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const updatedUser = {
        ...user,
        isActive: !user.isActive,
        updatedAt: new Date(),
      };
      await updateUser(updatedUser);
      await fetchAllUsers();
      setSnackbarMessage(
        `User ${updatedUser.isActive ? "activated" : "deactivated"} successfully!`,
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating user status:", error);
      setSnackbarMessage("Failed to update user status");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete?.id) return;

    try {
      await deleteUser(userToDelete.id);
      await fetchAllUsers();
      setSnackbarMessage("User deleted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbarMessage("Failed to delete user");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAddUser = async () => {
    if (!newUserData.email || !newUserData.name) {
      setSnackbarMessage("Please fill in all required fields");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      await addUser({
        email: newUserData.email,
        name: newUserData.name,
        role: newUserData.role,
        isActive: true,
      });
      await fetchAllUsers();
      setSnackbarMessage("User added successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setAddUserDialogOpen(false);
      setNewUserData({ email: "", name: "", role: "employee" });
    } catch (error) {
      console.error("Error adding user:", error);
      setSnackbarMessage("Failed to add user");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const employeeCount = users.filter((u) => u.role === "employee").length;
  const activeCount = users.filter((u) => u.isActive).length;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (role: string) => {
    return role === "admin" ? "#d32f2f" : "#1976d2";
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
          <PeopleIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" component="div" fontWeight="bold">
            User Management
          </Typography>
          <Chip label="Admin Only" size="small" color="error" sx={{ ml: 2 }} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Admins
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {adminCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Employees
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {employeeCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Users
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {activeCount}
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
              User List
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                size="small"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddUserDialogOpen(true)}
              >
                Add User
              </Button>
            </Box>
          </Box>

          {filteredUsers.length === 0 ? (
            <Alert severity="info">No users found.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        User
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Email
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Role
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Status
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Joined
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: getAvatarColor(user.role),
                              width: 40,
                              height: 40,
                            }}
                          >
                            {getInitials(user.name)}
                          </Avatar>
                          <Typography fontWeight="600">{user.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(
                                user,
                                e.target.value as "admin" | "employee",
                              )
                            }
                            sx={{
                              bgcolor:
                                user.role === "admin" ? "#ffebee" : "#e3f2fd",
                            }}
                          >
                            <MenuItem value="employee">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <PersonIcon fontSize="small" />
                                Employee
                              </Box>
                            </MenuItem>
                            <MenuItem value="admin">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <AdminPanelSettingsIcon fontSize="small" />
                                Admin
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <Switch
                            checked={user.isActive}
                            onChange={() => handleToggleActive(user)}
                            color="success"
                          />
                          <Typography variant="body2">
                            {user.isActive ? "Active" : "Inactive"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {user.createdAt.toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Add User Dialog */}
      <Dialog
        open={addUserDialogOpen}
        onClose={() => setAddUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Name *"
              value={newUserData.name}
              onChange={(e) =>
                setNewUserData({ ...newUserData, name: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Email *"
              type="email"
              value={newUserData.email}
              onChange={(e) =>
                setNewUserData({ ...newUserData, email: e.target.value })
              }
            />
            <FormControl fullWidth>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Role
              </Typography>
              <Select
                value={newUserData.role}
                onChange={(e) =>
                  setNewUserData({
                    ...newUserData,
                    role: e.target.value as "admin" | "employee",
                  })
                }
              >
                <MenuItem value="employee">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    Employee
                  </Box>
                </MenuItem>
                <MenuItem value="admin">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AdminPanelSettingsIcon fontSize="small" />
                    Admin
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user{" "}
            <strong>{userToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagementPage;
