"use client";
import React, { createContext, useContext, useState } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ThemeContext = createContext();

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider");
  return ctx;
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");
  const toggleTheme = () => setMode((m) => (m === "light" ? "dark" : "light"));

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: { main: "#3f51b5" },
                background: { default: "#f5f5f5", paper: "#fff" },
                text: { primary: "#000", secondary: "rgba(0,0,0,0.6)" },
              }
            : {
                primary: { main: "#90caf9" },
                background: { default: "#121212", paper: "#1e1e1e" },
                text: { primary: "#fff", secondary: "rgba(255,255,255,0.7)" },
              }),
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
