// contexts/ThemeContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ThemeContext = createContext();

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("dark");

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme-preference");
    if (savedTheme) {
      setMode(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  // Save theme preference and apply to document
  useEffect(() => {
    localStorage.setItem("theme-preference", mode);
    document.documentElement.setAttribute("data-theme", mode);

    // Update body class for compatibility
    if (mode === "dark") {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Create MUI theme based on mode
  const muiTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: "#FF6F00",
        light: "#FF8F00",
        dark: "#E65100",
      },
      secondary: {
        main: "#FFA726",
      },
      background: {
        default: mode === "dark" ? "#000000" : "#ffffff",
        paper: mode === "dark" ? "#121212" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#ffffff" : "#000000",
        secondary:
          mode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
      },
    },
    typography: {
      fontFamily:
        '"Poppins", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background-color 0.3s ease, color 0.3s ease",
          },
        },
      },
    },
  });

  const value = {
    mode,
    toggleTheme,
    isDark: mode === "dark",
    isLight: mode === "light",
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
