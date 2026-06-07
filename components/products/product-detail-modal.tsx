"use client";

import { useEffect, useReducer } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { ROUTES } from "@/constants/routes";
import { getProductDetailAction } from "@/features/products/actions";
import type {
  ProductDetail,
  ProductMovementRow,
} from "@/features/products/types";
import {
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/lib/util/format-date-time";

import { ProductStatusChip } from "./product-status-chip";

interface ProductDetailModalProps {
  productId: string | null;
  open: boolean;
  onClose: () => void;
}

type ModalState =
  | { status: "idle"; data: null; error: null }
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: ProductDetail; error: null }
  | { status: "error"; data: null; error: string };

type ModalAction =
  | { type: "fetch" }
  | { type: "success"; data: ProductDetail }
  | { type: "error"; error: string }
  | { type: "reset" };

function modalReducer(_state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "fetch":
      return { status: "loading", data: null, error: null };
    case "success":
      return { status: "success", data: action.data, error: null };
    case "error":
      return { status: "error", data: null, error: action.error };
    case "reset":
      return { status: "idle", data: null, error: null };
    default:
      return { status: "idle", data: null, error: null };
  }
}

function formatMovementType(type: ProductMovementRow["movementType"]): string {
  switch (type) {
    case "receive":
      return "Receive";
    case "issue":
      return "Cut";
    case "adjustment":
      return "Adjust";
  }
}

function formatMovementQty(row: ProductMovementRow): string {
  const sign = row.movementType === "receive" ? "+" : "−";
  return `${sign}${row.quantity.toLocaleString()}`;
}

function MetaField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: "block", lineHeight: 1.4 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function ProductDetailModal({
  productId,
  open,
  onClose,
}: ProductDetailModalProps) {
  const [state, dispatch] = useReducer(modalReducer, {
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!open || !productId) {
      dispatch({ type: "reset" });
      return;
    }

    let cancelled = false;
    dispatch({ type: "fetch" });

    getProductDetailAction(productId).then((result) => {
      if (cancelled) return;
      if (result.success) {
        dispatch({ type: "success", data: result.data });
      } else {
        dispatch({ type: "error", error: result.error });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, productId]);

  const isLoading = state.status === "loading";
  const detail = state.status === "success" ? state.data : null;
  const error = state.status === "error" ? state.error : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {detail ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="div">
                {detail.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {detail.sku}
                {detail.size ? ` · ${detail.size}` : ""}
                {detail.categoryName ? ` · ${detail.categoryName}` : ""}
              </Typography>
            </Box>
            <ProductStatusChip status={detail.status} />
          </Stack>
        ) : (
          "Product detail"
        )}
      </DialogTitle>

      <DialogContent dividers>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {detail && !isLoading && !error && (
          <Stack spacing={3}>
            {/* Meta grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                gap: 2,
              }}
            >
              <MetaField label="Unit" value={detail.unit} />
              <MetaField
                label="Minimum stock"
                value={detail.minimumStock.toLocaleString()}
              />
              <MetaField label="Latest cost" value={detail.latestCost ?? "—"} />
              <MetaField
                label="Total balance"
                value={
                  <Typography
                    component="span"
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color:
                        detail.totalBalance === 0
                          ? "text.disabled"
                          : "success.main",
                    }}
                  >
                    {detail.totalBalance.toLocaleString()}
                  </Typography>
                }
              />
            </Box>

            {/* Lots */}
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                Lots
              </Typography>
              {detail.lots.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No lots recorded.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Lot No.</TableCell>
                      <TableCell>Received</TableCell>
                      <TableCell>Expiry</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Remaining</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail.lots.map((lot) => (
                      <TableRow key={lot.id}>
                        <TableCell sx={{ fontFamily: "monospace" }}>
                          {lot.lotNo}
                        </TableCell>
                        <TableCell>
                          {formatDisplayDate(lot.receivedDate)}
                        </TableCell>
                        <TableCell>
                          {formatDisplayDate(lot.expiryDate)}
                        </TableCell>
                        <TableCell align="right">
                          {lot.quantity.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {lot.remainingQty.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>

            <Divider />

            {/* Movements */}
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                Recent movements
              </Typography>
              {detail.recentMovements.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No movements yet.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>When</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Lot</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Balance</TableCell>
                      <TableCell>By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail.recentMovements.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          {formatDisplayDateTime(m.createdAt)}
                        </TableCell>
                        <TableCell>
                          {formatMovementType(m.movementType)}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace" }}>
                          {m.lotNo ?? "—"}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              m.movementType === "receive"
                                ? "success.main"
                                : "error.main",
                            fontWeight: 600,
                          }}
                        >
                          {formatMovementQty(m)}
                        </TableCell>
                        <TableCell align="right">
                          {m.balanceAfter.toLocaleString()}
                        </TableCell>
                        <TableCell>{m.createdByName ?? "System"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          color="error"
          variant="outlined"
          href={ROUTES.DASHBOARD.STOCK.CUT}
        >
          Cut stock
        </Button>
        <Button
          color="primary"
          variant="contained"
          href={ROUTES.DASHBOARD.STOCK.RECEIVE}
        >
          Receive stock
        </Button>
      </DialogActions>
    </Dialog>
  );
}
