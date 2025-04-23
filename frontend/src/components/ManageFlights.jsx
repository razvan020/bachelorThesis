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
  InputAdornment,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Flight as FlightIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  MeetingRoom as GateIcon,
  Today as DateIcon,
  Schedule as TimeIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/navigation";

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#FFFFFF",
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
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
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

// Helper to format ISO dates
const formatDateOnly = (isoStringOrDate) => {
  if (!isoStringOrDate) return "N/A";
  try {
    const date = new Date(isoStringOrDate);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (e) {
    console.error(e);
    return "Format Error";
  }
};

// Function to get a color based on flight name
const getFlightColor = (flightName) => {
  const colors = [
    "#000000",
    "#000000",
    "#00bcd4",
    "#4caf50",
    "#ff9800",
    "#9c27b0",
    "#673ab7",
    "#2196f3",
    "#009688",
    "#ff5722",
  ];
  // Check if flightName is null or undefined
  if (!flightName) {
    return colors[0]; // Return default color
  }
  const hash = flightName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Add Flight Form Component
const AddFlightForm = ({ onCancel, onFlightAdded }) => {
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [price, setPrice] = useState("");
  const [terminal, setTerminal] = useState("");
  const [gate, setGate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // validation
    const depISO = `${departureDate}T${departureTime || "00:00"}:00`;
    const arrISO = `${arrivalDate}T${arrivalTime || "00:00"}:00`;
    if (new Date(arrISO) <= new Date(depISO)) {
      setError("Arrival must be after departure.");
      setIsLoading(false);
      return;
    }

    const payload = {
      name,
      origin,
      destination,
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      price: parseFloat(price) || 0,
      terminal,
      gate,
    };

    try {
      const res = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = `Error: ${res.status}`;
        try {
          const err = await res.json();
          msg = err.message || err.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const created = await res.json();
      onFlightAdded(created);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add flight");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
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
            background: "#000000",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar sx={{ bgcolor: "white" }}>
            <FlightIcon sx={{ color: "#3f51b5" }} />
          </Avatar>
          <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
            Add New Flight
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

          <Box component="form" onSubmit={handleAddSubmit} noValidate>
            {/* Flight Name */}
            <TextField
              id="name"
              label="Flight Name/Number"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              margin="normal"
              placeholder="e.g., XT101"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FlightIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Origin & Destination */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  id="origin"
                  label="Origin"
                  variant="outlined"
                  fullWidth
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  required
                  disabled={isLoading}
                  margin="normal"
                  placeholder="e.g., OTP"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="destination"
                  label="Destination"
                  variant="outlined"
                  fullWidth
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  disabled={isLoading}
                  margin="normal"
                  placeholder="e.g., LHR"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Departure Date/Time */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  id="departureDate"
                  label="Departure Date"
                  type="date"
                  variant="outlined"
                  fullWidth
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  required
                  disabled={isLoading}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    min: new Date().toISOString().split("T")[0],
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="departureTime"
                  label="Departure Time"
                  type="time"
                  variant="outlined"
                  fullWidth
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  required
                  disabled={isLoading}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TimeIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Arrival Date/Time */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  id="arrivalDate"
                  label="Arrival Date"
                  type="date"
                  variant="outlined"
                  fullWidth
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  required
                  disabled={isLoading}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    min:
                      departureDate || new Date().toISOString().split("T")[0],
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="arrivalTime"
                  label="Arrival Time"
                  type="time"
                  variant="outlined"
                  fullWidth
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  required
                  disabled={isLoading}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TimeIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Terminal & Gate */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  id="terminal"
                  label="Terminal"
                  variant="outlined"
                  fullWidth
                  value={terminal}
                  onChange={(e) => setTerminal(e.target.value)}
                  disabled={isLoading}
                  margin="normal"
                  placeholder="e.g., A"
                  helperText="Optional"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GateIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="gate"
                  label="Gate"
                  variant="outlined"
                  fullWidth
                  value={gate}
                  onChange={(e) => setGate(e.target.value)}
                  disabled={isLoading}
                  margin="normal"
                  placeholder="e.g., 10"
                  helperText="Optional"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GateIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Price */}
            <TextField
              id="price"
              label="Price ($)"
              type="number"
              variant="outlined"
              fullWidth
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={isLoading}
              margin="normal"
              placeholder="e.g., 199.99"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              inputProps={{
                step: "0.01",
                min: "0",
              }}
            />

            {/* Buttons */}
            <Box
              sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={onCancel}
                startIcon={<ArrowBackIcon />}
                sx={{ borderRadius: 2 }}
              >
                Back to List
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isLoading}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <FlightIcon />
                  )
                }
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: "0 4px 14px 0 rgba(63, 81, 181, 0.4)",
                }}
              >
                {isLoading ? "Saving..." : "Save Flight"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default function ManageFlightsPage() {
  const router = useRouter();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function fetchFlights() {
      setLoading(true);
      setError(null);
      setSuccessMessage("");
      try {
        const res = await fetch("/api/flights");
        if (!res.ok) {
          let msg = `HTTP error! status: ${res.status}`;
          try {
            const err = await res.json();
            msg = err.message || err.error || msg;
          } catch {}
          throw new Error(msg);
        }
        const data = await res.json();
        setFlights(data || []);
      } catch (err) {
        setError(`Failed to load flight data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchFlights();
  }, []);

  const handleDeleteClick = (flight) => {
    setFlightToDelete(flight);
    setShowDeleteModal(true);
    setError(null);
    setSuccessMessage("");
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setFlightToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!flightToDelete) return;
    setDeleteLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/flights/${flightToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let msg = `HTTP error! status: ${res.status}`;
        try {
          const err = await res.json();
          msg = err.message || err.error || msg;
        } catch {}
        throw new Error(msg);
      }
      setFlights((cur) => cur.filter((x) => x.id !== flightToDelete.id));
      setSuccessMessage(
        `Flight "${flightToDelete.name}" (ID: ${flightToDelete.id}) deleted successfully!`
      );
      handleCloseDeleteModal();
    } catch (err) {
      console.error(err);
      setError(`Failed to delete: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFlightAdded = (newFlight) => {
    setFlights((cur) => [newFlight, ...cur]);
    setSuccessMessage(`Flight "${newFlight.name}" added successfully!`);
    setIsAdding(false);
    router.refresh();
  };

  // If in add mode, show the add form
  if (isAdding) {
    return (
      <ThemeProvider theme={theme}>
        <AddFlightForm
          onCancel={() => setIsAdding(false)}
          onFlightAdded={handleFlightAdded}
        />
      </ThemeProvider>
    );
  }

  // Otherwise show the list view
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            background: "#000000",
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
                color: "#000000",
                width: 48,
                height: 48,
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FlightIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
              Manage Flights
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setError(null);
              setSuccessMessage("");
              setIsAdding(true);
            }}
            sx={{
              borderRadius: 2,
              boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.4)",
              fontWeight: "bold",
            }}
          >
            Add Flight
          </Button>
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
                Loading Flights...
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
              {flights.length > 0 ? (
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
                            Flight
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }}
                          >
                            Route
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }}
                          >
                            Departure
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }}
                          >
                            Arrival
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }}
                          >
                            Price
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
                        {flights.map((flight) => (
                          <TableRow
                            key={flight.id}
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
                                    bgcolor: getFlightColor(flight.name),
                                    fontWeight: "bold",
                                  }}
                                >
                                  <FlightIcon />
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    {flight.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    ID: {flight.id}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Chip
                                  label={flight.origin}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ fontWeight: "bold" }}
                                />
                                <Typography variant="body2" sx={{ mx: 1 }}>
                                  →
                                </Typography>
                                <Chip
                                  label={flight.destination}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ fontWeight: "bold" }}
                                />
                              </Box>
                              {flight.terminal && flight.gate && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block", mt: 0.5 }}
                                >
                                  Terminal: {flight.terminal}, Gate:{" "}
                                  {flight.gate}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "medium" }}
                              >
                                {formatDateOnly(flight.departureDate)}
                              </Typography>
                              {flight.departureTime && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {flight.departureTime}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "medium" }}
                              >
                                {formatDateOnly(flight.arrivalDate)}
                              </Typography>
                              {flight.arrivalTime && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {flight.arrivalTime}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: "bold",
                                  color: theme.palette.secondary.main,
                                }}
                              >
                                ${flight.price?.toFixed(2) ?? "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                }}
                              >
                                <Tooltip title="Edit Flight" arrow>
                                  <span>
                                    <IconButton
                                      size="small"
                                      sx={{
                                        bgcolor: alpha(
                                          theme.palette.primary.main,
                                          0.1
                                        ),
                                        "&:hover": {
                                          bgcolor: alpha(
                                            theme.palette.primary.main,
                                            0.2
                                          ),
                                        },
                                      }}
                                      onClick={() => {
                                        /* TBD: wire up edit mode here */
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Delete Flight" arrow>
                                  <span>
                                    <IconButton
                                      color="error"
                                      onClick={() => handleDeleteClick(flight)}
                                      disabled={
                                        deleteLoading &&
                                        flightToDelete?.id === flight.id
                                      }
                                      aria-label="Delete Flight"
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
                                      flightToDelete?.id === flight.id ? (
                                        <CircularProgress
                                          size={20}
                                          color="error"
                                        />
                                      ) : (
                                        <DeleteIcon fontSize="small" />
                                      )}
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Box>
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
                    <FlightIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" color="text.primary">
                    No Flights Found
                  </Typography>
                  <Typography variant="body2">
                    No flights found in the database. Use the button above to
                    add one.
                  </Typography>
                </Paper>
              )}
            </Box>
          </Fade>
        )}

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
              <DeleteIcon color="error" />
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
            {error && showDeleteModal && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ mb: 2 }} variant="filled">
                  Error: {error}
                </Alert>
              </Fade>
            )}
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete flight{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: "bold",
                  color: "error.main",
                  display: "inline-block",
                }}
              >
                {flightToDelete?.name} (ID: {flightToDelete?.id})
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
                deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />
              }
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 14px 0 rgba(244, 67, 54, 0.4)",
              }}
            >
              {deleteLoading ? "Deleting..." : "Delete Flight"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
