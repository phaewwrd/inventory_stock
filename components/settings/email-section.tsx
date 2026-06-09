"use client";

import { authClient } from "@/lib/auth-client";
import { useState, useTransition } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";

export function EmailSection({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState(currentEmail);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = email.trim().toLowerCase();

    if (!trimmed || trimmed === currentEmail.toLowerCase()) {
      setErrorMessage("Please enter a different email address.");
      return;
    }

    setErrorMessage("");
    setMessage("");

    startTransition(async () => {
      const { error } = await authClient.changeEmail({
        newEmail: trimmed,
        callbackURL: "/dashboard/settings",
      });

      if (error) {
        setErrorMessage(error.message ?? "Failed to change email.");
        return;
      }

      setMessage("Email updated successfully.");
    });
  }

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: "1px solid #e5e7eb",
        boxShadow: "none",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
          Email Address
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Change the email used to sign in to your account
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            sx={{ mb: 2 }}
          />

          <Alert severity="info" sx={{ mb: 3 }}>
            Your email is used to sign in. Changes take effect immediately for
            this internal system.
          </Alert>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={
                isPending ||
                email.trim().toLowerCase() === currentEmail.toLowerCase()
              }
            >
              {isPending ? "Updating..." : "Update Email"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
