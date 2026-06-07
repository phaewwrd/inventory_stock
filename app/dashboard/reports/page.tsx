"use client";

import { useEffect } from "react";
import dayjs from "dayjs";
import { Alert, Box, CircularProgress, Stack, Tab, Tabs } from "@mui/material";
import { useShallow } from "zustand/react/shallow";
import type {
  DateRangePreset,
  ExpiryReportResponse,
  ProductReportResponse,
  SerializedExpiryReport,
  SerializedProductReport,
  SerializedStockIssuedReport,
  SerializedStockReceivedReport,
  StockIssuedReportResponse,
  StockReceivedReportResponse,
} from "@/features/reports/types";
import { useReportsStore } from "@/features/reports/store";
import { KPIGrid } from "@/components/reports/kpi-card";
import { DateRangeFilter } from "@/components/reports/date-range-filter";
import {
  BarChartComponent,
  ChartCard,
  LineChartComponent,
  PieChartComponent,
} from "@/components/reports/charts";
import type { Column } from "@/components/reports/data-table";
import { DataTable } from "@/components/reports/data-table";
import {
  exportExpiryReportToExcel,
  exportProductReportToExcel,
  exportStockIssuedReportToExcel,
  exportStockReceivedReportToExcel,
} from "@/lib/excel-export";
import { HeaderPage } from "@/components/header-page";

function formatDate(value: Date | string, pattern: string) {
  return dayjs(value).format(pattern);
}

export default function ReportsPage() {
  const {
    activeTab,
    error,
    isInitializing,
    productReport,
    expiryReport,
    receivedReport,
    issuedReport,
    productFilter,
    receivedFilter,
    issuedFilter,
    setActiveTab,
    setProductPreset,
    setProductCustomDateRange,
    setReceivedPreset,
    setReceivedCustomDateRange,
    setIssuedPreset,
    setIssuedCustomDateRange,
    loadProductReport,
    loadExpiryReport,
    loadReceivedReport,
    loadIssuedReport,
    initializeReports,
  } = useReportsStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      error: state.error,
      isInitializing: state.isInitializing,
      productReport: state.productReport,
      expiryReport: state.expiryReport,
      receivedReport: state.receivedReport,
      issuedReport: state.issuedReport,
      productFilter: state.productFilter,
      receivedFilter: state.receivedFilter,
      issuedFilter: state.issuedFilter,
      setActiveTab: state.setActiveTab,
      setProductPreset: state.setProductPreset,
      setProductCustomDateRange: state.setProductCustomDateRange,
      setReceivedPreset: state.setReceivedPreset,
      setReceivedCustomDateRange: state.setReceivedCustomDateRange,
      setIssuedPreset: state.setIssuedPreset,
      setIssuedCustomDateRange: state.setIssuedCustomDateRange,
      loadProductReport: state.loadProductReport,
      loadExpiryReport: state.loadExpiryReport,
      loadReceivedReport: state.loadReceivedReport,
      loadIssuedReport: state.loadIssuedReport,
      initializeReports: state.initializeReports,
    })),
  );

  useEffect(() => {
    void initializeReports();
  }, [initializeReports]);

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <HeaderPage
        title="Reports & Analytics"
        description="Track products, expiry, stock received, and stock issued trends"
        showDashboardBtn={false}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Products" value="products" />
        <Tab label="Expiry" value="expiry" />
        <Tab label="Stock Received" value="received" />
        <Tab label="Stock Issued" value="issued" />
      </Tabs>

      {isInitializing && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isInitializing && activeTab === "products" && productReport && (
        <ProductReportTab
          report={productReport}
          preset={productFilter.preset}
          customStart={productFilter.customStart}
          customEnd={productFilter.customEnd}
          onPresetChange={setProductPreset}
          onCustomDateChange={setProductCustomDateRange}
          onApply={loadProductReport}
        />
      )}

      {!isInitializing && activeTab === "expiry" && expiryReport && (
        <ExpiryReportTab report={expiryReport} onRefresh={loadExpiryReport} />
      )}

      {!isInitializing && activeTab === "received" && receivedReport && (
        <StockReceivedReportTab
          report={receivedReport}
          preset={receivedFilter.preset}
          customStart={receivedFilter.customStart}
          customEnd={receivedFilter.customEnd}
          onPresetChange={setReceivedPreset}
          onCustomDateChange={setReceivedCustomDateRange}
          onApply={loadReceivedReport}
        />
      )}

      {!isInitializing && activeTab === "issued" && issuedReport && (
        <StockIssuedReportTab
          report={issuedReport}
          preset={issuedFilter.preset}
          customStart={issuedFilter.customStart}
          customEnd={issuedFilter.customEnd}
          onPresetChange={setIssuedPreset}
          onCustomDateChange={setIssuedCustomDateRange}
          onApply={loadIssuedReport}
        />
      )}
    </main>
  );
}

// ─── Product Report Tab ──────────────────────────────────────────────────────

