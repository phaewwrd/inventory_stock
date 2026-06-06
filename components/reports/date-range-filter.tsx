"use client";

import { useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Stack,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { DateRangePreset } from "@/features/reports/types";

interface DateRangeFilterProps {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  customStartDate: Date | null;
  customEndDate: Date | null;
  onCustomDateChange: (start: Date | null, end: Date | null) => void;
  onApply: () => void;
}

const presetButtons: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
  { value: "custom", label: "Custom" },
];

export function DateRangeFilter({
  preset,
  onPresetChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
  onApply,
}: DateRangeFilterProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <ButtonGroup
            variant="outlined"
            size="small"
            sx={{ flexWrap: "wrap" }}
          >
            {presetButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={preset === btn.value ? "contained" : "outlined"}
                onClick={() => onPresetChange(btn.value)}
              >
                {btn.label}
              </Button>
            ))}
          </ButtonGroup>

          {preset === "custom" && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <DatePicker
                  label="Start Date"
                  value={customStartDate}
                  onChange={(date) => onCustomDateChange(date, customEndDate)}
                  slotProps={{
                    textField: { size: "small", fullWidth: true },
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={customEndDate}
                  onChange={(date) => onCustomDateChange(customStartDate, date)}
                  minDate={customStartDate || undefined}
                  slotProps={{
                    textField: { size: "small", fullWidth: true },
                  }}
                />
              </Stack>
            </LocalizationProvider>
          )}

          <Button
            variant="contained"
            onClick={onApply}
            disabled={
              preset === "custom" && (!customStartDate || !customEndDate)
            }
          >
            Apply Filter
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
