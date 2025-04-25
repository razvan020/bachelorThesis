import React from "react";
import { IconButton, Tooltip, useTheme as useMuiTheme } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Dark mode icon
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Light mode icon
import { useAppTheme } from "@/contexts/ThemeContext";

const ThemeToggle = ({ sx = {} }) => {
  // Get the theme toggle function from our custom context
  const { mode, toggleTheme } = useAppTheme();

  // Get the MUI theme object for styling
  const muiTheme = useMuiTheme();

  return (
    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          borderRadius: "50%",
          p: 1.5,
          background:
            mode === "light"
              ? "linear-gradient(145deg, #ffffff, #f0f0f0)"
              : "linear-gradient(145deg, #2d2d2d, #252525)",
          boxShadow:
            mode === "light"
              ? "5px 5px 10px rgba(0,0,0,0.05), -5px -5px 10px rgba(255,255,255,0.8)"
              : "5px 5px 10px rgba(0,0,0,0.2), -5px -5px 10px rgba(255,255,255,0.05)",
          border:
            mode === "light"
              ? "1px solid rgba(255,255,255,0.3)"
              : "1px solid rgba(255,255,255,0.05)",
          color:
            mode === "light"
              ? muiTheme.palette.primary.main
              : muiTheme.palette.primary.light,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              mode === "light"
                ? "7px 7px 15px rgba(0,0,0,0.1), -7px -7px 15px rgba(255,255,255,0.9)"
                : "7px 7px 15px rgba(0,0,0,0.3), -7px -7px 15px rgba(255,255,255,0.05)",
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow:
              mode === "light"
                ? "inset 5px 5px 10px rgba(0,0,0,0.05), inset -5px -5px 10px rgba(255,255,255,0.8)"
                : "inset 5px 5px 10px rgba(0,0,0,0.2), inset -5px -5px 10px rgba(255,255,255,0.05)",
          },
          ...sx,
        }}
      >
        {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
