// components/DashboardLayout.jsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import FlightIcon from "@mui/icons-material/Flight";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 240;
const headerHeight = 64; // match your NavBar height
const footerHeight = 64; // match your Footer height

export default function DashboardLayout({
  selectedTab,
  onTabChange,
  children,
}) {
  const theme = useTheme();

  const tabs = [
    { id: "overview", label: "Overview", icon: <DashboardIcon /> },
    { id: "users", label: "Manage Users", icon: <PeopleIcon /> },
    { id: "flights", label: "Manage Flights", icon: <FlightIcon /> },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: `calc(100vh - ${headerHeight + footerHeight}px)`,
      }}
    >
      {/* sidebar */}
      <Box
        component="aside"
        sx={{
          width: drawerWidth,
          position: "sticky",
          top: `${headerHeight}px`,
          height: `calc(100vh - ${headerHeight + footerHeight}px)`,
          overflowY: "auto",
          bgcolor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        <List disablePadding>
          {tabs.map(({ id, label, icon }) => (
            <ListItemButton
              key={id}
              selected={selectedTab === id}
              onClick={() => onTabChange(id)}
              sx={{
                textTransform: "uppercase",
                px: 3,
                py: 1.5,
                color: theme.palette.text.primary,
                "&.Mui-selected": {
                  backgroundColor: theme.palette.action.selected,
                },
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                {icon}
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
