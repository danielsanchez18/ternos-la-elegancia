export const mediumDateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
});

export const longDateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "long",
});

export const numberFormatter = new Intl.NumberFormat("en-US");

export function parseDateValue(
  value: Date | string | null | undefined
): Date | null {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatMediumDate(
  value: Date | string | null | undefined
): string {
  const parsed = parseDateValue(value);
  return parsed ? mediumDateFormatter.format(parsed) : "--";
}

export function formatLongDate(value: Date | string | null | undefined): string {
  const parsed = parseDateValue(value);
  return parsed ? longDateFormatter.format(parsed) : "--";
}

export function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ");
}
