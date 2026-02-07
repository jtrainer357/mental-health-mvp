-- Mental Health MVP - Clinical Observations Table
-- Created: 2026-02-07
-- This migration creates a flexible clinical observations table for vitals, labs, assessments

-- ============================================
-- CLINICAL OBSERVATIONS TABLE
-- ============================================
-- Flexible table for storing various types of clinical observations
-- including vitals, lab results, assessments, and screenings

CREATE TABLE IF NOT EXISTS clinical_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Observation Classification
  observation_type TEXT NOT NULL CHECK (observation_type IN ('vital', 'lab', 'assessment', 'screening', 'other')),

  -- Coding (supports LOINC or custom codes)
  code TEXT NOT NULL,                     -- LOINC code or custom identifier (e.g., '2093-3' for cholesterol)
  code_system TEXT DEFAULT 'custom',      -- 'loinc', 'snomed', 'custom', etc.
  name TEXT NOT NULL,                     -- Human-readable name (e.g., 'Total Cholesterol')

  -- Value (flexible JSONB for different data types)
  -- Examples:
  -- Numeric: {"value": 120, "unit": "mg/dL"}
  -- Coded: {"value": "positive", "code": "LA6576-8"}
  -- Range: {"low": 100, "high": 120, "unit": "mmHg"}
  -- Text: {"value": "Patient reports mild anxiety"}
  value JSONB NOT NULL,

  -- Reference Range (for comparison/flagging)
  -- Example: {"low": 100, "high": 199, "unit": "mg/dL", "interpretation": "normal"}
  reference_range JSONB,

  -- Interpretation
  interpretation TEXT CHECK (interpretation IN ('normal', 'abnormal', 'low', 'high', 'critical', 'positive', 'negative', 'inconclusive')),

  -- Status and Timing
  status TEXT NOT NULL DEFAULT 'final' CHECK (status IN ('preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error')),
  effective_date DATE NOT NULL,
  effective_time TIME,

  -- Recording Details
  recorded_by UUID,                       -- References users table when available
  recorded_by_name TEXT,                  -- Fallback name if user not in system
  method TEXT,                            -- How the observation was obtained
  body_site TEXT,                         -- Where on body (for vitals)
  device TEXT,                            -- Device used for measurement

  -- Additional Context
  notes TEXT,
  metadata JSONB DEFAULT '{}',            -- Additional flexible metadata

  -- Soft Delete Support
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Primary query patterns
CREATE INDEX idx_clinical_obs_patient ON clinical_observations(patient_id);
CREATE INDEX idx_clinical_obs_practice ON clinical_observations(practice_id);
CREATE INDEX idx_clinical_obs_type ON clinical_observations(observation_type);
CREATE INDEX idx_clinical_obs_effective_date ON clinical_observations(effective_date DESC);
CREATE INDEX idx_clinical_obs_code ON clinical_observations(code);

-- Composite indexes for common queries
CREATE INDEX idx_clinical_obs_patient_type ON clinical_observations(patient_id, observation_type);
CREATE INDEX idx_clinical_obs_patient_date ON clinical_observations(patient_id, effective_date DESC);
CREATE INDEX idx_clinical_obs_patient_code ON clinical_observations(patient_id, code);
CREATE INDEX idx_clinical_obs_practice_type_date ON clinical_observations(practice_id, observation_type, effective_date DESC);

-- Partial index for non-deleted records
CREATE INDEX idx_clinical_obs_not_deleted ON clinical_observations(id) WHERE deleted_at IS NULL;

-- JSONB index for value searches
CREATE INDEX idx_clinical_obs_value ON clinical_observations USING GIN (value);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE clinical_observations ENABLE ROW LEVEL SECURITY;

-- Demo policy with soft delete filtering
CREATE POLICY "demo_clinical_obs_all" ON clinical_observations
  FOR ALL
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

-- Admin policy for viewing deleted records
CREATE POLICY "admin_clinical_obs_include_deleted" ON clinical_observations
  FOR SELECT
  USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at on modification
CREATE TRIGGER update_clinical_observations_updated_at
  BEFORE UPDATE ON clinical_observations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMON OBSERVATION CODES (Reference)
-- ============================================
-- Note: These are common LOINC codes for reference
--
-- Vitals:
-- 8867-4  Heart rate
-- 8310-5  Body temperature
-- 8462-4  Diastolic blood pressure
-- 8480-6  Systolic blood pressure
-- 9279-1  Respiratory rate
-- 29463-7 Body weight
-- 8302-2  Body height
-- 39156-5 BMI
-- 2708-6  Oxygen saturation
--
-- Mental Health Screenings:
-- 44249-1 PHQ-9 total score
-- 69737-5 GAD-7 total score
-- 70221-7 PCL-5 total score
-- 75626-2 AUDIT-C total score
-- 72106-8 Columbia Suicide Severity
-- 44261-6 PHQ-9 Depression assessment
--
-- Common Labs:
-- 2093-3  Total cholesterol
-- 2085-9  HDL cholesterol
-- 2089-1  LDL cholesterol
-- 2571-8  Triglycerides
-- 4548-4  HbA1c
-- 2345-7  Glucose
-- 17861-6 Calcium
-- 2160-0  Creatinine
