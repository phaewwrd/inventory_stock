"use client";

import { useEffect, useRef, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type {
  MovementStatusFilter,
  MovementTypeFilter,
} from "@/features/stock/types";

interface MovementLogToolbarProps {
  q: string;
  type: MovementTypeFilter;
  status: MovementStatusFilter;
}

const TYPE_OPTIONS: Array<{ value: MovementTypeFilter; label: string }> = [
  { value: "all", label: "All types" },
  { value: "receive", label: "Receive" },
  { value: "issue", label: "Cut" },
];

const STATUS_OPTIONS: Array<{ value: MovementStatusFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "unapproved", label: "Rejected" },
];

const SEARCH_DEBOUNCE_MS = 350;

export function MovementLogToolbar({
  q,
  type,
  status,
}: MovementLogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(q);
  const isUserInputRef = useRef(false);

  useEffect(() => {
    if (!isUserInputRef.current) {
      setSearchInput(q);
    }
    isUserInputRef.current = false;
  }, [q]);

  useEffect(() => {
    if (searchInput === q) return;
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput.trim()) {
        params.set("q", searchInput.trim());
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
      isUserInputRef.current = true;
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput, q, pathname, router, searchParams]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ mb: 2, alignItems: "center", flexWrap: "wrap" }}
    >
      <TextField
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="ค้นหาด้วยสินค้า, lot, reference…"
        size="small"
        sx={{ maxWidth: 360, flex: 1, minWidth: 240 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        select
        label="Type"
        value={type}
        onChange={(e) => updateParam("type", e.target.value)}
        size="small"
        sx={{ minWidth: 140 }}
      >
        {TYPE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Status"
        value={status}
        onChange={(e) => updateParam("status", e.target.value)}
        size="small"
        sx={{ minWidth: 140 }}
      >
        {STATUS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
