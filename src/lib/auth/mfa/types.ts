/**
 * MFA Type Definitions
 */

export interface TOTPSecret {
  secret: string;
  uri: string;
}

export interface UserMFA {
  id: string;
  user_id: string;
  totp_secret: string;
  backup_codes: string[];
  is_enabled: boolean;
  enabled_at: string | null;
  last_verified_at: string | null;
  failed_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface MFAAuditLog {
  id: string;
  user_id: string;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  failure_reason: string | null;
  created_at: string;
}

export type MFASetupStep = "intro" | "qr" | "verify" | "backup";

export type MFAVerifyMode = "totp" | "backup";

export interface MFAStatus {
  isEnabled: boolean;
  isPending: boolean;
  enabledAt: string | null;
  backupCodesRemaining: number;
}

export interface MFASetupResponse {
  qrCodeDataUrl: string;
  secret: string;
  message: string;
}

export interface MFAVerifyRequest {
  code: string;
  useBackupCode?: boolean;
}

export interface MFAVerifyResponse {
  success: boolean;
  message: string;
  backupCodes?: string[];
  attemptsRemaining?: number;
  lockedUntil?: string;
}

export interface BackupCodeVerificationResult {
  valid: boolean;
  remaining: string[];
}

export const MFA_CONFIG = {
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  BACKUP_CODE_COUNT: 10,
  BACKUP_CODE_LENGTH: 8,
  TOTP_PERIOD: 30,
  TOTP_DIGITS: 6,
  TOTP_ALGORITHM: "SHA1" as const,
  ISSUER: "Tebra Mental Health",
} as const;
