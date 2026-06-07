import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type PaginationParams,
  type SortDirection,
  type SortParams,
} from "./types";

// ─── Primitive parsers ───────────────────────────────────────────────────────

export type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseIntegerInRange(
  raw: string | undefined,
  options: { min: number; max: number; fallback: number },
): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return options.fallback;
  const floored = Math.floor(n);
  if (floored < options.min) return options.fallback;
  if (floored > options.max) return options.max;
  return floored;
}

// ─── Public parsers ──────────────────────────────────────────────────────────

export function parsePagination(
  raw: RawSearchParams,
  defaults: { page?: number; limit?: number } = {},
): PaginationParams {
  const fallbackPage = defaults.page ?? 1;
  const fallbackLimit = defaults.limit ?? DEFAULT_PAGE_SIZE;

  return {
    page: parseIntegerInRange(firstValue(raw.page), {
      min: 1,
      max: Number.MAX_SAFE_INTEGER,
      fallback: fallbackPage,
    }),
    limit: parseIntegerInRange(firstValue(raw.limit), {
      min: 1,
      max: MAX_PAGE_SIZE,
      fallback: fallbackLimit,
    }),
  };
}

export function parseSort<TField extends string>(
  raw: RawSearchParams,
  options: {
    allowedFields: Array<TField>;
    defaultField: TField;
    defaultDir?: SortDirection;
  },
): SortParams<TField> {
  const rawSort = firstValue(raw.sort) as TField | undefined;
  const rawDir = firstValue(raw.dir);

  return {
    sort:
      rawSort && options.allowedFields.includes(rawSort)
        ? rawSort
        : options.defaultField,
    dir: rawDir === "desc" ? "desc" : (options.defaultDir ?? "asc"),
  };
}

export function parseEnumParam<TValue extends string>(
  raw: RawSearchParams,
  key: string,
  options: {
    allowedValues: Array<TValue>;
    defaultValue: TValue;
  },
): TValue {
  const value = firstValue(raw[key]) as TValue | undefined;
  return value && options.allowedValues.includes(value)
    ? value
    : options.defaultValue;
}

export function parseSearchText(
  raw: RawSearchParams,
  key = "q",
  maxLength = 100,
): string {
  const value = firstValue(raw[key])?.trim() ?? "";
  return value.slice(0, maxLength);
}
