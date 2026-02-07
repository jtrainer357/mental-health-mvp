-- Mental Health MVP - Soft Delete Support
-- Created: 2026-02-07
-- This migration adds soft delete capability to key tables

-- ============================================
-- ADD deleted_at COLUMN TO KEY TABLES
-- ============================================

-- Patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Reviews (also a key table)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ============================================
-- SOFT DELETE TRIGGER FUNCTION
-- ============================================

-- Function to perform soft delete instead of hard delete
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Instead of deleting, set deleted_at to current timestamp
  EXECUTE format('UPDATE %I.%I SET deleted_at = NOW() WHERE id = $1', TG_TABLE_SCHEMA, TG_TABLE_NAME) USING OLD.id;
  -- Return NULL to prevent the actual DELETE
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE INDEXES FOR SOFT DELETE QUERIES
-- ============================================

-- Partial indexes to efficiently query non-deleted records
CREATE INDEX IF NOT EXISTS idx_patients_not_deleted ON patients(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_not_deleted ON appointments(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_not_deleted ON messages(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_not_deleted ON invoices(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_not_deleted ON reviews(id) WHERE deleted_at IS NULL;

-- ============================================
-- UPDATE RLS POLICIES TO EXCLUDE SOFT-DELETED
-- ============================================

-- Drop existing demo policies and recreate with soft delete filtering
-- Note: For production, you would have proper tenant-scoped policies

-- Patients
DROP POLICY IF EXISTS "demo_patients_all" ON patients;
CREATE POLICY "demo_patients_all" ON patients
  FOR ALL
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

-- Appointments
DROP POLICY IF EXISTS "demo_appointments_all" ON appointments;
CREATE POLICY "demo_appointments_all" ON appointments
  FOR ALL
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

-- Messages
DROP POLICY IF EXISTS "demo_messages_all" ON messages;
CREATE POLICY "demo_messages_all" ON messages
  FOR ALL
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

-- Invoices
DROP POLICY IF EXISTS "demo_invoices_all" ON invoices;
CREATE POLICY "demo_invoices_all" ON invoices
  FOR ALL
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

-- Reviews
DROP POLICY IF EXISTS "demo_reviews_all" ON reviews;
CREATE POLICY "demo_reviews_all" ON reviews
  FOR ALL
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

-- ============================================
-- ADMIN POLICIES FOR VIEWING DELETED RECORDS
-- ============================================

-- Create policies for admin access to include deleted records
-- In production, these would be restricted to admin roles

DROP POLICY IF EXISTS "admin_patients_include_deleted" ON patients;
CREATE POLICY "admin_patients_include_deleted" ON patients
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin_appointments_include_deleted" ON appointments;
CREATE POLICY "admin_appointments_include_deleted" ON appointments
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin_messages_include_deleted" ON messages;
CREATE POLICY "admin_messages_include_deleted" ON messages
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin_invoices_include_deleted" ON invoices;
CREATE POLICY "admin_invoices_include_deleted" ON invoices
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin_reviews_include_deleted" ON reviews;
CREATE POLICY "admin_reviews_include_deleted" ON reviews
  FOR SELECT
  USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to restore a soft-deleted record
CREATE OR REPLACE FUNCTION restore_deleted(
  p_table_name TEXT,
  p_record_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  EXECUTE format('UPDATE %I SET deleted_at = NULL WHERE id = $1', p_table_name) USING p_record_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to permanently delete soft-deleted records older than a retention period
CREATE OR REPLACE FUNCTION purge_deleted_records(
  p_table_name TEXT,
  p_retention_days INTEGER DEFAULT 90
) RETURNS INTEGER AS $$
DECLARE
  rows_deleted INTEGER;
BEGIN
  EXECUTE format(
    'DELETE FROM %I WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL ''%s days''',
    p_table_name,
    p_retention_days
  );
  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  RETURN rows_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
