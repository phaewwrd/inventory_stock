"use client";

import dayjs, { type Dayjs } from "dayjs";
import { Button, ButtonGroup, Card, CardContent, Stack } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
  const startDateValue = customStartDate ? dayjs(customStartDate) : null;
  const endDateValue = customEndDate ? dayjs(customEndDate) : null;

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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <DatePicker
                  label="Start Date"
                  value={startDateValue}
                  onChange={(date: Dayjs | null) =>
                    onCustomDateChange(
                      date ? date.toDate() : null,
                      customEndDate,
                    )
                  }
                  slotProps={{
                    textField: { size: "small", fullWidth: true },
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={endDateValue}
                  onChange={(date: Dayjs | null) =>
                    onCustomDateChange(
                      customStartDate,
                      date ? date.toDate() : null,
                    )
                  }
                  minDate={startDateValue ?? undefined}
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
