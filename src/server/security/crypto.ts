import { createHmac, randomBytes, createHash, timingSafeEqual, createCipheriv, createDecipheriv } from "crypto";

const ENCRYPTION_KEY = process.env.INTEGRATION_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || "dev-only-key-change-me";

export function hashSecret(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const raw = `atlas_${randomBytes(32).toString("hex")}`;
  const prefix = raw.slice(0, 12);
  return { raw, prefix, hash: hashSecret(raw) };
}

export function signWebhookPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expected = signWebhookPayload(payload, secret);
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/** Simple AES-256-GCM encryption for integration credentials (server-only). */
export function encryptCredentials(plaintext: string): string {
  const key = createHash("sha256").update(ENCRYPTION_KEY).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptCredentials(ciphertext: string): string {
  const key = createHash("sha256").update(ENCRYPTION_KEY).digest();
  const buf = Buffer.from(ciphertext, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return phone.startsWith("+") ? `+${digits}` : digits;
}
