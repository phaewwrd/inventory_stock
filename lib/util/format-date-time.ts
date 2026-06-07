import dayjs from "dayjs";

export function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return "—";
  return dayjs(value).format("DD MMM YYYY");
}

export function formatDisplayDateTime(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return dayjs(value).format("DD MMM YYYY, HH:mm");
}

export function toDateString(value: Date | string): string {
  return dayjs(value).format("YYYY-MM-DD");
}

export function toDateTimeString(value: Date | string): string {
  return dayjs(value).toISOString();
}
