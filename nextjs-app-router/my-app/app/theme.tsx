"use client";
import {createTheme} from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
        main: "#1976d2",
    },
    secondary: {
        main: "#dc004e",
    },
  },

  shape: {
    borderRadius: 8,
  },

  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
  },
});

export default theme;