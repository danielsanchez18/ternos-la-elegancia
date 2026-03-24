const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "short",
  timeStyle: "short",
});

export function parseDateValue(
  value: Date | string | null | undefined
): Date | null {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value: Date | string | null | undefined): string {
  const parsed = parseDateValue(value);
  return parsed ? dateFormatter.format(parsed) : "--";
}

export function formatDateTime(
  value: Date | string | null | undefined
): string {
  const parsed = parseDateValue(value);
  return parsed ? dateTimeFormatter.format(parsed) : "--";
}

export function statusChipClasses(
  isPositive: boolean,
  variant: "default" | "table" = "default"
) {
  if (variant === "table") {
    return isPositive
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : "border-stone-500/20 bg-stone-500/10 text-stone-300";
  }

  return isPositive
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
    : "border-white/8 bg-white/[0.03] text-stone-300";
}
