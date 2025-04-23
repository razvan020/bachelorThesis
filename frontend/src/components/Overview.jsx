"use client";
import React, { useState, useEffect } from "react"; // ← ensure React is imported
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  Paper,
  Container,
  alpha,
  LinearProgress,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import FlightIcon from "@mui/icons-material/Flight";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
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

export default function DashboardPage() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [userMetrics, setUserMetrics] = useState({});
  const [flightInv, setFlightInv] = useState({});
  const [bookingRev, setBookingRev] = useState({});

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/metrics");
      if (!res.ok) throw new Error("Failed to load metrics");
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: "text.secondary" }}>
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
            <IconButton color="inherit" size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // prepare chart data
  const weeklyData = Object.entries(bookingRev.bookingsCreatedWeekly || {}).map(
    ([week, count]) => ({ week, count })
  );

  const dailyData = Object.entries(bookingRev.bookingsCreatedDaily || {}).map(
    ([date, count]) => ({ date, count })
  );

  // custom tooltip
  const CustomTooltip = ({ active, payload, label }) =>
    active && payload?.length ? (
      <Paper
        elevation={3}
        sx={{
          p: 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight="bold">
          {payload[0].value} bookings
        </Typography>
      </Paper>
    ) : null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* header + refresh */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Analytics Dashboard
        </Typography>
        <Tooltip title="Refresh data">
          <IconButton
            onClick={handleRefresh}
            color="primary"
            disabled={refreshing}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* 1) USER METRICS */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(to right, ${alpha(
            theme.palette.primary.light,
            0.05
          )}, ${alpha(theme.palette.background.paper, 0.8)})`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PeopleAltIcon color="primary" sx={{ mr: 1 }} />
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
              color: theme.palette.success.main,
              trend: userMetrics.activeUsers24HoursGrowthRate || 0,
            },
            {
              label: "New Signups",
              sub: "Last 7d",
              val: userMetrics.newSignups7Days,
              icon: <PeopleAltIcon />,
              color: theme.palette.info.main,
              trend: userMetrics.newSignups7DaysGrowthRate || 0,
            },
            {
              label: "New Signups",
              sub: "Last 30d",
              val: userMetrics.newSignups30Days,
              icon: <PeopleAltIcon />,
              color: theme.palette.warning.main,
              trend: userMetrics.newSignups30DaysGrowthRate || 0,
            },
            {
              label: "Total Users",
              sub: "All time",
              val: userMetrics.totalUsers,
              icon: <PeopleAltIcon />,
              color: theme.palette.primary.main,
              trend: userMetrics.totalUsersGrowthRate || 0,
            },
          ].map(({ label, sub, val, icon, color, trend }) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={`${label}-${sub}`} // ← unique key now includes `sub`
            >
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: theme.shadows[6],
                  },
                  border: `1px solid ${alpha(color, 0.2)}`,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ color }}>
                        {val?.toLocaleString() ?? "-"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sub}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: "50%",
                        backgroundColor: alpha(color, 0.1),
                      }}
                    >
                      {icon}
                    </Box>
                  </Box>
                  {trend !== 0 && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      {trend > 0 ? (
                        <TrendingUpIcon
                          fontSize="small"
                          sx={{ color: theme.palette.success.main }}
                        />
                      ) : (
                        <TrendingDownIcon
                          fontSize="small"
                          sx={{ color: theme.palette.error.main }}
                        />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            trend > 0
                              ? theme.palette.success.main
                              : theme.palette.error.main,
                          fontWeight: "bold",
                        }}
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
      </Paper>

      {/* 2) FLIGHT INVENTORY METRICS */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(to right, ${alpha(
            theme.palette.info.light,
            0.05
          )}, ${alpha(theme.palette.background.paper, 0.8)})`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <FlightIcon color="info" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Flight Inventory
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {[
            {
              label: "Available Flights",
              val: flightInv.availableFlights,
              color: theme.palette.success.main,
              pct:
                (flightInv.availableFlights /
                  Math.max(flightInv.totalFlights || 1, 1)) *
                100,
            },
            {
              label: "Upcoming Flights",
              sub: "Next 7d",
              val: flightInv.upcomingFlights7Days,
              color: theme.palette.info.main,
              pct:
                (flightInv.upcomingFlights7Days /
                  Math.max(flightInv.totalFlights || 1, 1)) *
                100,
            },
            {
              label: "Recently Added",
              sub: "Last 7d",
              val: flightInv.flightsAdded7Days,
              color: theme.palette.warning.main,
              pct:
                (flightInv.flightsAdded7Days /
                  Math.max(flightInv.totalFlights || 1, 1)) *
                100,
            },
            {
              label: "Fully Booked",
              val: flightInv.fullyBookedFlights,
              color: theme.palette.error.main,
              pct:
                (flightInv.fullyBookedFlights /
                  Math.max(flightInv.totalFlights || 1, 1)) *
                100,
            },
            {
              label: "Total Flights",
              val: flightInv.totalFlights,
              color: theme.palette.primary.main,
              pct: 100,
            },
          ].map(({ label, sub, val, color, pct }) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={label}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: theme.shadows[6],
                  },
                  border: `1px solid ${alpha(color, 0.2)}`,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    align="center"
                    sx={{ color }}
                  >
                    {val?.toLocaleString() ?? "-"}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    align="center"
                  >
                    {label}
                  </Typography>
                  {sub && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      align="center"
                    >
                      {sub}
                    </Typography>
                  )}
                  <LinearProgress
                    variant="determinate"
                    value={pct || 0}
                    sx={{
                      mt: 1.5,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(color, 0.1),
                      "& .MuiLinearProgress-bar": { backgroundColor: color },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    align="right"
                    sx={{ mt: 0.5 }}
                  >
                    {pct.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 3) BOOKING & REVENUE METRICS */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(to right, ${alpha(
            theme.palette.success.light,
            0.05
          )}, ${alpha(theme.palette.background.paper, 0.8)})`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <ShoppingCartIcon color="success" sx={{ mr: 1 }} />
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
              color: theme.palette.primary.main,
            },
            {
              label: "Total Revenue",
              val: `$${bookingRev.totalRevenue.toLocaleString()}`,
              icon: <AttachMoneyIcon />,
              color: theme.palette.success.main,
            },
            {
              label: "Avg Ticket Price",
              val: `$${bookingRev.averageTicketPrice.toLocaleString()}`,
              icon: <AttachMoneyIcon />,
              color: theme.palette.info.main,
            },
            {
              label: "Cart Abandonment",
              val: `${(bookingRev.cartAbandonmentRate * 100).toFixed(1)}%`,
              icon: <ShoppingCartIcon />,
              color: theme.palette.warning.main,
            },
            {
              label: "Conversion Rate",
              val: `${(bookingRev.conversionRate * 100).toFixed(1)}%`,
              icon: <TrendingUpIcon />,
              color: theme.palette.error.main,
            },
          ].map(({ label, val, icon, color }) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={label}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: theme.shadows[6],
                  },
                  border: `1px solid ${alpha(color, 0.2)}`,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      {label}
                    </Typography>
                    <Box
                      sx={{
                        p: 0.5,
                        borderRadius: "50%",
                        backgroundColor: alpha(color, 0.1),
                      }}
                    >
                      {React.cloneElement(icon, {
                        fontSize: "small",
                        sx: { color },
                      })}
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ color }}>
                    {val}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 4) CHARTS */}
      <Grid container spacing={4}>
        {/* Weekly Bookings */}
        <Grid item xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              height: "100%",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Weekly Bookings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Number of bookings per week (last 4 weeks)
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha(theme.palette.divider, 0.5)}
                  />
                  <XAxis
                    dataKey="week"
                    tickLine={{ stroke: theme.palette.divider }}
                    axisLine={{ stroke: theme.palette.divider }}
                    tick={{
                      fill: theme.palette.text.secondary,
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={{ stroke: theme.palette.divider }}
                    axisLine={{ stroke: theme.palette.divider }}
                    tick={{
                      fill: theme.palette.text.secondary,
                      fontSize: 12,
                    }}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                    barSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Daily Bookings */}
        <Grid item xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              height: "100%",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Daily Bookings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Number of bookings per day (last 7 days)
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha(theme.palette.divider, 0.5)}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={{ stroke: theme.palette.divider }}
                    axisLine={{ stroke: theme.palette.divider }}
                    tick={{
                      fill: theme.palette.text.secondary,
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={{ stroke: theme.palette.divider }}
                    axisLine={{ stroke: theme.palette.divider }}
                    tick={{
                      fill: theme.palette.text.secondary,
                      fontSize: 12,
                    }}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={theme.palette.success.main}
                    fill={alpha(theme.palette.success.main, 0.2)}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
