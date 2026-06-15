"use client";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

import { useSnackbar } from "@/components/feedback/snackbar-provider";
import {
	searchProductsAction,
	submitCutAction,
} from "@/features/stock/actions";
import type {
	CutFormField,
	CutInput,
	ProductPickerOption,
} from "@/features/stock/types";

interface CutFormProps {
	initialProduct: ProductPickerOption | null;
}

interface FormState {
	quantity: string;
	reason: string;
	referenceNo: string;
	remark: string;
}

type FieldErrors = Partial<Record<CutFormField, string>>;

const EMPTY_FIELDS: FormState = {
	quantity: "",
	reason: "Sale / Dispense",
	referenceNo: "",
	remark: "",
};

const CUT_REASON_OPTIONS = [
	"Sale / Dispense",
	"Internal transfer",
	"Damage / Spoilage",
	"Expired disposal",
	"Adjustment",
];

const SEARCH_DEBOUNCE_MS = 300;
const PICKER_OPTION_LIMIT = 20;

function validate(
	product: ProductPickerOption | null,
	fields: FormState,
): FieldErrors {
	const errors: FieldErrors = {};
	if (!product) {
		errors.productId = "กรุณาเลือกสินค้า";
		return errors;
	}

	const qty = Number(fields.quantity);
	if (!fields.quantity.trim() || !Number.isInteger(qty) || qty <= 0) {
		errors.quantity = "จำนวนต้องเป็นจำนวนเต็มมากกว่า 0";
	} else if (qty > product.totalBalance) {
		errors.quantity = `สต็อกไม่พอ คงเหลือ ${product.totalBalance.toLocaleString()}`;
	}

	return errors;
}

function toCutInput(productId: string, fields: FormState): CutInput {
	return {
		productId,
		quantity: Number(fields.quantity),
		reason: fields.reason || null,
		referenceNo: fields.referenceNo.trim() || null,
		remark: fields.remark.trim() || null,
	};
}

