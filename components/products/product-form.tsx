"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useSnackbar } from "@/components/feedback/snackbar-provider";
import { ROUTES } from "@/constants/routes";
import {
	createProductAction,
	updateProductAction,
} from "@/features/products/actions";
import type {
	CategoryOption,
	CreateProductInput,
	ProductFormField,
} from "@/features/products/types";

export interface ProductFormState {
	sku: string;
	name: string;
	categoryId: string;
	unit: string;
	minimumStock: string;
	size: string;
	latestCost: string;
	note: string;
	isActive: boolean;
}

type FormState = ProductFormState;

interface ProductFormProps {
	categories: CategoryOption[];
	productId?: string;
	initial?: FormState;
}

type FieldErrors = Partial<Record<ProductFormField, string>>;

const INITIAL_STATE: FormState = {
	sku: "",
	name: "",
	categoryId: "",
	unit: "",
	minimumStock: "",
	size: "",
	latestCost: "",
	note: "",
	isActive: true,
};

/** Client-side mirror of the server validation, for fast feedback. */
function validate(state: FormState): FieldErrors {
	const errors: FieldErrors = {};

	if (!state.name.trim()) errors.name = "กรุณากรอกชื่อสินค้า";
	if (!state.categoryId) errors.categoryId = "กรุณาเลือกหมวดหมู่";
	if (!state.unit.trim()) errors.unit = "กรุณากรอกหน่วยนับ";

	if (state.minimumStock.trim()) {
		const value = Number(state.minimumStock);
		if (!Number.isInteger(value) || value < 0) {
			errors.minimumStock = "ต้องเป็นจำนวนเต็มไม่ติดลบ";
		}
	}

	if (state.latestCost.trim()) {
		const value = Number(state.latestCost);
		if (Number.isNaN(value) || value < 0) {
			errors.latestCost = "ต้องเป็นตัวเลขไม่ติดลบ";
		}
	}

	return errors;
}

function toCreateInput(state: FormState): CreateProductInput {
	const trimmedCost = state.latestCost.trim();
	return {
		sku: state.sku.trim(),
		name: state.name.trim(),
		categoryId: state.categoryId,
		unit: state.unit.trim(),
		minimumStock: state.minimumStock.trim() ? Number(state.minimumStock) : 0,
		size: state.size.trim() || null,
		latestCost: trimmedCost || null,
		note: state.note.trim() || null,
		isActive: state.isActive,
	};
}

