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

export default function ContactPage() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        pt: 6,
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
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            color="primary"
            gutterBottom
          >
            Contact Page
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Enter your information below to contact us.
          </Typography>

          <Stack spacing={3}>
            <TextField
              label="Your name"
              placeholder="Enter your name"
              fullWidth
            />

            <TextField
              label="Email address"
              placeholder="Enter your email"
              type="email"
              fullWidth
            />

            <TextField
              label="Message"
              placeholder="Enter your message"
              multiline
              rows={4}
              fullWidth
            />
          </Stack>
        </CardContent>

        <CardActions sx={{ p: 4, pt: 0 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Button variant="contained" color="primary">
              Submit
            </Button>

            <Button
              component={Link}
              href="/"
              variant="outlined"
              color="secondary"
            >
              Go to Home
            </Button>

            <Button
              component={Link}
              href="/about"
              variant="text"
              color="primary"
            >
              Go to About
            </Button>
          </Stack>
        </CardActions>
      </Card>
    </Box>
  );
}