import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const IMAGE_EXTENSION_BY_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

export const MAX_VARIANT_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

function resolveMediaStorageRoot(): string {
  const configuredRoot = process.env.MEDIA_UPLOAD_DIR?.trim() || "public/uploads";
  return path.isAbsolute(configuredRoot)
    ? configuredRoot
    : path.join(process.cwd(), configuredRoot);
}

function resolveMediaPublicPrefix(): string {
  const configuredPrefix = process.env.MEDIA_PUBLIC_URL_PREFIX?.trim() || "/uploads";
  const normalized = configuredPrefix.startsWith("/")
    ? configuredPrefix
    : `/${configuredPrefix}`;
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

function toPosixPath(value: string): string {
  return value.replace(/\\/g, "/");
}

function inferExtension(mimeType: string): string | null {
  if (mimeType in IMAGE_EXTENSION_BY_MIME) {
    return IMAGE_EXTENSION_BY_MIME[mimeType as keyof typeof IMAGE_EXTENSION_BY_MIME];
  }

  return null;
}

export function isSupportedVariantImageMimeType(mimeType: string): boolean {
  return inferExtension(mimeType) !== null;
}

export async function persistVariantImageFile(input: {
  variantId: string;
  file: File;
}): Promise<{ url: string; absolutePath: string }> {
  const extension = inferExtension(input.file.type);
  if (!extension) {
    throw new Error("Unsupported image MIME type");
  }

  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;

  const relativePath = path.posix.join("variants", input.variantId, year, month, fileName);
  const storageRoot = resolveMediaStorageRoot();
  const absolutePath = path.join(storageRoot, ...relativePath.split("/"));

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });

  const bytes = await input.file.arrayBuffer();
  await fs.writeFile(absolutePath, Buffer.from(bytes));

  const publicPrefix = resolveMediaPublicPrefix();
  return {
    url: `${publicPrefix}/${relativePath}`,
    absolutePath,
  };
}

export async function removePersistedVariantImageFile(absolutePath: string): Promise<void> {
  await fs.unlink(absolutePath).catch(() => {});
}

export function resolveStoredVariantImageAbsolutePathFromUrl(url: string): string | null {
  const normalizedUrl = toPosixPath(url);
  const publicPrefix = resolveMediaPublicPrefix();
  if (!normalizedUrl.startsWith(`${publicPrefix}/`)) {
    return null;
  }

  const relativePath = normalizedUrl.slice(publicPrefix.length + 1);
  if (!relativePath) {
    return null;
  }

  return path.join(resolveMediaStorageRoot(), ...relativePath.split("/"));
}
