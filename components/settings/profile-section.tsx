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

export function ProfileSection({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    setError("");
    setMessage("");

    startTransition(async () => {
      const { error } = await authClient.updateUser({
        name: trimmed,
      });

      if (error) {
        setError(error.message ?? "Failed to update name.");
        return;
      }

      setMessage("Display name updated successfully.");
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
          Profile
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Update your display name visible across the system
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            slotProps={{
              htmlInput: {
                maxLength: 100,
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={isPending || name.trim() === currentName}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
