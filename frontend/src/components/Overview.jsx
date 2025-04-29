"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Container,
  LinearProgress,
  Stack,
  useTheme as useMuiTheme,
  alpha,
  CssBaseline,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import FlightIcon from "@mui/icons-material/Flight";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { ThemeProvider, useAppTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

// Function to get styles based on theme mode
const getStyles = (mode, theme) => {
  const isLight = mode === "light";

  return {
    centeredContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "80vh",
      background: isLight
        ? "linear-gradient(145deg, #f8f9fa, #e9ecef)"
        : "linear-gradient(145deg, #121212, #1e1e1e)",
      transition: "background 0.3s ease",
    },
    headerContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 4,
      p: 2,
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, rgba(255,255,255,0.6), rgba(240,240,240,0.4))"
        : "linear-gradient(145deg, rgba(40,40,40,0.6), rgba(30,30,30,0.4))",
      backdropFilter: "blur(10px)",
      boxShadow: isLight
        ? "5px 5px 15px rgba(0,0,0,0.05), -5px -5px 15px rgba(255,255,255,0.6)"
        : "5px 5px 15px rgba(0,0,0,0.2), -5px -5px 15px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
    },
    loadingContainer: {
      position: "relative",
      width: 80,
      height: 80,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      background: isLight
        ? "linear-gradient(145deg, #ffffff, #f0f0f0)"
        : "linear-gradient(145deg, #2d2d2d, #252525)",
      boxShadow: isLight
        ? "10px 10px 20px rgba(0,0,0,0.1), -10px -10px 20px rgba(255,255,255,0.8)"
        : "10px 10px 20px rgba(0,0,0,0.3), -10px -10px 20px rgba(255,255,255,0.05)",
    },
    loadingSpinner: {
      color: isLight ? "primary.main" : "primary.light",
      position: "relative",
      zIndex: 2,
    },
    errorAlert: {
      borderRadius: 3,
      backdropFilter: "blur(10px)",
      background:
        "linear-gradient(145deg, rgba(244,67,54,0.9), rgba(229,57,53,0.7))",
      boxShadow:
        "7px 7px 14px rgba(0,0,0,0.1), -7px -7px 14px rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.2)",
    },
    alertButton: {
      borderRadius: "50%",
      background: "rgba(255,255,255,0.2)",
      backdropFilter: "blur(5px)",
      boxShadow:
        "3px 3px 6px rgba(0,0,0,0.1), -3px -3px 6px rgba(255,255,255,0.1)",
      "&:hover": {
        background: "rgba(255,255,255,0.3)",
      },
    },
    headerText: {
      background: isLight
        ? "linear-gradient(45deg, #3f51b5, #2196f3)"
        : "linear-gradient(45deg, #90caf9, #42a5f5)",
      backgroundClip: "text",
      textFillColor: "transparent",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    refreshButton: {
      borderRadius: "50%",
      p: 1.5,
      background: isLight
        ? "linear-gradient(145deg, #ffffff, #f0f0f0)"
        : "linear-gradient(145deg, #2d2d2d, #252525)",
      boxShadow: isLight
        ? "5px 5px 10px rgba(0,0,0,0.05), -5px -5px 10px rgba(255,255,255,0.8)"
        : "5px 5px 10px rgba(0,0,0,0.2), -5px -5px 10px rgba(255,255,255,0.05)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      color: isLight ? "primary.main" : "primary.light",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: isLight
          ? "7px 7px 15px rgba(0,0,0,0.1), -7px -7px 15px rgba(255,255,255,0.9)"
          : "7px 7px 15px rgba(0,0,0,0.3), -7px -7px 15px rgba(255,255,255,0.05)",
      },
      "&:active": {
        transform: "translateY(0)",
        boxShadow: isLight
          ? "inset 5px 5px 10px rgba(0,0,0,0.05), inset -5px -5px 10px rgba(255,255,255,0.8)"
          : "inset 5px 5px 10px rgba(0,0,0,0.2), inset -5px -5px 10px rgba(255,255,255,0.05)",
      },
    },
    refreshingButton: {
      borderRadius: "50%",
      p: 1.5,
      background: isLight
        ? "linear-gradient(145deg, #f0f0f0, #e6e6e6)"
        : "linear-gradient(145deg, #252525, #1e1e1e)",
      boxShadow: isLight
        ? "inset 5px 5px 10px rgba(0,0,0,0.05), inset -5px -5px 10px rgba(255,255,255,0.8)"
        : "inset 5px 5px 10px rgba(0,0,0,0.2), inset -5px -5px 10px rgba(255,255,255,0.05)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      opacity: 0.8,
    },
    sectionContainer: {
      p: 3,
      mb: 4,
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, rgba(255,255,255,0.7), rgba(240,240,240,0.5))"
        : "linear-gradient(145deg, rgba(40,40,40,0.7), rgba(30,30,30,0.5))",
      backdropFilter: "blur(10px)",
      boxShadow: isLight
        ? "10px 10px 20px rgba(0,0,0,0.05), -10px -10px 20px rgba(255,255,255,0.7)"
        : "10px 10px 20px rgba(0,0,0,0.2), -10px -10px 20px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: isLight
          ? "15px 15px 30px rgba(0,0,0,0.07), -15px -15px 30px rgba(255,255,255,0.8)"
          : "15px 15px 30px rgba(0,0,0,0.3), -15px -15px 30px rgba(255,255,255,0.03)",
      },
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      mb: 3,
      pb: 2,
      borderBottom: isLight
        ? "1px solid rgba(0,0,0,0.05)"
        : "1px solid rgba(255,255,255,0.05)",
    },
    iconContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
      borderRadius: "50%",
      mr: 2,
      background: isLight
        ? "linear-gradient(145deg, #ffffff, #f0f0f0)"
        : "linear-gradient(145deg, #2d2d2d, #252525)",
      boxShadow: isLight
        ? "5px 5px 10px rgba(0,0,0,0.05), -5px -5px 10px rgba(255,255,255,0.8)"
        : "5px 5px 10px rgba(0,0,0,0.2), -5px -5px 10px rgba(255,255,255,0.05)",
    },
    metricCard: {
      height: "100%",
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))"
        : "linear-gradient(145deg, rgba(40,40,40,0.9), rgba(30,30,30,0.7))",
      backdropFilter: "blur(10px)",
      boxShadow: isLight
        ? "7px 7px 14px rgba(0,0,0,0.05), -7px -7px 14px rgba(255,255,255,0.8)"
        : "7px 7px 14px rgba(0,0,0,0.2), -7px -7px 14px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      overflow: "visible",
      "&:hover": {
        transform: "translateY(-7px) scale(1.02)",
        boxShadow: isLight
          ? "10px 10px 20px rgba(0,0,0,0.08), -10px -10px 20px rgba(255,255,255,0.9)"
          : "10px 10px 20px rgba(0,0,0,0.3), -10px -10px 20px rgba(255,255,255,0.03)",
      },
    },
    metricIconWrapper: (color) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 48,
      height: 48,
      borderRadius: "50%",
      background: isLight
        ? "linear-gradient(145deg, #ffffff, #f0f0f0)"
        : "linear-gradient(145deg, #2d2d2d, #252525)",
      boxShadow: isLight
        ? "5px 5px 10px rgba(0,0,0,0.05), -5px -5px 10px rgba(255,255,255,0.8)"
        : "5px 5px 10px rgba(0,0,0,0.2), -5px -5px 10px rgba(255,255,255,0.05)",
      color,
      transition: "transform 0.3s ease",
      "&:hover": {
        transform: "scale(1.1)",
      },
    }),
    trendUp: {
      color: "success.main",
      display: "flex",
      alignItems: "center",
    },
    trendDown: {
      color: "error.main",
      display: "flex",
      alignItems: "center",
    },
    inventoryCard: {
      height: "100%",
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))"
        : "linear-gradient(145deg, rgba(40,40,40,0.9), rgba(30,30,30,0.7))",
      backdropFilter: "blur(10px)",
      boxShadow: isLight
        ? "7px 7px 14px rgba(0,0,0,0.05), -7px -7px 14px rgba(255,255,255,0.8)"
        : "7px 7px 14px rgba(0,0,0,0.2), -7px -7px 14px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": {
        transform: "translateY(-7px)",
        boxShadow: isLight
          ? "10px 10px 20px rgba(0,0,0,0.08), -10px -10px 20px rgba(255,255,255,0.9)"
          : "10px 10px 20px rgba(0,0,0,0.3), -10px -10px 20px rgba(255,255,255,0.03)",
      },
    },
    revenueCard: {
      height: "100%",
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))"
        : "linear-gradient(145deg, rgba(40,40,40,0.9), rgba(30,30,30,0.7))",
      backdropFilter: "blur(10px)",
      boxShadow: isLight
        ? "7px 7px 14px rgba(0,0,0,0.05), -7px -7px 14px rgba(255,255,255,0.8)"
        : "7px 7px 14px rgba(0,0,0,0.2), -7px -7px 14px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": {
        transform: "translateY(-7px)",
        boxShadow: isLight
          ? "10px 10px 20px rgba(0,0,0,0.08), -10px -10px 20px rgba(255,255,255,0.9)"
          : "10px 10px 20px rgba(0,0,0,0.3), -10px -10px 20px rgba(255,255,255,0.03)",
      },
    },
    chartContainer: {
      height: "100%",
      p: 3,
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))"
        : "linear-gradient(145deg, rgba(40,40,40,0.9), rgba(30,30,30,0.7))",
      backdropFilter: "blur(10px)",
      boxShadow: isLight
        ? "10px 10px 20px rgba(0,0,0,0.05), -10px -10px 20px rgba(255,255,255,0.7)"
        : "10px 10px 20px rgba(0,0,0,0.2), -10px -10px 20px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: isLight
          ? "15px 15px 30px rgba(0,0,0,0.07), -15px -15px 30px rgba(255,255,255,0.8)"
          : "15px 15px 30px rgba(0,0,0,0.3), -15px -15px 30px rgba(255,255,255,0.03)",
      },
    },
    progressContainer: {
      mt: 1.5,
      p: 1,
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, #f0f0f0, #ffffff)"
        : "linear-gradient(145deg, #252525, #2d2d2d)",
      boxShadow: isLight
        ? "inset 3px 3px 6px rgba(0,0,0,0.05), inset -3px -3px 6px rgba(255,255,255,0.8)"
        : "inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.02)",
    },
    progress: (color) => ({
      height: 6,
      borderRadius: 3,
      background: isLight ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
      "& .MuiLinearProgress-bar": {
        background: `linear-gradient(90deg, ${alpha(color, 0.7)}, ${color})`,
        borderRadius: 3,
        boxShadow: `0 0 10px ${alpha(color, 0.5)}`,
      },
    }),
    revenueIconWrapper: (color) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: isLight
        ? "linear-gradient(145deg, #ffffff, #f0f0f0)"
        : "linear-gradient(145deg, #2d2d2d, #252525)",
      boxShadow: isLight
        ? "5px 5px 10px rgba(0,0,0,0.05), -5px -5px 10px rgba(255,255,255,0.8)"
        : "5px 5px 10px rgba(0,0,0,0.2), -5px -5px 10px rgba(255,255,255,0.05)",
      color,
      transition: "transform 0.3s ease",
      "&:hover": {
        transform: "scale(1.1)",
      },
    }),
    textSecondary: {
      color: isLight ? "text.secondary" : "rgba(255,255,255,0.7)",
      fontWeight: 500,
    },
    tooltipPaper: {
      p: 2,
      borderRadius: 2,
      backdropFilter: "blur(10px)",
      background: isLight ? "rgba(255,255,255,0.9)" : "rgba(40,40,40,0.9)",
      boxShadow: isLight
        ? "5px 5px 10px rgba(0,0,0,0.1), -5px -5px 10px rgba(255,255,255,0.5)"
        : "5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.5)"
        : "1px solid rgba(255,255,255,0.05)",
    },
  };
};

