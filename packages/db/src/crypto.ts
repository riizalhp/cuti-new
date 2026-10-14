import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit standard for GCM
const PREFIX = "enc:";

function getEncryptionKey(): Buffer {
  const rawKey =
    process.env.APP_ENCRYPTION_KEY ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.JWT_SECRET ||
    "0f758b58a4057a3c2c95e66c35bfa27c3770c7d5da68e98de0b57aa2382624cd";
  return crypto.createHash("sha256").update(rawKey).digest();
}

/**
 * Encrypts a plaintext secret using AES-256-GCM.
 * Output format: enc:<iv_hex>:<auth_tag_hex>:<cipher_hex>
 */
export function encryptSecret(plainText: string): string {
  if (!plainText || typeof plainText !== "string") return "";
  if (plainText.startsWith(PREFIX)) return plainText; // Already encrypted

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.error("[crypto] Encryption error:", err);
    return plainText; // Safe fallback
  }
}

/**
 * Decrypts an AES-256-GCM encrypted secret.
 * Gracefully returns original text if not encrypted (backward-compatible) or on error.
 */
export function decryptSecret(cipherText: string): string {
  if (!cipherText || typeof cipherText !== "string") return "";
  if (!cipherText.startsWith(PREFIX)) return cipherText; // Plaintext legacy support

  try {
    const parts = cipherText.substring(PREFIX.length).split(":");
    if (parts.length !== 3) return cipherText;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.warn("[crypto] Decryption error, returning raw input:", err);
    return cipherText;
  }
}

/**
 * Generates a deterministic SHA-256 fingerprint hash.
 */
export function hashFingerprint(data: string | Record<string, any>): string {
  const content =
    typeof data === "string"
      ? data
      : JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash("sha256").update(content).digest("hex");
}
