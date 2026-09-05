/**
 * Cryptographically Signed Admin Session Utilities
 * Uses Web Crypto API (supported in Edge Middleware and Node.js runtime)
 */

const SECRET_KEY_RAW =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.JWT_SECRET ||
  'cuti_admin_secure_secret_prod_key_2026_signature';

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET_KEY_RAW),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export interface AdminSessionData {
  id: string;
  name: string;
  email: string;
  role: string;
  exp?: number;
}

export async function signAdminSession(data: {
  id: string;
  name: string;
  email: string;
  role: string;
}): Promise<string> {
  const key = await getCryptoKey();
  const payload: AdminSessionData = {
    ...data,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  };

  const enc = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = btoa(payloadStr)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const signatureBytes = new Uint8Array(signatureBuffer);
  let binary = '';
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    binary += String.fromCharCode(signatureBytes[i]);
  }
  const signatureB64 = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${payloadB64}.${signatureB64}`;
}

export async function verifyAdminSession(
  token: string
): Promise<AdminSessionData | null> {
  if (!token || !token.includes('.')) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, signatureB64] = parts;
    if (!payloadB64 || !signatureB64) return null;

    const key = await getCryptoKey();
    const enc = new TextEncoder();

    // Decode base64url signature
    let b64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) {
      b64 += '=';
    }
    const sigBinStr = atob(b64);
    const sigBytes = new Uint8Array(sigBinStr.length);
    for (let i = 0; i < sigBinStr.length; i++) {
      sigBytes[i] = sigBinStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      enc.encode(payloadB64)
    );

    if (!isValid) return null;

    let payloadRaw = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    while (payloadRaw.length % 4 !== 0) {
      payloadRaw += '=';
    }
    const payloadJson = atob(payloadRaw);
    const payload: AdminSessionData = JSON.parse(payloadJson);

    if (!payload || payload.role !== 'ADMIN') return null;
    if (typeof payload.exp === 'number' && payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}
