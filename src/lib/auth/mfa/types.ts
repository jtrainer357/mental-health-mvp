/**
 * MFA (Multi-Factor Authentication) Types.
 */

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
  action: MFAAuditAction;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  failure_reason: string | null;
  created_at: string;
}

export type MFAAuditAction =
  | "setup_initiated"
  | "setup_completed"
  | "verify_success"
  | "verify_failed"
  | "backup_used"
  | "backup_regenerated"
  | "disabled";

export type MFASetupStep = "intro" | "qr" | "verify" | "backup" | "complete";

export interface MFASetupState {
  step: MFASetupStep;
  secret?: string;
  qrCodeDataUrl?: string;
  backupCodes?: string[];
  error?: string;
  isLoading?: boolean;
}

export type MFAVerifyMode = "totp" | "backup";

export interface MFAVerifyState {
  mode: MFAVerifyMode;
  code: string;
  error?: string;
  isLoading?: boolean;
  attemptsRemaining?: number;
  lockedUntil?: string;
}

export interface MFASetupInitResponse {
  qrCodeDataUrl: string;
  secret: string;
  message: string;
}

export interface MFASetupVerifyRequest {
  code: string;
  secret: string;
}

export interface MFASetupVerifyResponse {
  success: boolean;
  backupCodes?: string[];
  message: string;
}

export interface MFAVerifyRequest {
  code: string;
  useBackupCode?: boolean;
}

export interface MFAVerifyResponse {
  success: boolean;
  message: string;
  attemptsRemaining?: number;
  lockedUntil?: string;
}

export interface MFADisableRequest {
  code: string;
}

export interface MFADisableResponse {
  success: boolean;
  message: string;
}

export interface MFARegenerateBackupRequest {
  code: string;
}

export interface MFARegenerateBackupResponse {
  success: boolean;
  backupCodes?: string[];
  message: string;
}

export interface MFAStatus {
  isEnabled: boolean;
  enabledAt?: string;
  backupCodesRemaining: number;
  lastVerifiedAt?: string;
}

export const MFA_CONFIG = {
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  BACKUP_CODE_COUNT: 10,
  BACKUP_CODE_LENGTH: 8,
} as const;
