/**
 * TOTP (Time-based One-Time Password) MFA Infrastructure.
 * Implements RFC 6238 TOTP with backup codes for HIPAA-compliant authentication.
 */

import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

const ISSUER = "Tebra Mental Health";

const TOTP_CONFIG = {
  algorithm: "SHA1" as const,
  digits: 6,
  period: 30,
};

const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 8;
const BACKUP_CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export interface TOTPSecret {
  secret: string;
  uri: string;
}

export function generateTOTPSecret(email: string): TOTPSecret {
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: TOTP_CONFIG.algorithm,
    digits: TOTP_CONFIG.digits,
    period: TOTP_CONFIG.period,
    secret,
  });

  return {
    secret: secret.base32,
    uri: totp.toString(),
  };
}

export async function generateQRCode(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    width: 250,
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });
}

export function verifyTOTPCode(secret: string, code: string): boolean {
  const sanitizedCode = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(sanitizedCode)) return false;

  try {
    const totp = new OTPAuth.TOTP({
      issuer: ISSUER,
      algorithm: TOTP_CONFIG.algorithm,
      digits: TOTP_CONFIG.digits,
      period: TOTP_CONFIG.period,
      secret: OTPAuth.Secret.fromBase32(secret),
    });
    const delta = totp.validate({ token: sanitizedCode, window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}

function generateSingleBackupCode(): string {
  const array = new Uint8Array(BACKUP_CODE_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((byte) => BACKUP_CODE_CHARS[byte % BACKUP_CODE_CHARS.length])
    .join("");
}

export function generateBackupCodes(): string[] {
  const codes = new Set<string>();
  while (codes.size < BACKUP_CODE_COUNT) {
    codes.add(generateSingleBackupCode());
  }
  return Array.from(codes);
}

export async function hashBackupCode(code: string): Promise<string> {
  const normalizedCode = code.toUpperCase().replace(/[\s-]/g, "");
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedCode);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map(hashBackupCode));
}

export interface BackupCodeVerificationResult {
  valid: boolean;
  remaining: string[];
}

export async function verifyBackupCode(
  storedHashes: string[],
  code: string
): Promise<BackupCodeVerificationResult> {
  const codeHash = await hashBackupCode(code);
  const index = storedHashes.findIndex((hash) => hash === codeHash);
  if (index === -1) return { valid: false, remaining: storedHashes };
  const remaining = [...storedHashes.slice(0, index), ...storedHashes.slice(index + 1)];
  return { valid: true, remaining };
}

export function formatBackupCode(code: string): string {
  if (code.length !== BACKUP_CODE_LENGTH) return code;
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export function formatBackupCodes(codes: string[]): string[] {
  return codes.map(formatBackupCode);
}