interface ProductReportTabProps {
  report: ProductReportResponse;
  preset: DateRangePreset;
  customStart: Date | null;
  customEnd: Date | null;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomDateChange: (start: Date | null, end: Date | null) => void;
  onApply: () => void;
}

function ProductReportTab({
  report,
  preset,
  customStart,
  customEnd,
  onPresetChange,
  onCustomDateChange,
  onApply,
}: ProductReportTabProps) {
  const productColumns: Column<SerializedProductReport>[] = [
    { id: "productName", label: "Product Name" },
    { id: "sku", label: "SKU" },
    { id: "category", label: "Category" },
    {
      id: "totalReceived",
      label: "Received",
      align: "right",
      format: (val) => Number(val).toLocaleString(),
    },
    {
      id: "totalIssued",
      label: "Issued",
      align: "right",
      format: (val) => Number(val).toLocaleString(),
    },
    {
      id: "currentStock",
      label: "Current Stock",
      align: "right",
      format: (val) => Number(val).toLocaleString(),
    },
    {
      id: "totalValue",
      label: "Value",
      align: "right",
      format: (val) =>
        `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
  ];

  const categoryChartData = report.summary.categoryBreakdown.map((cat) => ({
    name: cat.category,
    value: cat.count,
  }));

  const topProductsChartData = report.summary.topProducts.map((p) => ({
    productName: p.productName,
    quantity: p.quantity,
  }));

  return (
    <Stack spacing={3}>
      <DateRangeFilter
        preset={preset}
        onPresetChange={onPresetChange}
        customStartDate={customStart}
        customEndDate={customEnd}
        onCustomDateChange={onCustomDateChange}
        onApply={onApply}
      />

      <KPIGrid kpis={report.kpis} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        <ChartCard title="Products by Category">
          <PieChartComponent
            data={categoryChartData}
            colors={[
              "#185FA5",
              "#639922",
              "#BA7517",
              "#E24B4A",
              "#378ADD",
              "#8A919E",
            ]}
            showLabel={false}
          />
        </ChartCard>

        <ChartCard title="Top 10 Products by Stock Level">
          <BarChartComponent
            data={topProductsChartData}
            xKey="productName"
            bars={[{ key: "quantity", color: "#185FA5", name: "Quantity" }]}
            horizontal
          />
        </ChartCard>
      </Box>

      <DataTable<SerializedProductReport>
        title="Product Details"
        columns={productColumns}
        data={report.products}
        onExport={() =>
          exportProductReportToExcel(report.products, report.dateRange)
        }
      />
    </Stack>
  );
}

// ─── Expiry Report Tab ───────────────────────────────────────────────────────

interface ExpiryReportTabProps {
  report: ExpiryReportResponse;
  onRefresh: () => void;
}

function ExpiryReportTab({ report }: ExpiryReportTabProps) {
  const expiryColumns: Column<SerializedExpiryReport>[] = [
    { id: "lotNo", label: "Lot No" },
    { id: "productName", label: "Product Name" },
    { id: "sku", label: "SKU" },
    {
      id: "expiryDate",
      label: "Expiry Date",
      format: (val) => formatDate(String(val), "MMM DD, YYYY"),
    },
    {
      id: "daysUntilExpiry",
      label: "Days Until Expiry",
      align: "right",
    },
    {
      id: "status",
      label: "Status",
      format: (val) => String(val).toUpperCase(),
    },
    {
      id: "remainingQty",
      label: "Qty",
      align: "right",
      format: (val) => Number(val).toLocaleString(),
    },
    {
      id: "totalValue",
      label: "Value",
      align: "right",
      format: (val) =>
        `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
  ];

  const statusChartData = report.summary.statusBreakdown.map((s) => ({
    name: s.status,
    value: s.count,
  }));

  const statusValueChartData = report.summary.statusBreakdown.map((s) => ({
    status: s.status,
    value: s.value,
  }));

  return (
    <Stack spacing={3}>
      <KPIGrid kpis={report.kpis} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        <ChartCard title="Items by Expiry Status">
          <PieChartComponent
            data={statusChartData}
            colors={["#E24B4A", "#BA7517", "#FFC107", "#639922"]}
            showLabel={false}
          />
        </ChartCard>

        <ChartCard title="Value by Expiry Status">
          <BarChartComponent
            data={statusValueChartData}
            xKey="status"
            bars={[{ key: "value", color: "#185FA5", name: "Value ($)" }]}
          />
        </ChartCard>
      </Box>

      <DataTable<SerializedExpiryReport>
        title="Expiry Details"
        columns={expiryColumns}
        data={report.items}
        onExport={() => exportExpiryReportToExcel(report.items)}
      />
    </Stack>
  );
}

// ─── Stock Received Report Tab ───────────────────────────────────────────────

interface StockReceivedReportTabProps {
  report: StockReceivedReportResponse;
  preset: DateRangePreset;
  customStart: Date | null;
  customEnd: Date | null;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomDateChange: (start: Date | null, end: Date | null) => void;
  onApply: () => void;
}

function StockReceivedReportTab({
  report,
  preset,
  customStart,
  customEnd,
  onPresetChange,
  onCustomDateChange,
  onApply,
}: StockReceivedReportTabProps) {
  const receivedColumns: Column<SerializedStockReceivedReport>[] = [
    {
      id: "date",
      label: "Date",
      format: (val) => formatDate(String(val), "MMM DD, YYYY HH:mm"),
    },
    { id: "productName", label: "Product" },
    { id: "sku", label: "SKU" },
    { id: "lotNo", label: "Lot No" },
    {
      id: "quantity",
      label: "Quantity",
      align: "right",
      format: (val) => Number(val).toLocaleString(),
    },
    {
      id: "unitCost",
      label: "Unit Cost",
      align: "right",
      format: (val) =>
        `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    {
      id: "totalCost",
      label: "Total Cost",
      align: "right",
      format: (val) =>
        `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    { id: "createdByName", label: "Created By" },
  ];

  const topProductsData =
    report.summary.topReceivedProducts?.map((p) => ({
      productName: p.productName,
      quantity: p.quantity,
    })) || [];

  return (
    <Stack spacing={3}>
      <DateRangeFilter
        preset={preset}
        onPresetChange={onPresetChange}
        customStartDate={customStart}
        customEndDate={customEnd}
        onCustomDateChange={onCustomDateChange}
        onApply={onApply}
      />

      <KPIGrid kpis={report.kpis} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        <ChartCard title="Stock Movement Timeline">
          <LineChartComponent
            data={report.summary.timeSeries || []}
            xKey="date"
            lines={[
              { key: "received", color: "#639922", name: "Received" },
              { key: "issued", color: "#E24B4A", name: "Issued" },
              { key: "balance", color: "#185FA5", name: "Balance" },
            ]}
          />
        </ChartCard>

        <ChartCard title="Top 10 Received Products">
          <BarChartComponent
            data={topProductsData}
            xKey="productName"
            bars={[{ key: "quantity", color: "#639922", name: "Quantity" }]}
            horizontal
          />
        </ChartCard>
      </Box>

      <DataTable<SerializedStockReceivedReport>
        title="Stock Received Transactions"
        columns={receivedColumns}
        data={report.items}
        onExport={() =>
          exportStockReceivedReportToExcel(report.items, report.dateRange)
        }
      />
    </Stack>
  );
}

// ─── Stock Issued Report Tab ─────────────────────────────────────────────────

interface StockIssuedReportTabProps {
  report: StockIssuedReportResponse;
  preset: DateRangePreset;
  customStart: Date | null;
  customEnd: Date | null;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomDateChange: (start: Date | null, end: Date | null) => void;
  onApply: () => void;
}

function StockIssuedReportTab({
  report,
  preset,
  customStart,
  customEnd,
  onPresetChange,
  onCustomDateChange,
  onApply,
}: StockIssuedReportTabProps) {
  const issuedColumns: Column<SerializedStockIssuedReport>[] = [
    {
      id: "date",
      label: "Date",
      format: (val) => formatDate(String(val), "MMM DD, YYYY HH:mm"),
    },
    { id: "productName", label: "Product" },
    { id: "sku", label: "SKU" },
    { id: "lotNo", label: "Lot No" },
    {
      id: "quantity",
      label: "Quantity",
      align: "right",
      format: (val) => Number(val).toLocaleString(),
    },
    {
      id: "balanceAfter",
      label: "Balance After",
      align: "right",
      format: (val) => Number(val).toLocaleString(),
    },
    { id: "remark", label: "Remark" },
    { id: "createdByName", label: "Created By" },
  ];

  const topProductsData =
    report.summary.topIssuedProducts?.map((p) => ({
      productName: p.productName,
      quantity: p.quantity,
    })) || [];

  return (
    <Stack spacing={3}>
      <DateRangeFilter
        preset={preset}
        onPresetChange={onPresetChange}
        customStartDate={customStart}
        customEndDate={customEnd}
        onCustomDateChange={onCustomDateChange}
        onApply={onApply}
      />

      <KPIGrid kpis={report.kpis} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        <ChartCard title="Stock Movement Timeline">
          <LineChartComponent
            data={report.summary.timeSeries || []}
            xKey="date"
            lines={[
              { key: "received", color: "#639922", name: "Received" },
              { key: "issued", color: "#E24B4A", name: "Issued" },
              { key: "balance", color: "#185FA5", name: "Balance" },
            ]}
          />
        </ChartCard>

        <ChartCard title="Top 10 Issued Products">
          <BarChartComponent
            data={topProductsData}
            xKey="productName"
            bars={[{ key: "quantity", color: "#E24B4A", name: "Quantity" }]}
            horizontal
          />
        </ChartCard>
      </Box>

      <DataTable<SerializedStockIssuedReport>
        title="Stock Issued Transactions"
        columns={issuedColumns}
        data={report.items}
        onExport={() =>
          exportStockIssuedReportToExcel(report.items, report.dateRange)
        }
      />
    </Stack>
  );
}
