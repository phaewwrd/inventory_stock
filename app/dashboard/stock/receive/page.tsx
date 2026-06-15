import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { HeaderPage } from "@/components/header-page";
import { ReceiveForm } from "@/components/stock/receive-form";
import { StockTransactionTabs } from "@/components/stock/stock-transaction-tabs";
import { ROUTES } from "@/constants/routes";
import { getProductForPickerService } from "@/features/stock/service";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Receive stock | StockMS",
  description: "Submit a stock-receive request for approval.",
};

interface ReceiveStockPageProps {
  searchParams: Promise<{ productId?: string }>;
}

export default async function ReceiveStockPage({
  searchParams,
}: ReceiveStockPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(ROUTES.LOGIN);
  }

  const { productId } = await searchParams;
  const initialProduct = productId
    ? await getProductForPickerService(productId)
    : null;

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <HeaderPage
        title="Receive stock"
        description="Submit a stock-receive request for approval"
        showDashboardBtn={false}
      />

      <StockTransactionTabs />
      <ReceiveForm initialProduct={initialProduct} />
    </main>
  );
}
