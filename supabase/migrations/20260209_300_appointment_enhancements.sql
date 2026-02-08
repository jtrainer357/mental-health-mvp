-- Migration 20260209_300: Appointment Enhancements for Scheduling Production
-- Agent: GAMMA | Feature: Scheduling Production

-- Add new columns to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_type TEXT DEFAULT 'individual_therapy';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'in_person';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS room TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurring_group_id UUID;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurring_pattern TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Update status constraint to include new statuses
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('Scheduled', 'Confirmed', 'Checked-In', 'In Session', 'Completed', 'No-Show', 'Cancelled'));

-- Create appointment reminders table
CREATE TABLE IF NOT EXISTS appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h', '2h', 'custom')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  channel TEXT DEFAULT 'email' CHECK (channel IN ('email', 'sms', 'push')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for appointment_reminders
CREATE INDEX IF NOT EXISTS idx_reminders_appointment ON appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON appointment_reminders(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reminders_practice ON appointment_reminders(practice_id);

-- Create index for recurring appointments
CREATE INDEX IF NOT EXISTS idx_appointments_recurring_group ON appointments(recurring_group_id) WHERE recurring_group_id IS NOT NULL;

-- Enable RLS on appointment_reminders
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

-- Demo policy for appointment_reminders (FOR HACKATHON ONLY)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'demo_appointment_reminders_all'
  ) THEN
    CREATE POLICY "demo_appointment_reminders_all" ON appointment_reminders
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Comments for documentation
COMMENT ON TABLE appointment_reminders IS 'Stores reminder records for appointments. Actual sending is handled by a separate communications service.';
COMMENT ON COLUMN appointments.recurring_group_id IS 'UUID shared by all appointments in a recurring series';
COMMENT ON COLUMN appointments.recurring_pattern IS 'Pattern type: weekly, biweekly, monthly';
COMMENT ON COLUMN appointments.appointment_type IS 'Type of appointment with associated CPT code';
COMMENT ON COLUMN appointments.format IS 'in_person or telehealth';
