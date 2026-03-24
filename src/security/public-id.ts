const NUMERIC_ID_REGEX = /^[1-9]\d*$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ParsedEntityIdentifier =
  | { kind: "numeric"; numericId: number }
  | { kind: "public"; publicId: string };

export function parseEntityIdentifier(value: string): ParsedEntityIdentifier | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (NUMERIC_ID_REGEX.test(trimmed)) {
    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isSafeInteger(parsed) && parsed > 0) {
      return { kind: "numeric", numericId: parsed };
    }
    return null;
  }

  if (UUID_REGEX.test(trimmed)) {
    return { kind: "public", publicId: trimmed.toLowerCase() };
  }

  return null;
}

export function isUuidLike(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}