// Main dashboard component
function DashboardContent() {
  const muiTheme = useMuiTheme();
  const { mode } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [userMetrics, setUserMetrics] = useState({});
  const [flightInv, setFlightInv] = useState({});
  const [bookingRev, setBookingRev] = useState({});

  // Get dynamic styles based on current theme mode
  const styles = getStyles(mode, muiTheme);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    try {
      const res = await fetch(`/api/token/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      localStorage.setItem("token", data.accessToken);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      setRefreshing(true);
      const res = await fetch(`/api/dashboard-data`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        // If unauthorized or forbidden, try to refresh the token
        if (res.status === 401 || res.status === 403) {
          const refreshed = await refreshToken();
          if (refreshed) {
            // Retry the request with the new token
            const newToken = localStorage.getItem("token");
            const retryRes = await fetch(`/api/dashboard-data`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${newToken}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
            });

            if (retryRes.ok) {
              const json = await retryRes.json();
              setUserMetrics(json.userMetrics || {});
              setFlightInv(json.flightInventoryMetrics || {});
              setBookingRev(json.bookingRevenueMetrics || {});
              setError("");
              return;
            }
          }
        }
        throw new Error("Failed to load metrics");
      }

      const json = await res.json();
      setUserMetrics(json.userMetrics || {});
      setFlightInv(json.flightInventoryMetrics || {});
      setBookingRev(json.bookingRevenueMetrics || {});
      setError("");
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => fetchData();

  if (loading) {
    return (
      <Box sx={styles.centeredContainer}>
        <Box sx={styles.loadingContainer}>
          <CircularProgress
            size={60}
            thickness={4}
            sx={styles.loadingSpinner}
          />
        </Box>
        <Typography variant="h6" sx={{ ...styles.textSecondary, mt: 2 }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert
          severity="error"
          variant="filled"
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={handleRefresh}
              sx={styles.alertButton}
            >
              <RefreshIcon />
            </IconButton>
          }
          sx={styles.errorAlert}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // Prepare data for charts
  const weeklyData = Object.entries(bookingRev.bookingsCreatedWeekly || {}).map(
    ([week, count]) => ({ week, count })
  );

  const dailyData = Object.entries(bookingRev.bookingsCreatedDaily || {}).map(
    ([date, count]) => ({ date, count })
  );

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) =>
    active && payload?.length ? (
      <Paper sx={styles.tooltipPaper} elevation={0}>
        <Typography variant="subtitle2">{label}</Typography>
        <Typography variant="body1" fontWeight="bold">
          {payload[0].value} bookings
        </Typography>
      </Paper>
    ) : null;

  // Main dashboard content
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header + Refresh */}
      <Box sx={styles.headerContainer}>
        <Typography variant="h4" fontWeight="bold" sx={styles.headerText}>
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <ThemeToggle />
          <Tooltip title="Refresh data">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={refreshing ? styles.refreshingButton : styles.refreshButton}
            >
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* User Metrics */}
      <Box sx={styles.sectionContainer}>
        <Box sx={styles.sectionHeader}>
          <Box sx={styles.iconContainer}>
            <PeopleAltIcon sx={{ color: muiTheme.palette.primary.main }} />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            User Metrics
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {[
            {
              label: "Active Users",
              sub: "Last 24h",
              val: userMetrics.activeUsers24Hours,
              icon: <PeopleAltIcon />,
              colorKey: "success",
              trend: userMetrics.activeUsers24HoursGrowthRate || 0,
            },
            {
              label: "New Signups",
              sub: "Last 7d",
              val: userMetrics.newSignups7Days,
              icon: <PeopleAltIcon />,
              colorKey: "info",
              trend: userMetrics.newSignups7DaysGrowthRate || 0,
            },
            {
              label: "New Signups",
              sub: "Last 30d",
              val: userMetrics.newSignups30Days,
              icon: <PeopleAltIcon />,
              colorKey: "warning",
              trend: userMetrics.newSignups30DaysGrowthRate || 0,
            },
            {
              label: "Total Users",
              sub: "All time",
              val: userMetrics.totalUsers,
              icon: <PeopleAltIcon />,
              colorKey: "primary",
              trend: userMetrics.totalUsersGrowthRate || 0,
            },
          ].map(({ label, sub, val, icon, colorKey, trend }) => (
            <Grid item xs={12} sm={6} md={3} key={`${label}-${sub}`}>
              <Card sx={styles.metricCard}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={styles.textSecondary}>
                        {label}
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{ color: muiTheme.palette[colorKey].main }}
                      >
                        {val?.toLocaleString() ?? "-"}
                      </Typography>
                      <Typography variant="caption" sx={styles.textSecondary}>
                        {sub}
                      </Typography>
                    </Box>
                    <Box
                      sx={styles.metricIconWrapper(
                        muiTheme.palette[colorKey].main
                      )}
                    >
                      {icon}
                    </Box>
                  </Box>
                  {trend !== 0 && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      {trend > 0 ? (
                        <TrendingUpIcon sx={styles.trendUp} />
                      ) : (
                        <TrendingDownIcon sx={styles.trendDown} />
                      )}
                      <Typography
                        variant="caption"
                        sx={trend > 0 ? styles.trendUp : styles.trendDown}
                        fontWeight="bold"
                      >
                        {Math.abs(trend)}%
                      </Typography>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Flight Inventory */}
      <Box sx={styles.sectionContainer}>
        <Box sx={styles.sectionHeader}>
          <Box sx={styles.iconContainer}>
            <FlightIcon sx={{ color: muiTheme.palette.info.main }} />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            Flight Inventory
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {[
            {
              label: "Available Flights",
              val: flightInv.availableFlights,
              colorKey: "success",
              pct:
                (flightInv.availableFlights /
                  Math.max(flightInv.totalFlights || 1, 1)) *
                100,
            },
            {
              label: "Upcoming Flights",
              sub: "Next 7d",
              val: flightInv.upcomingFlights7Days,
              colorKey: "info",
              pct:
                (flightInv.upcomingFlights7Days /
                  Math.max(flightInv.totalFlights || 1, 1)) *
                100,
            },
            {
              label: "Recently Added",
              sub: "Last 7d",
              val: flightInv.flightsAdded7Days,
              colorKey: "warning",
              pct:
                (flightInv.flightsAdded7Days /
                  Math.max(flightInv.totalFlights || 1, 1)) *
                100,
            },
            {
              label: "Fully Booked",
              val: flightInv.fullyBookedFlights,
              colorKey: "error",
              pct:
                (flightInv.fullyBookedFlights /
                  Math.max(flightInv.totalFlights || 1, 1)) *
                100,
            },
            {
              label: "Total Flights",
              val: flightInv.totalFlights,
              colorKey: "primary",
              pct: 100,
            },
          ].map(({ label, sub, val, colorKey, pct }) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={label}>
              <Card sx={styles.inventoryCard}>
                <CardContent>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    align="center"
                    sx={{ color: muiTheme.palette[colorKey].main }}
                  >
                    {val?.toLocaleString() ?? "-"}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={styles.textSecondary}
                    align="center"
                  >
                    {label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={styles.textSecondary}
                    align="center"
                    display="block"
                    height="18px"
                  >
                    {sub || "\u00A0"}
                  </Typography>
                  <Box sx={styles.progressContainer}>
                    <LinearProgress
                      variant="determinate"
                      value={pct || 0}
                      sx={styles.progress(muiTheme.palette[colorKey].main)}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={styles.textSecondary}
                    align="right"
                    display="block"
                    mt={0.5}
                  >
                    {pct.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Booking & Revenue */}
      <Box sx={styles.sectionContainer}>
        <Box sx={styles.sectionHeader}>
          <Box sx={styles.iconContainer}>
            <ShoppingCartIcon sx={{ color: muiTheme.palette.success.main }} />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            Booking & Revenue
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {[
            {
              label: "Weekly Bookings",
              val: weeklyData.reduce((sum, d) => sum + d.count, 0),
              icon: <ShoppingCartIcon />,
              colorKey: "primary",
            },
            {
              label: "Total Revenue",
              val: `$${bookingRev.totalRevenue?.toLocaleString()}`,
              icon: <AttachMoneyIcon />,
              colorKey: "success",
            },
            {
              label: "Avg Ticket Price",
              val: `$${bookingRev.averageTicketPrice?.toLocaleString()}`,
              icon: <AttachMoneyIcon />,
              colorKey: "info",
            },
            {
              label: "Cart Abandonment",
              val: `${((bookingRev.cartAbandonmentRate || 0) * 100).toFixed(
                1
              )}%`,
              icon: <ShoppingCartIcon />,
              colorKey: "warning",
            },
            {
              label: "Conversion Rate",
              val: `${((bookingRev.conversionRate || 0) * 100).toFixed(1)}%`,
              icon: <TrendingUpIcon />,
              colorKey: "error",
            },
          ].map(({ label, val, icon, colorKey }) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={label}>
              <Card sx={styles.revenueCard}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={styles.textSecondary}>
                      {label}
                    </Typography>
                    <Box
                      sx={styles.revenueIconWrapper(
                        muiTheme.palette[colorKey].main
                      )}
                    >
                      {React.cloneElement(icon, { fontSize: "small" })}
                    </Box>
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: muiTheme.palette[colorKey].main }}
                  >
                    {val}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Charts */}
      <Grid container spacing={4}>
        <Grid item xs={12} lg={7}>
          <Box sx={styles.chartContainer}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Weekly Bookings
            </Typography>
            <Typography variant="body2" sx={styles.textSecondary} paragraph>
              Number of bookings per week (last 4 weeks)
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                  <XAxis dataKey="week" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    fill={muiTheme.palette.primary.main}
                    fillOpacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Box sx={styles.chartContainer}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Daily Bookings
            </Typography>
            <Typography variant="body2" sx={styles.textSecondary} paragraph>
              Number of bookings per day (last 7 days)
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    strokeWidth={2}
                    stroke={muiTheme.palette.info.main}
                    fill={muiTheme.palette.info.main}
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

// Wrap the dashboard content with our theme provider
export default function DashboardPage() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <DashboardContent />
    </ThemeProvider>
  );
}

// This is a duplicate function that's not used - the actual getStyles is defined above
const unusedGetStyles = (mode, theme) => {
  const isLight = mode === "light";

  return {
    centeredContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "80vh",
      background: isLight
        ? "linear-gradient(145deg, #f8f9fa, #e9ecef)"
        : "linear-gradient(145deg, #121212, #1e1e1e)",
      transition: "background 0.3s ease",
    },
    headerContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 4,
      p: 2,
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, rgba(255,255,255,0.6), rgba(240,240,240,0.4))"
        : "linear-gradient(145deg, rgba(40,40,40,0.6), rgba(30,30,30,0.4))",
      backdropFilter: "blur(10px)",
      boxShadow: isLight
        ? "5px 5px 15px rgba(0,0,0,0.05), -5px -5px 15px rgba(255,255,255,0.6)"
        : "5px 5px 15px rgba(0,0,0,0.2), -5px -5px 15px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
    },
    loadingContainer: {
      position: "relative",
      width: 80,
      height: 80,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      background: isLight
        ? "linear-gradient(145deg, #ffffff, #f0f0f0)"
        : "linear-gradient(145deg, #2d2d2d, #252525)",
      boxShadow: isLight
        ? "10px 10px 20px rgba(0,0,0,0.1), -10px -10px 20px rgba(255,255,255,0.8)"
        : "10px 10px 20px rgba(0,0,0,0.3), -10px -10px 20px rgba(255,255,255,0.05)",
    },
    loadingSpinner: {
      color: isLight ? "primary.main" : "primary.light",
      position: "relative",
      zIndex: 2,
    },
    errorAlert: {
      borderRadius: 3,
      backdropFilter: "blur(10px)",
      background:
        "linear-gradient(145deg, rgba(244,67,54,0.9), rgba(229,57,53,0.7))",
      boxShadow:
        "7px 7px 14px rgba(0,0,0,0.1), -7px -7px 14px rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.2)",
    },
    alertButton: {
      borderRadius: "50%",
      background: "rgba(255,255,255,0.2)",
      backdropFilter: "blur(5px)",
      boxShadow:
        "3px 3px 6px rgba(0,0,0,0.1), -3px -3px 6px rgba(255,255,255,0.1)",
      "&:hover": {
        background: "rgba(255,255,255,0.3)",
      },
    },
    headerText: {
      background: isLight
        ? "linear-gradient(45deg, #3f51b5, #2196f3)"
        : "linear-gradient(45deg, #90caf9, #42a5f5)",
      backgroundClip: "text",
      textFillColor: "transparent",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    refreshButton: {
      borderRadius: "50%",
      p: 1.5,
      background: isLight
        ? "linear-gradient(145deg, #ffffff, #f0f0f0)"
        : "linear-gradient(145deg, #2d2d2d, #252525)",
      boxShadow: isLight
        ? "5px 5px 10px rgba(0,0,0,0.05), -5px -5px 10px rgba(255,255,255,0.8)"
        : "5px 5px 10px rgba(0,0,0,0.2), -5px -5px 10px rgba(255,255,255,0.05)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      color: isLight ? "primary.main" : "primary.light",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: isLight
          ? "7px 7px 15px rgba(0,0,0,0.1), -7px -7px 15px rgba(255,255,255,0.9)"
          : "7px 7px 15px rgba(0,0,0,0.3), -7px -7px 15px rgba(255,255,255,0.05)",
      },
      "&:active": {
        transform: "translateY(0)",
        boxShadow: isLight
          ? "inset 5px 5px 10px rgba(0,0,0,0.05), inset -5px -5px 10px rgba(255,255,255,0.8)"
          : "inset 5px 5px 10px rgba(0,0,0,0.2), inset -5px -5px 10px rgba(255,255,255,0.05)",
      },
    },
    refreshingButton: {
      borderRadius: "50%",
      p: 1.5,
      background: isLight
        ? "linear-gradient(145deg, #f0f0f0, #e6e6e6)"
        : "linear-gradient(145deg, #252525, #1e1e1e)",
      boxShadow: isLight
        ? "inset 5px 5px 10px rgba(0,0,0,0.05), inset -5px -5px 10px rgba(255,255,255,0.8)"
        : "inset 5px 5px 10px rgba(0,0,0,0.2), inset -5px -5px 10px rgba(255,255,255,0.05)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      opacity: 0.8,
    },
    sectionContainer: {
      p: 3,
      mb: 4,
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, rgba(255,255,255,0.7), rgba(240,240,240,0.5))"
        : "linear-gradient(145deg, rgba(40,40,40,0.7), rgba(30,30,30,0.5))",
      backdropFilter: "blur(10px)",
      boxShadow: isLight
        ? "10px 10px 20px rgba(0,0,0,0.05), -10px -10px 20px rgba(255,255,255,0.7)"
        : "10px 10px 20px rgba(0,0,0,0.2), -10px -10px 20px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: isLight
          ? "15px 15px 30px rgba(0,0,0,0.07), -15px -15px 30px rgba(255,255,255,0.8)"
          : "15px 15px 30px rgba(0,0,0,0.3), -15px -15px 30px rgba(255,255,255,0.03)",
      },
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      mb: 3,
      pb: 2,
      borderBottom: isLight
        ? "1px solid rgba(0,0,0,0.05)"
        : "1px solid rgba(255,255,255,0.05)",
    },
    iconContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
      borderRadius: "50%",
      mr: 2,
      background: isLight
        ? "linear-gradient(145deg, #ffffff, #f0f0f0)"
        : "linear-gradient(145deg, #2d2d2d, #252525)",
      boxShadow: isLight
        ? "5px 5px 10px rgba(0,0,0,0.05), -5px -5px 10px rgba(255,255,255,0.8)"
        : "5px 5px 10px rgba(0,0,0,0.2), -5px -5px 10px rgba(255,255,255,0.05)",
    },
    metricCard: {
      height: "100%",
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))"
        : "linear-gradient(145deg, rgba(40,40,40,0.9), rgba(30,30,30,0.7))",
      backdropFilter: "blur(10px)",
      boxShadow: isLight
        ? "7px 7px 14px rgba(0,0,0,0.05), -7px -7px 14px rgba(255,255,255,0.8)"
        : "7px 7px 14px rgba(0,0,0,0.2), -7px -7px 14px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      overflow: "visible",
      "&:hover": {
        transform: "translateY(-7px) scale(1.02)",
        boxShadow: isLight
          ? "10px 10px 20px rgba(0,0,0,0.08), -10px -10px 20px rgba(255,255,255,0.9)"
          : "10px 10px 20px rgba(0,0,0,0.3), -10px -10px 20px rgba(255,255,255,0.03)",
      },
    },
    metricIconWrapper: (color) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 48,
      height: 48,
      borderRadius: "50%",
      background: isLight
        ? "linear-gradient(145deg, #ffffff, #f0f0f0)"
        : "linear-gradient(145deg, #2d2d2d, #252525)",
      boxShadow: isLight
        ? "5px 5px 10px rgba(0,0,0,0.05), -5px -5px 10px rgba(255,255,255,0.8)"
        : "5px 5px 10px rgba(0,0,0,0.2), -5px -5px 10px rgba(255,255,255,0.05)",
      color,
      transition: "transform 0.3s ease",
      "&:hover": {
        transform: "scale(1.1)",
      },
    }),
    trendUp: {
      color: "success.main",
      display: "flex",
      alignItems: "center",
    },
    trendDown: {
      color: "error.main",
      display: "flex",
      alignItems: "center",
    },
    inventoryCard: {
      height: "100%",
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))"
        : "linear-gradient(145deg, rgba(40,40,40,0.9), rgba(30,30,30,0.7))",
      backdropFilter: "blur(10px)",
      boxShadow: isLight
        ? "7px 7px 14px rgba(0,0,0,0.05), -7px -7px 14px rgba(255,255,255,0.8)"
        : "7px 7px 14px rgba(0,0,0,0.2), -7px -7px 14px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": {
        transform: "translateY(-7px)",
        boxShadow: isLight
          ? "10px 10px 20px rgba(0,0,0,0.08), -10px -10px 20px rgba(255,255,255,0.9)"
          : "10px 10px 20px rgba(0,0,0,0.3), -10px -10px 20px rgba(255,255,255,0.03)",
      },
    },
    revenueCard: {
      height: "100%",
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))"
        : "linear-gradient(145deg, rgba(40,40,40,0.9), rgba(30,30,30,0.7))",
      backdropFilter: "blur(10px)",
      boxShadow: isLight
        ? "7px 7px 14px rgba(0,0,0,0.05), -7px -7px 14px rgba(255,255,255,0.8)"
        : "7px 7px 14px rgba(0,0,0,0.2), -7px -7px 14px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": {
        transform: "translateY(-7px)",
        boxShadow: isLight
          ? "10px 10px 20px rgba(0,0,0,0.08), -10px -10px 20px rgba(255,255,255,0.9)"
          : "10px 10px 20px rgba(0,0,0,0.3), -10px -10px 20px rgba(255,255,255,0.03)",
      },
    },
    chartContainer: {
      height: "100%",
      p: 3,
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))"
        : "linear-gradient(145deg, rgba(40,40,40,0.9), rgba(30,30,30,0.7))",
      backdropFilter: "blur(10px)",
      boxShadow: isLight
        ? "10px 10px 20px rgba(0,0,0,0.05), -10px -10px 20px rgba(255,255,255,0.7)"
        : "10px 10px 20px rgba(0,0,0,0.2), -10px -10px 20px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.3)"
        : "1px solid rgba(255,255,255,0.05)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: isLight
          ? "15px 15px 30px rgba(0,0,0,0.07), -15px -15px 30px rgba(255,255,255,0.8)"
          : "15px 15px 30px rgba(0,0,0,0.3), -15px -15px 30px rgba(255,255,255,0.03)",
      },
    },
    progressContainer: {
      mt: 1.5,
      p: 1,
      borderRadius: 3,
      background: isLight
        ? "linear-gradient(145deg, #f0f0f0, #ffffff)"
        : "linear-gradient(145deg, #252525, #2d2d2d)",
      boxShadow: isLight
        ? "inset 3px 3px 6px rgba(0,0,0,0.05), inset -3px -3px 6px rgba(255,255,255,0.8)"
        : "inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.02)",
    },
    progress: (color) => ({
      height: 6,
      borderRadius: 3,
      background: isLight ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
      "& .MuiLinearProgress-bar": {
        background: `linear-gradient(90deg, ${alpha(color, 0.7)}, ${color})`,
        borderRadius: 3,
        boxShadow: `0 0 10px ${alpha(color, 0.5)}`,
      },
    }),
    revenueIconWrapper: (color) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: isLight
        ? "linear-gradient(145deg, #ffffff, #f0f0f0)"
        : "linear-gradient(145deg, #2d2d2d, #252525)",
      boxShadow: isLight
        ? "5px 5px 10px rgba(0,0,0,0.05), -5px -5px 10px rgba(255,255,255,0.8)"
        : "5px 5px 10px rgba(0,0,0,0.2), -5px -5px 10px rgba(255,255,255,0.05)",
      color,
      transition: "transform 0.3s ease",
      "&:hover": {
        transform: "scale(1.1)",
      },
    }),
    textSecondary: {
      color: isLight ? "text.secondary" : "rgba(255,255,255,0.7)",
      fontWeight: 500,
    },
    tooltipPaper: {
      p: 2,
      borderRadius: 2,
      backdropFilter: "blur(10px)",
      background: isLight ? "rgba(255,255,255,0.9)" : "rgba(40,40,40,0.9)",
      boxShadow: isLight
        ? "5px 5px 10px rgba(0,0,0,0.1), -5px -5px 10px rgba(255,255,255,0.5)"
        : "5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(255,255,255,0.02)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.5)"
        : "1px solid rgba(255,255,255,0.05)",
    },
  };
};
