"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  Avatar,
  useTheme,
  alpha,
  Zoom,
  Fade,
} from "@mui/material";
import {
  Delete,
  PersonAdd,
  People,
  PersonAddAlt1,
  AdminPanelSettings,
  Security,
  Badge,
  Email as EmailIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
      light: "#000000",
      dark: "#000000",
    },
    secondary: {
      main: "#000000",
      light: "#000000",
      dark: "#000000",
    },
    background: {
      default: "#f5f7fa",
    },
    error: {
      main: "#f44336",
    },
    success: {
      main: "#4caf50",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
    h5: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        },
        elevation2: {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        },
        elevation3: {
          boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 8px rgb(255, 255, 255)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: "#000000",
        },
      },
    },
  },
});

const AddUserForm = ({ onUserAdded }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const userData = { username, email, password, firstname, lastname };
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || `Error: ${response.status}`);
      // reset form
      setUsername("");
      setEmail("");
      setPassword("");
      setFirstname("");
      setLastname("");
      onUserAdded(data);
    } catch (err) {
      setError(err.message || "Failed to add user.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        mt: 4,
        p: 0,
        borderRadius: 2,
        overflow: "hidden",
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          background: "black",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Avatar sx={{ bgcolor: "white" }}>
          <PersonAddAlt1 sx={{ color: "black" }} />
        </Avatar>
        <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
          Add New User
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mb: 2 }}
              variant="filled"
            >
              {error}
            </Alert>
          </Fade>
        )}

        <Box component="form" onSubmit={handleAddUserSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                id="addFirstName"
                label="First Name"
                variant="outlined"
                fullWidth
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
                disabled={isLoading}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <Badge sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                id="addLastName"
                label="Last Name"
                variant="outlined"
                fullWidth
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
                disabled={isLoading}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <Badge sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                id="addUsername"
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <People sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                id="addEmail"
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="addPassword"
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                inputProps={{ minLength: 6 }}
                disabled={isLoading}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <Security sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
                helperText="Password must be at least 6 characters long"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              disabled={isLoading}
              startIcon={
                isLoading ? <CircularProgress size={20} /> : <PersonAddAlt1 />
              }
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.4)",
              }}
            >
              {isLoading ? "Adding..." : "Add User"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Function to get a random pastel color based on string
  const getAvatarColor = (str) => {
    const colors = [
      "#3f51b5",
      "#f50057",
      "#00bcd4",
      "#4caf50",
      "#ff9800",
      "#9c27b0",
      "#673ab7",
      "#2196f3",
      "#009688",
      "#ff5722",
    ];
    // Check if str is null or undefined
    if (!str) {
      return colors[0]; // Return default color
    }
    const hash = str
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Function to get initials from name
  const getInitials = (firstname, lastname, username) => {
    if (firstname && lastname) {
      return `${firstname[0]}${lastname[0]}`.toUpperCase();
    } else if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include", // ← include session cookie
      });
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setUsers(data || []);
    } catch (err) {
      setError(`Failed to load user data: ${err.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
    setDeleteError(null);
    setSuccessMessage("");
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "DELETE",
        credentials: "include", // ← include session cookie
      });
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          if (
            response.headers.get("content-type")?.includes("application/json")
          ) {
            const errData = await response.json();
            errorMsg = errData.message || errData.error || errorMsg;
          } else {
            errorMsg = `Delete failed: ${
              response.statusText || response.status
            }`;
          }
        } catch {}
        throw new Error(errorMsg);
      }
      setUsers((cur) => cur.filter((u) => u.id !== userToDelete.id));
      setSuccessMessage(
        `User "${userToDelete.username}" deleted successfully!`
      );
      handleCloseDeleteModal();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete user.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUserAdded = (newUser) => {
    setSuccessMessage(`User "${newUser.username}" added successfully!`);
    fetchUsers();
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            background: "black",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: "white",
                color: "black",
                width: 48,
                height: 48,
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              }}
            >
              <AdminPanelSettings fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
              Manage Users
            </Typography>
          </Box>
          <Chip
            label={`${users.length} Users`}
            color="secondary"
            sx={{
              fontWeight: "bold",
              fontSize: "0.9rem",
              bgcolor: "rgb(255, 255, 255)",
              color: "black",
              "& .MuiChip-label": { px: 2 },
            }}
          />
        </Paper>

        {loading && (
          <Fade in={loading}>
            <Box
              sx={{
                textAlign: "center",
                my: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 2, color: "text.secondary" }}>
                Loading Users...
              </Typography>
            </Box>
          </Fade>
        )}

        {!loading && error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mb: 3 }}
              variant="filled"
              icon={<span>⚠️</span>}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Error
              </Typography>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          </Fade>
        )}

        {successMessage && (
          <Fade in={!!successMessage}>
            <Alert
              severity="success"
              onClose={() => setSuccessMessage("")}
              sx={{ mb: 3 }}
              variant="filled"
              icon={<span>✅</span>}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Success
              </Typography>
              <Typography variant="body2">{successMessage}</Typography>
            </Alert>
          </Fade>
        )}

        {!loading && !error && (
          <Fade in={!loading && !error}>
            <Box sx={{ mt: 4 }}>
              {users.length > 0 ? (
                <Paper
                  elevation={3}
                  sx={{ borderRadius: 2, overflow: "hidden" }}
                >
                  <TableContainer sx={{ maxHeight: "calc(100vh - 350px)" }}>
                    <Table stickyHeader sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }}
                          >
                            User
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }}
                          >
                            Email
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }}
                          >
                            Name
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }}
                          >
                            Roles
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: "bold",
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }}
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow
                            key={user.id}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.04
                                ),
                                transition: "background-color 0.2s ease",
                              },
                              transition: "background-color 0.2s ease",
                            }}
                          >
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: getAvatarColor(user.username),
                                    fontWeight: "bold",
                                  }}
                                >
                                  {getInitials(
                                    user.firstname,
                                    user.lastname,
                                    user.username
                                  )}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    {user.username}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    ID: {user.id}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {user.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {user.firstname && user.lastname
                                  ? `${user.firstname} ${user.lastname}`
                                  : "-"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {user.roles?.length > 0 ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {user.roles.map((role) => (
                                    <Chip
                                      key={role}
                                      label={role.replace("ROLE_", "")}
                                      size="small"
                                      color={
                                        role.includes("ADMIN")
                                          ? "secondary"
                                          : "primary"
                                      }
                                      variant={
                                        role.includes("ADMIN")
                                          ? "filled"
                                          : "outlined"
                                      }
                                      sx={{
                                        fontWeight: role.includes("ADMIN")
                                          ? "bold"
                                          : "normal",
                                        fontSize: "0.7rem",
                                      }}
                                    />
                                  ))}
                                </Box>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  N/A
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Delete User" arrow>
                                <span>
                                  <IconButton
                                    color="error"
                                    onClick={() => handleDeleteClick(user)}
                                    disabled={
                                      deleteLoading &&
                                      userToDelete?.id === user.id
                                    }
                                    aria-label="Delete User"
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(
                                        theme.palette.error.main,
                                        0.1
                                      ),
                                      "&:hover": {
                                        bgcolor: alpha(
                                          theme.palette.error.main,
                                          0.2
                                        ),
                                      },
                                    }}
                                  >
                                    {deleteLoading &&
                                    userToDelete?.id === user.id ? (
                                      <CircularProgress
                                        size={20}
                                        color="error"
                                      />
                                    ) : (
                                      <Delete fontSize="small" />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              ) : (
                <Paper
                  elevation={2}
                  sx={{
                    textAlign: "center",
                    color: "text.secondary",
                    p: 5,
                    borderRadius: 2,
                    border: "1px dashed rgba(0, 0, 0, 0.12)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <People fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" color="text.primary">
                    No Users Found
                  </Typography>
                  <Typography variant="body2">
                    No users found in the database. Use the form below to add
                    one.
                  </Typography>
                </Paper>
              )}
            </Box>
          </Fade>
        )}

        {!loading && <AddUserForm onUserAdded={handleUserAdded} />}

        <Dialog
          open={showDeleteModal}
          onClose={handleCloseDeleteModal}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          <DialogTitle
            id="delete-dialog-title"
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.05),
              pb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Delete color="error" />
              <Typography
                variant="h6"
                component="span"
                sx={{ fontWeight: "bold" }}
              >
                Confirm Deletion
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {deleteError && (
              <Fade in={!!deleteError}>
                <Alert severity="error" sx={{ mb: 2 }} variant="filled">
                  Error: {deleteError}
                </Alert>
              </Fade>
            )}
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete user{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: "bold",
                  color: "error.main",
                  display: "inline-block",
                }}
              >
                {userToDelete?.username} (ID: {userToDelete?.id})
              </Box>
              ? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleCloseDeleteModal}
              disabled={deleteLoading}
              color="inherit"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              color="error"
              variant="contained"
              startIcon={
                deleteLoading ? <CircularProgress size={20} /> : <Delete />
              }
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 14px 0 rgba(244, 67, 54, 0.4)",
              }}
            >
              {deleteLoading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