export function ProductForm({
	categories,
	productId,
	initial,
}: ProductFormProps) {
	const router = useRouter();
	const { show } = useSnackbar();
	const isEdit = Boolean(productId);

	const [state, setState] = useState<FormState>(initial ?? INITIAL_STATE);
	const [errors, setErrors] = useState<FieldErrors>({});
	const [dirty, setDirty] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
		setState((prev) => ({ ...prev, [key]: value }));
		setDirty(true);
		if (key in errors) {
			setErrors((prev) => {
				const next = { ...prev };
				delete next[key as ProductFormField];
				return next;
			});
		}
	}

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();

		const validationErrors = validate(state);
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		setSubmitting(true);
		try {
			const input = toCreateInput(state);
			const result =
				isEdit && productId
					? await updateProductAction(productId, input)
					: await createProductAction(input);
			if (result.success) {
				show(
					"success",
					isEdit
						? `อัปเดตสินค้า ${result.data.sku} แล้ว`
						: `สร้างสินค้า ${result.data.sku} แล้ว`,
				);
				router.push(ROUTES.DASHBOARD.PRODUCTS);
				router.refresh();
				return;
			}

			if (result.field) {
				setErrors({ [result.field]: result.error });
			} else {
				show("error", result.error);
			}
		} catch {
			show("error", "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
		} finally {
			setSubmitting(false);
		}
	}

	function handleCancel() {
		if (dirty) {
			setConfirmOpen(true);
			return;
		}
		router.push(ROUTES.DASHBOARD.PRODUCTS);
	}

	function leaveForm() {
		setConfirmOpen(false);
		router.push(ROUTES.DASHBOARD.PRODUCTS);
	}

	return (
		<Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 880 }}>
			{/* Basic information */}
			<Card sx={{ mb: 2 }}>
				<CardContent>
					<Typography variant="h6" sx={{ mb: 2 }}>
						Basic information
					</Typography>

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
							gap: 2,
						}}
					>
						<TextField
							label="Product code (SKU)"
							value={state.sku}
							onChange={(e) => setField("sku", e.target.value)}
							error={Boolean(errors.sku)}
							helperText={errors.sku ?? "เว้นว่างเพื่อให้ระบบสร้างให้อัตโนมัติ"}
							fullWidth
						/>

						<TextField
							label="Product name"
							required
							value={state.name}
							onChange={(e) => setField("name", e.target.value)}
							error={Boolean(errors.name)}
							helperText={errors.name}
							placeholder="เช่น ข้าวหอมมะลิ 5 กก."
							fullWidth
						/>

						<TextField
							label="Category"
							required
							select
							value={state.categoryId}
							onChange={(e) => setField("categoryId", e.target.value)}
							error={Boolean(errors.categoryId)}
							helperText={errors.categoryId}
							fullWidth
						>
							{categories.map((category) => (
								<MenuItem key={category.id} value={category.id}>
									{category.name}
								</MenuItem>
							))}
						</TextField>

						<TextField
							label="Unit"
							required
							value={state.unit}
							onChange={(e) => setField("unit", e.target.value)}
							error={Boolean(errors.unit)}
							helperText={errors.unit}
							placeholder="เช่น ถุง, ขวด, กล่อง"
							fullWidth
						/>

						<TextField
							label="Reorder level"
							type="number"
							value={state.minimumStock}
							onChange={(e) => setField("minimumStock", e.target.value)}
							error={Boolean(errors.minimumStock)}
							helperText={
								errors.minimumStock ?? "แจ้งเตือนเมื่อสต็อกต่ำกว่าจำนวนนี้ (ค่าเริ่มต้น 0)"
							}
							slotProps={{ htmlInput: { min: 0, step: 1 } }}
							fullWidth
						/>

						<TextField
							label="Size"
							value={state.size}
							onChange={(e) => setField("size", e.target.value)}
							placeholder="เช่น 5 กก., 700 มล."
							fullWidth
						/>

						<TextField
							label="Latest cost"
							type="number"
							value={state.latestCost}
							onChange={(e) => setField("latestCost", e.target.value)}
							error={Boolean(errors.latestCost)}
							helperText={errors.latestCost ?? "ราคาทุนต่อหน่วย (ไม่บังคับ)"}
							slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
							fullWidth
						/>

						<Box sx={{ gridColumn: { sm: "1 / -1" } }}>
							<TextField
								label="Description"
								value={state.note}
								onChange={(e) => setField("note", e.target.value)}
								placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
								multiline
								minRows={3}
								fullWidth
							/>
						</Box>
					</Box>
				</CardContent>
			</Card>

			{/* Status */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant="h6" sx={{ mb: 1 }}>
						Status
					</Typography>
					<RadioGroup
						value={state.isActive ? "active" : "inactive"}
						onChange={(e) => setField("isActive", e.target.value === "active")}
					>
						<FormControlLabel
							value="active"
							control={<Radio />}
							label="Active — พร้อมใช้งานในการทำรายการ"
						/>
						<FormControlLabel
							value="inactive"
							control={<Radio />}
							label="Inactive — ซ่อนจากฟอร์มทำรายการ"
						/>
					</RadioGroup>
				</CardContent>
			</Card>

			{/* Actions */}
			<Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
				<Button
					variant="outlined"
					color="inherit"
					onClick={handleCancel}
					disabled={submitting}
				>
					Cancel
				</Button>
				<Button type="submit" variant="contained" disabled={submitting}>
					{submitting
						? "Saving…"
						: isEdit
							? "Save changes"
							: "Save product"}
				</Button>
			</Stack>

			{/* Cancel confirm */}
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
				<DialogTitle>ยืนยันการยกเลิก</DialogTitle>
				<DialogContent>
					<DialogContentText>
						ข้อมูลที่กรอกไว้จะหายไป ต้องการออกจากหน้านี้หรือไม่?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmOpen(false)}>กรอกต่อ</Button>
					<Button color="error" onClick={leaveForm}>
						ออกจากหน้านี้
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
