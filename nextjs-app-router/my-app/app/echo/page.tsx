"use client";

import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

type EchoResponse = {
  message: string;
};

export default function EchoPage() {
  const [input, setInput] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage() {
    setIsLoading(true);
    setResponseMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/echo",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: input,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`
        );
      }

      const data: EchoResponse = await response.json();

      setResponseMessage(data.message);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        py: 6,
        px: 2,
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
        Echo Test
      </Typography>

      <TextField
        fullWidth
        label="Message"
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
        }}
        sx={{
          mb: 2,
        }}
      />

      <Button
        variant="contained"
        onClick={sendMessage}
        disabled={isLoading || !input.trim()}
      >
        {isLoading ? (
          <CircularProgress
            size={24}
            color="inherit"
          />
        ) : (
          "Send Message"
        )}
      </Button>

      {responseMessage && (
        <Alert
          severity="success"
          sx={{
            mt: 3,
          }}
        >
          Backend response: {responseMessage}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{
            mt: 3,
          }}
        >
          Error: {error}
        </Alert>
      )}
    </Box>
  );
}