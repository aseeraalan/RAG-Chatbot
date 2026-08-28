"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";


export default function SignupPage() {

  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);


  async function handleSignup(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setMessage("");
    setError("");


    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }


    setIsLoading(true);


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/auth/signup",
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
          data.detail || "Signup failed"
        );
      }


      const data = await response.json();

      setMessage(data.message);


      setTimeout(() => {
        router.push("/login");
      }, 2000);


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
        Sign Up
      </Typography>


      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Create an account to access protected API routes.
      </Typography>


      <Box
        component="form"
        onSubmit={handleSignup}
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


          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
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
              password.trim() === "" ||
              confirmPassword.trim() === ""
            }
          >

            {isLoading ? (
              <CircularProgress
                size={24}
                color="inherit"
              />
            ) : (
              "Sign Up"
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