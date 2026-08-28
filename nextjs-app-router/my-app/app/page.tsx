"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        paddingTop: 6,
      }}
    >
      <Card
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 650,
          borderRadius: 4,
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            color="primary"
            gutterBottom
          >
            Home Page
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ marginBottom: 3 }}
          >
            This is the home page of my Next.js and Material UI app.
          </Typography>

          <TextField
            label="Your name"
            placeholder="Enter your name"
            fullWidth
          />
        </CardContent>

        <CardActions
          sx={{
            padding: 4,
            paddingTop: 0,
          }}
        >
          <Stack
            spacing={2}
            sx={{
              width: "100%",
            }}
          >
            {/* Authentication buttons */}
            <Stack
              direction="row"
              spacing={2}
              sx={{
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Button
                component={Link}
                href="/login"
                variant="contained"
                color="primary"
              >
                Login
              </Button>

              <Button
                component={Link}
                href="/signup"
                variant="outlined"
                color="primary"
              >
                Sign Up
              </Button>
            </Stack>

            {/* Existing navigation buttons */}
            <Stack
              direction="row"
              spacing={2}
              sx={{
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Button
                component={Link}
                href="/about"
                variant="contained"
                color="primary"
              >
                Go to About
              </Button>

              <Button
                component={Link}
                href="/contact"
                variant="outlined"
                color="secondary"
              >
                Go to Contact
              </Button>
            </Stack>
          </Stack>
        </CardActions>
      </Card>
    </Box>
  );
}