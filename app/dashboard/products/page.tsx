import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import { DataTablePagination } from "@/components/data-table";
import { HeaderPage } from "@/components/header-page";
import { ProductsTable } from "@/components/products/products-table";
import { ProductsToolbar } from "@/components/products/products-toolbar";
import { ROUTES } from "@/constants/routes";
import { getProductListService } from "@/features/products/service";
import {
  PRODUCT_SORT_FIELDS,
  PRODUCT_STATUS_FILTERS,
  type ProductListParams,
} from "@/features/products/types";
import { auth } from "@/lib/auth";
import {
  parseEnumParam,
  parsePagination,
  parseSearchText,
  parseSort,
  type RawSearchParams,
} from "@/lib/query/parse-search-params";

export const metadata: Metadata = {
  title: "Products | StockMS",
  description: "Browse, search, and inspect inventory products.",
};

// ─── Search param parsing ────────────────────────────────────────────────────

function parseProductListParams(raw: RawSearchParams): ProductListParams {
  const { page, limit } = parsePagination(raw, { limit: 10 });
  const { sort, dir } = parseSort(raw, {
    allowedFields: PRODUCT_SORT_FIELDS,
    defaultField: "name",
    defaultDir: "asc",
  });

  return {
    q: parseSearchText(raw),
    status: parseEnumParam(raw, "status", {
      allowedValues: PRODUCT_STATUS_FILTERS,
      defaultValue: "all",
    }),
    sort,
    dir,
    page,
    limit,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface ProductsPageProps {
  searchParams: Promise<RawSearchParams>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(ROUTES.LOGIN);
  }

  const params = parseProductListParams(await searchParams);
  const { items, total, page, limit } = await getProductListService(params);

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <HeaderPage
        title="Products"
        description={`${total.toLocaleString()} items in inventory`}
        showDashboardBtn={false}
        custombtn={
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<DownloadIcon />}
              disabled
            >
              Export
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              href={`${ROUTES.DASHBOARD.PRODUCTS}/new`}
            >
              Add product
            </Button>
          </Box>
        }
      />

      <ProductsToolbar q={params.q} status={params.status} />

      <Card>
        <CardContent sx={{ p: 0 }}>
          <ProductsTable items={items} sort={params.sort} dir={params.dir} />
          <DataTablePagination page={page} limit={limit} total={total} />
        </CardContent>
      </Card>
    </main>
  );
}
