"use client";

import { ProductDetailModal } from "@/components/products/product-detail-modal";

interface ExpiryProductDetailModalProps {
	productId: string | null;
	open: boolean;
	onClose: () => void;
}

export function ExpiryProductDetailModal({
	productId,
	open,
	onClose,
}: ExpiryProductDetailModalProps) {
	return (
		<ProductDetailModal productId={productId} open={open} onClose={onClose} />
	);
}
