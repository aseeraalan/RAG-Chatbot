"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

export default function AboutPage() {
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
            About Page
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            This is the about page of my Next.js application.
          </Typography>

          <Typography variant="body1" color="text.secondary">
            This project uses the Next.js App Router, file-based routing,
            and Material UI components.
          </Typography>
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
            <Button
              component={Link}
              href="/"
              variant="contained"
              color="primary"
            >
              Go to Home
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
        </CardActions>
      </Card>
    </Box>
  );
}