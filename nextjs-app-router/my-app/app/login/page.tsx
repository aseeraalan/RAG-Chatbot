"use client";

import { FormEvent, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";


type TokenResponse = {
  access_token: string;
  token_type: string;
};


export default function LoginPage() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);


  async function handleLogin(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setIsLoading(true);
    setMessage("");
    setError("");


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: username,
            password: password,
          }),
        }
      );


      if (!response.ok) {

        const data = await response.json();

        throw new Error(
          data.detail || "Login failed"
        );
      }


      const data: TokenResponse =
        await response.json();


      sessionStorage.setItem(
        "access_token",
        data.access_token
      );


      setMessage(
        "Login successful! Access token stored."
      );

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
        maxWidth: 450,
        mx: "auto",
        mt: 8,
        px: 3,
      }}
    >

      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 1,
          fontWeight: "bold",
        }}
      >
        Login
      </Typography>


      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Log in to access protected API routes.
      </Typography>


      <Box
        component="form"
        onSubmit={handleLogin}
      >

        <Stack spacing={2}>

          <TextField
            label="Username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}
            required
            fullWidth
          />


          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            required
            fullWidth
          />


          <Button
            type="submit"
            variant="contained"
            disabled={
              isLoading ||
              username.trim() === "" ||
              password.trim() === ""
            }
          >

            {isLoading ? (
              <CircularProgress
                size={24}
                color="inherit"
              />
            ) : (
              "Login"
            )}

          </Button>

        </Stack>

      </Box>


      {message && (

        <Alert
          severity="success"
          sx={{ mt: 3 }}
        >
          {message}
        </Alert>

      )}


      {error && (

        <Alert
          severity="error"
          sx={{ mt: 3 }}
        >
          {error}
        </Alert>

      )}

    </Box>
  );
}