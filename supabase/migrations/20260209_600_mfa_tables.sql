-- Migration 600: MFA (Multi-Factor Authentication) Tables
-- Agent: ZETA (Security & MFA)

CREATE TABLE IF NOT EXISTS user_mfa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  totp_secret TEXT NOT NULL,
  backup_codes TEXT[] NOT NULL DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT false,
  enabled_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_mfa_user ON user_mfa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mfa_enabled ON user_mfa(is_enabled) WHERE is_enabled = true;

ALTER TABLE user_mfa ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_mfa_self_access ON user_mfa FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_created ON rate_limit_events(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip ON rate_limit_events(ip_address, created_at);

ALTER TABLE rate_limit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY rate_limit_service_only ON rate_limit_events FOR ALL USING (false);

CREATE TABLE IF NOT EXISTS mfa_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mfa_audit_user ON mfa_audit_log(user_id, created_at);

ALTER TABLE mfa_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY mfa_audit_self_access ON mfa_audit_log FOR SELECT USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION update_user_mfa_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_mfa_updated_at_trigger ON user_mfa;
CREATE TRIGGER user_mfa_updated_at_trigger BEFORE UPDATE ON user_mfa FOR EACH ROW EXECUTE FUNCTION update_user_mfa_updated_at();

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mfa_pending') THEN
    ALTER TABLE users ADD COLUMN mfa_pending BOOLEAN DEFAULT false;
  END IF;
END $$;
