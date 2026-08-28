"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Typography,
} from "@mui/material";

type HelloResponse = {
  message: string;
};

export default function ApiTestPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function callFastAPI() {
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/hello"
      );

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`
        );
      }

      const data: HelloResponse = await response.json();

      setMessage(data.message);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong.");
      }
    }
  }

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        py: 6,
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 3,
          fontWeight: "bold",
        }}
      >
        FastAPI Test
      </Typography>

      <Button
        variant="contained"
        onClick={callFastAPI}
      >
        Call FastAPI
      </Button>

      {message && (
        <Alert severity="success" sx={{ mt: 3 }}>
          Backend response: {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          Error: {error}
        </Alert>
      )}
    </Box>
  );
}