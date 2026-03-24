export function toDateInputValue(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  return parsed.toISOString().split("T")[0];
}
