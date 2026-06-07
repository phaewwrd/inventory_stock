"use client";

import { useEffect, useRef, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import { Chip, InputAdornment, Stack, TextField } from "@mui/material";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProductStatusFilter } from "@/features/products/types";

interface ProductsToolbarProps {
  q: string;
  status: ProductStatusFilter;
}

interface FilterChipConfig {
  value: ProductStatusFilter;
  label: string;
}

const FILTER_CHIPS: Array<FilterChipConfig> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "low_stock", label: "Low stock" },
  { value: "near_expiry", label: "Near expiry" },
  { value: "expired", label: "Expired" },
  { value: "out_of_stock", label: "Out of stock" },
];

const SEARCH_DEBOUNCE_MS = 350;

export function ProductsToolbar({ q, status }: ProductsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(q);
  const isUserInputRef = useRef(false);

  // Sync local input when URL `q` changes externally (e.g. back button)
  useEffect(() => {
    if (!isUserInputRef.current) {
      setSearchInput(q);
    }
    isUserInputRef.current = false;
  }, [q]);

  // Debounce search input → URL
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

  function handleStatusChange(next: ProductStatusFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("status");
    } else {
      params.set("status", next);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Stack
        direction={"row"}
        spacing={1.5}
        sx={{ alignItems: { xs: "stretch", sm: "center" } }}
      >
        <TextField
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, code, lot/batch…"
          size="small"
          sx={{ width: "350px" }}
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

        {FILTER_CHIPS.map((chip) => {
          const active = status === chip.value;
          return (
            <Chip
              key={chip.value}
              label={chip.label}
              clickable
              color={active ? "primary" : "default"}
              variant={active ? "filled" : "outlined"}
              sx={{ backgroundColor: active ? "primary.main" : "background.paper" }}
              onClick={() => handleStatusChange(chip.value)}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}
