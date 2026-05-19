import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const SALT = "sme-ai-openrouter-v1";

function deriveKey(secret: string): Buffer {
  return scryptSync(secret, SALT, 32);
}

function encryptionSecret(): string {
  const fromEnv = process.env.AI_ENCRYPTION_KEY;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AI_ENCRYPTION_KEY must be set in production (min 32 chars)");
  }
  return "dev-only-ai-encryption-key-change-me!!";
}

export function encryptApiKey(plaintext: string): string {
  const key = deriveKey(encryptionSecret());
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptApiKey(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted API key payload");
  }
  const key = deriveKey(encryptionSecret());
  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const data = Buffer.from(dataB64, "base64url");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
