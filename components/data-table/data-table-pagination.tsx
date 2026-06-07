"use client";

import { Stack, Typography, Box } from "@mui/material";
import Pagination from "@mui/material/Pagination";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface DataTablePaginationProps {
  page: number;
  limit: number;
  total: number;
  pageParamKey?: string;
}

export function DataTablePagination({
  page,
  limit,
  total,
  pageParamKey = "page",
}: DataTablePaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageCount = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  function handleChange(_: unknown, value: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 1) {
      params.delete(pageParamKey);
    } else {
      params.set(pageParamKey, String(value));
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Stack
      direction={"row"}
      spacing={2}
      sx={{
        mx: 2,
        mt: 2,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Showing {start.toLocaleString()}–{end.toLocaleString()} of{" "}
        {total.toLocaleString()}
      </Typography>
      <Box>
        <Pagination
          count={pageCount}
          page={page}
          onChange={handleChange}
          color="primary"
          shape="rounded"
          size="small"
          showFirstButton
          showLastButton
        />
      </Box>
    </Stack>
  );
}
