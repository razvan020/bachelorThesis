"use client";
import React from "react";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

// Mock data for demonstration
const barData = [
  { name: "1", value1: 20, value2: 30 },
  { name: "2", value1: 25, value2: 35 },
  { name: "3", value1: 30, value2: 40 },
  { name: "4", value1: 28, value2: 38 },
  { name: "5", value1: 22, value2: 32 },
];

const pieData = [
  { name: "Achieved", value: 71 },
  { name: "Remaining", value: 29 },
];
const COLORS = ["#1976d2", "#e0e0e0"];

const lineData = [
  { day: "M", value: 30 },
  { day: "T", value: 50 },
  { day: "W", value: 45 },
  { day: "T", value: 60 },
  { day: "F", value: 55 },
];

export default function DashboardPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={3}>
        {/* Metric Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4">3450</Typography>
              <Typography color="textSecondary">Number of Sales</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4">$35,256</Typography>
              <Typography color="textSecondary">Sales Revenue</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4">$35.26</Typography>
              <Typography color="textSecondary">Average Price</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4">15,893</Typography>
              <Typography color="textSecondary">Operations</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Market Overview Bar Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Market Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value1" fill="#1976d2" />
                  <Bar dataKey="value2" fill="#43a047" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Overview Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales Overview
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Analytics Line Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales Analytics
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={lineData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#1976d2"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
