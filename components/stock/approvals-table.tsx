"use client";

import { useMemo, useState } from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useRouter } from "next/navigation";

import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@/components/data-table";
import { useSnackbar } from "@/components/feedback/snackbar-provider";
import {
  approveMovementAction,
  rejectMovementAction,
} from "@/features/stock/actions";
import type { PendingMovement } from "@/features/stock/types";
import { formatDisplayDate } from "@/lib/util/format-date-time";

interface ApprovalsTableProps {
  items: PendingMovement[];
}

export function ApprovalsTable({ items }: ApprovalsTableProps) {
  const router = useRouter();
  const { show } = useSnackbar();

  const [approveTarget, setApproveTarget] = useState<PendingMovement | null>(
    null,
  );
  const [rejectTarget, setRejectTarget] = useState<PendingMovement | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function confirmApprove() {
    if (!approveTarget) return;
    setSubmitting(true);
    try {
      const result = await approveMovementAction(approveTarget.id);
      if (result.success) {
        show("success", `อนุมัติ ${approveTarget.productName} แล้ว`);
        router.refresh();
      } else {
        show("error", result.error);
      }
    } catch {
      show("error", "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setApproveTarget(null);
      setSubmitting(false);
    }
  }

  async function confirmReject() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      setRejectError("กรุณาระบุเหตุผลในการปฏิเสธ");
      return;
    }
    setSubmitting(true);
    try {
      const result = await rejectMovementAction(
        rejectTarget.id,
        rejectReason.trim(),
      );
      if (result.success) {
        show("success", `ปฏิเสธ ${rejectTarget.productName} แล้ว`);
        router.refresh();
      } else {
        show("error", result.error);
      }
    } catch {
      show("error", "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      closeReject();
      setSubmitting(false);
    }
  }

  function closeReject() {
    setRejectTarget(null);
    setRejectReason("");
    setRejectError("");
  }

  const columns = useMemo<ColumnDef<PendingMovement>[]>(
    () => [
      {
        id: "product",
        label: "Product",
        render: (row) => (
          <>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {row.productName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: "monospace" }}
            >
              {row.productSku}
            </Typography>
          </>
        ),
      },
      {
        id: "quantity",
        label: "Quantity",
        align: "right",
        render: (row) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "success.main" }}
          >
            +{row.quantity.toLocaleString()} {row.unit}
          </Typography>
        ),
      },
      {
        id: "lot",
        label: "Lot / Batch",
        render: (row) => row.reqLotNo ?? "—",
      },
      {
        id: "expiry",
        label: "Expire",
        render: (row) => formatDisplayDate(row.reqExpiryDate),
      },
      {
        id: "reason",
        label: "Source",
        render: (row) => row.reason ?? "—",
      },
      {
        id: "requestedBy",
        label: "Requested by",
        render: (row) => (
          <>
            <Typography variant="body2">
              {row.requestedByName ?? "—"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDisplayDate(row.createdAt)}
            </Typography>
          </>
        ),
      },
      {
        id: "actions",
        label: "Actions",
        align: "right",
        render: (row) => (
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: "flex-end" }}
          >
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => setRejectTarget(row)}
            >
              Reject
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => setApproveTarget(row)}
            >
              Approve
            </Button>
          </Stack>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        items={items}
        columns={columns}
        getRowId={(row) => row.id}
        emptyMessage="ไม่มีรายการที่รออนุมัติ"
      />

      {/* Approve confirm */}
      <Dialog open={approveTarget !== null} onClose={() => setApproveTarget(null)}>
        <DialogTitle>ยืนยันการอนุมัติ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            อนุมัติรับ {approveTarget?.productName} จำนวน{" "}
            <strong>
              +{approveTarget?.quantity.toLocaleString()} {approveTarget?.unit}
            </strong>{" "}
            เข้าสต็อก? ยอดคงเหลือจะถูกอัปเดตทันที
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveTarget(null)} disabled={submitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={confirmApprove}
            disabled={submitting}
          >
            {submitting ? "กำลังอนุมัติ…" : "อนุมัติ"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject (reason required) */}
      <Dialog open={rejectTarget !== null} onClose={closeReject} fullWidth maxWidth="sm">
        <DialogTitle>ปฏิเสธรายการ</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            ปฏิเสธคำขอรับ {rejectTarget?.productName}? กรุณาระบุเหตุผล
          </DialogContentText>
          <TextField
            label="เหตุผลในการปฏิเสธ"
            required
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value);
              if (rejectError) setRejectError("");
            }}
            error={Boolean(rejectError)}
            helperText={rejectError}
            multiline
            minRows={2}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReject} disabled={submitting}>
            ยกเลิก
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmReject}
            disabled={submitting}
          >
            {submitting ? "กำลังปฏิเสธ…" : "ปฏิเสธ"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
