"use client";

import { authClient } from "@/lib/auth-client";
import { useState, useTransition } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";

export function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [revokeOthers, setRevokeOthers] = useState(true);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage("New password must differ from the current one.");
      return;
    }

    startTransition(async () => {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: revokeOthers,
      });

      if (error) {
        setErrorMessage(error.message ?? "Failed to change password.");
        return;
      }

      setMessage("Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    });
  }

  function strength(password: string) {
    if (!password) return null;

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1)
      return {
        label: "Weak",
        value: 20,
        color: "error",
      };

    if (score <= 2)
      return {
        label: "Fair",
        value: 40,
        color: "warning",
      };

    if (score <= 3)
      return {
        label: "Good",
        value: 60,
        color: "info",
      };

    if (score <= 4)
      return {
        label: "Strong",
        value: 80,
        color: "success",
      };

    return {
      label: "Very Strong",
      value: 100,
      color: "success",
    };
  }

  const passwordStrength = strength(newPassword);

  const passwordMismatch =
    confirmPassword.length > 0 && confirmPassword !== newPassword;

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
          Password
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Current password required. Minimum 8 characters.
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
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            sx={{ mb: 1 }}
          />

          {passwordStrength && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress
                variant="determinate"
                value={passwordStrength.value}
                color={
                  passwordStrength.color as
                    | "error"
                    | "warning"
                    | "info"
                    | "success"
                }
                sx={{
                  height: 8,
                  borderRadius: 999,
                }}
              />

              <Typography
                variant="caption"
                color={`${passwordStrength.color}.main`}
                sx={{ mt: 0.5 }}
              >
                {passwordStrength.label}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            error={passwordMismatch}
            helperText={passwordMismatch ? "Passwords do not match" : ""}
            sx={{ mb: 3 }}
          />

          <Card
            variant="outlined"
            sx={{
              mb: 3,
              bgcolor: "grey.50",
            }}
          >
            <FormControlLabel
              sx={{
                m: 0,
                p: 2,
                width: "100%",
                alignItems: "flex-start",
              }}
              control={
                <Checkbox
                  checked={revokeOthers}
                  onChange={(e) => setRevokeOthers(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Sign out other devices
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Revoke all active sessions except this one (recommended)
                  </Typography>
                </Box>
              }
            />
          </Card>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button type="submit" variant="contained" disabled={isPending}>
              {isPending ? "Changing..." : "Change Password"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
