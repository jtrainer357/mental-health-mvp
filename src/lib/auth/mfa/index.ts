/**
 * MFA (Multi-Factor Authentication) Module.
 */

export {
  generateTOTPSecret,
  generateQRCode,
  verifyTOTPCode,
  generateBackupCodes,
  hashBackupCode,
  hashBackupCodes,
  verifyBackupCode,
  formatBackupCode,
  formatBackupCodes,
  type TOTPSecret,
  type BackupCodeVerificationResult,
} from "./totp";

export * from "./types";
