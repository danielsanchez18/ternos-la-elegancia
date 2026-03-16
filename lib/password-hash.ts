import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashDomainPassword(plainTextPassword: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plainTextPassword, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyDomainPassword(
  plainTextPassword: string,
  storedHash: string
): boolean {
  const [salt, expectedHash] = storedHash.split(":");

  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = scryptSync(plainTextPassword, salt, 64).toString("hex");

  return timingSafeEqual(
    Buffer.from(actualHash, "hex"),
    Buffer.from(expectedHash, "hex")
  );
}