export function CutForm({ initialProduct }: CutFormProps) {
	const { show } = useSnackbar();

	const [product, setProduct] = useState<ProductPickerOption | null>(
		initialProduct,
	);
	const [options, setOptions] = useState<ProductPickerOption[]>(
		initialProduct ? [initialProduct] : [],
	);
	const [inputValue, setInputValue] = useState("");
	const [searching, setSearching] = useState(false);

	const [fields, setFields] = useState<FormState>(EMPTY_FIELDS);
	const [errors, setErrors] = useState<FieldErrors>({});
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const query = inputValue.trim();
		let cancelled = false;
		setSearching(true);
		const handle = setTimeout(async () => {
			const results = await searchProductsAction(query);
			if (!cancelled) {
				setOptions(results.slice(0, PICKER_OPTION_LIMIT));
				setSearching(false);
			}
		}, SEARCH_DEBOUNCE_MS);

		return () => {
			cancelled = true;
			clearTimeout(handle);
		};
	}, [inputValue]);

	function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
		setFields((prev) => ({ ...prev, [key]: value }));
		if (key === "quantity" && errors.quantity) {
			setErrors((prev) => ({ ...prev, quantity: undefined }));
		}
	}

	const quantityNumber = Number(fields.quantity) || 0;
	const currentBalance = product?.totalBalance ?? 0;
	const projectedBalance = currentBalance - quantityNumber;

	function handleReview() {
		const validationErrors = validate(product, fields);
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}
		setConfirmOpen(true);
	}

	async function handleSubmit() {
		if (!product) return;
		setSubmitting(true);
		try {
			const result = await submitCutAction(toCutInput(product.id, fields));
			if (result.success) {
				setConfirmOpen(false);
				show("success", "ส่งคำขอตัดสต็อกแล้ว รออนุมัติ");
				setFields(EMPTY_FIELDS);
				setErrors({});
				return;
			}

			setConfirmOpen(false);
			if (result.field === "productId" || result.field === "quantity") {
				setErrors({ [result.field]: result.error });
			} else {
				show("error", result.error);
			}
		} catch {
			setConfirmOpen(false);
			show("error", "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
		} finally {
			setSubmitting(false);
		}
	}

	const exceedsBalance = Boolean(product) && quantityNumber > currentBalance;

	return (
		<Box sx={{ maxWidth: 760 }}>
			{/* Product picker */}
			<Card sx={{ mb: 2 }}>
				<CardContent>
					<Typography variant="h6" sx={{ mb: 2 }}>
						Selected product
					</Typography>
					<Autocomplete
						value={product}
						options={options}
						loading={searching}
						onInputChange={(_e, value) => setInputValue(value)}
						onChange={(_e, value) => {
							setProduct(value);
							if (errors.productId) {
								setErrors((prev) => ({ ...prev, productId: undefined }));
							}
						}}
						isOptionEqualToValue={(option, value) => option.id === value.id}
						getOptionLabel={(option) => `${option.sku} · ${option.name}`}
						renderInput={(params) => (
							<TextField
								{...params}
								label="ค้นหาสินค้า (รหัส / ชื่อ)"
								error={Boolean(errors.productId)}
								helperText={errors.productId}
								slotProps={{
									...params.slotProps,
									input: {
										...params.slotProps.input,
										endAdornment: (
											<>
												{searching ? (
													<CircularProgress color="inherit" size={18} />
												) : null}
												{params.slotProps.input.endAdornment}
											</>
										),
									},
								}}
							/>
						)}
					/>

					{product && (
						<Stack
							direction="row"
							spacing={1}
							sx={{ mt: 1.5, alignItems: "center" }}
						>
							<Typography variant="body2" color="text.secondary">
								Available:
							</Typography>
							<Chip
								label={`${currentBalance.toLocaleString()} ${product.unit}`}
								size="small"
								color={currentBalance > 0 ? "default" : "error"}
							/>
						</Stack>
					)}
				</CardContent>
			</Card>

			{/* Cut details */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant="h6" sx={{ mb: 2 }}>
						Cut stock details
					</Typography>

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
							gap: 2,
						}}
					>
						<Box sx={{ gridColumn: { sm: "1 / -1" } }}>
							<TextField
								label="Quantity to cut"
								required
								type="number"
								value={fields.quantity}
								onChange={(e) => setField("quantity", e.target.value)}
								error={Boolean(errors.quantity) || exceedsBalance}
								helperText={
									errors.quantity ??
									(exceedsBalance
										? `เกินยอดคงเหลือ ${(quantityNumber - currentBalance).toLocaleString()}`
										: product
											? `${currentBalance.toLocaleString()} → ${Math.max(projectedBalance, 0).toLocaleString()} ${product.unit}`
											: "เลือกสินค้าก่อนเพื่อดูยอดคงเหลือ")
								}
								slotProps={{ htmlInput: { min: 1, step: 1 } }}
								fullWidth
							/>
						</Box>

						<TextField
							label="Reason"
							required
							select
							value={fields.reason}
							onChange={(e) => setField("reason", e.target.value)}
							fullWidth
						>
							{CUT_REASON_OPTIONS.map((reason) => (
								<MenuItem key={reason} value={reason}>
									{reason}
								</MenuItem>
							))}
						</TextField>

						<TextField
							label="Reference"
							value={fields.referenceNo}
							onChange={(e) => setField("referenceNo", e.target.value)}
							placeholder="ไม่บังคับ (เช่น เลขที่ออเดอร์)"
							fullWidth
						/>

						<Box sx={{ gridColumn: { sm: "1 / -1" } }}>
							<TextField
								label="Notes"
								value={fields.remark}
								onChange={(e) => setField("remark", e.target.value)}
								placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
								multiline
								minRows={2}
								fullWidth
							/>
						</Box>
					</Box>
				</CardContent>
			</Card>

			<Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
				<Button
					variant="contained"
					color="error"
					onClick={handleReview}
					disabled={exceedsBalance}
				>
					Review &amp; submit
				</Button>
			</Stack>

			{/* Confirm dialog */}
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
				<DialogTitle>ยืนยันคำขอตัดสต็อก</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={1}>
						<ConfirmRow label="สินค้า" value={product?.name ?? "—"} />
						<ConfirmRow label="รหัส" value={product?.sku ?? "—"} />
						<ConfirmRow
							label="จำนวน"
							value={`−${quantityNumber.toLocaleString()} ${product?.unit ?? ""}`}
						/>
						<ConfirmRow label="เหตุผล" value={fields.reason} />
						<ConfirmRow
							label="ยอดหลังอนุมัติ"
							value={`${currentBalance.toLocaleString()} → ${projectedBalance.toLocaleString()}`}
						/>
					</Stack>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ display: "block", mt: 2 }}
					>
						คำขอจะถูกส่งให้ผู้จัดการ/เจ้าของอนุมัติก่อน ยอดจึงจะถูกตัด
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmOpen(false)} disabled={submitting}>
						กลับไปแก้ไข
					</Button>
					<Button
						variant="contained"
						color="error"
						onClick={handleSubmit}
						disabled={submitting}
					>
						{submitting ? "กำลังส่ง…" : "ส่งเพื่อขออนุมัติ"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
	return (
		<Stack direction="row" sx={{ justifyContent: "space-between" }}>
			<Typography variant="body2" color="text.secondary">
				{label}
			</Typography>
			<Typography variant="body2" sx={{ fontWeight: 500 }}>
				{value}
			</Typography>
		</Stack>
	);
}
