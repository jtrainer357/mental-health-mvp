-- Mental Health MVP - Flexible Outcome Measure Definitions
-- Created: 2026-02-07
-- This migration creates an extensible outcome measure definitions table

-- ============================================
-- OUTCOME MEASURE DEFINITIONS TABLE
-- ============================================
-- Stores the definition and scoring criteria for various outcome measures
-- Allows adding new measures without schema changes

CREATE TABLE IF NOT EXISTS outcome_measure_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identification
  code TEXT NOT NULL UNIQUE,              -- Unique code (e.g., 'PHQ-9', 'GAD-7', 'PCL-5')
  name TEXT NOT NULL,                     -- Full name
  description TEXT,                       -- Description of the measure

  -- Scoring
  min_score INTEGER NOT NULL DEFAULT 0,   -- Minimum possible score
  max_score INTEGER NOT NULL,             -- Maximum possible score
  score_direction TEXT DEFAULT 'higher_worse' CHECK (score_direction IN ('higher_worse', 'higher_better', 'neutral')),

  -- Severity Ranges (JSONB array of ranges)
  -- Example: [
  --   {"min": 0, "max": 4, "label": "Minimal", "severity": "none", "color": "#22c55e"},
  --   {"min": 5, "max": 9, "label": "Mild", "severity": "mild", "color": "#eab308"},
  --   {"min": 10, "max": 14, "label": "Moderate", "severity": "moderate", "color": "#f97316"},
  --   {"min": 15, "max": 19, "label": "Moderately Severe", "severity": "moderate-severe", "color": "#ef4444"},
  --   {"min": 20, "max": 27, "label": "Severe", "severity": "severe", "color": "#dc2626"}
  -- ]
  severity_ranges JSONB NOT NULL,

  -- Categorization
  specialty TEXT[] DEFAULT ARRAY['mental_health'],  -- Applicable specialties
  category TEXT,                          -- 'depression', 'anxiety', 'trauma', 'substance', 'general'
  loinc_code TEXT,                        -- LOINC code if applicable

  -- Administration
  question_count INTEGER,                 -- Number of questions
  time_to_complete TEXT,                  -- Estimated time (e.g., '2-3 minutes')
  frequency_guidance TEXT,                -- How often to administer

  -- Clinical Guidance
  clinical_notes TEXT,                    -- Notes for clinicians
  action_thresholds JSONB,                -- Score thresholds that trigger actions
  -- Example: {"urgent_referral": 20, "follow_up_soon": 15, "monitor": 10}

  -- Metadata
  source TEXT,                            -- Who created/validated the measure
  version TEXT DEFAULT '1.0',
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_outcome_def_code ON outcome_measure_definitions(code);
CREATE INDEX idx_outcome_def_specialty ON outcome_measure_definitions USING GIN (specialty);
CREATE INDEX idx_outcome_def_category ON outcome_measure_definitions(category);
CREATE INDEX idx_outcome_def_active ON outcome_measure_definitions(is_active) WHERE is_active = TRUE;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE outcome_measure_definitions ENABLE ROW LEVEL SECURITY;

-- Definitions are typically read-only for most users
CREATE POLICY "outcome_definitions_read" ON outcome_measure_definitions
  FOR SELECT
  USING (true);

-- Only allow inserts/updates from admin (in production, would be role-based)
CREATE POLICY "outcome_definitions_write" ON outcome_measure_definitions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TRIGGER
-- ============================================

CREATE TRIGGER update_outcome_definitions_updated_at
  BEFORE UPDATE ON outcome_measure_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: STANDARD MENTAL HEALTH MEASURES
-- ============================================

INSERT INTO outcome_measure_definitions (code, name, description, min_score, max_score, severity_ranges, specialty, category, loinc_code, question_count, time_to_complete, frequency_guidance, clinical_notes, action_thresholds, source)
VALUES
  -- PHQ-9: Depression Screening
  (
    'PHQ-9',
    'Patient Health Questionnaire-9',
    'A 9-item self-report measure of depression severity. Widely used in primary care and mental health settings for screening, diagnosis, and monitoring treatment response.',
    0,
    27,
    '[
      {"min": 0, "max": 4, "label": "Minimal", "severity": "none", "color": "#22c55e"},
      {"min": 5, "max": 9, "label": "Mild", "severity": "mild", "color": "#eab308"},
      {"min": 10, "max": 14, "label": "Moderate", "severity": "moderate", "color": "#f97316"},
      {"min": 15, "max": 19, "label": "Moderately Severe", "severity": "moderate-severe", "color": "#ef4444"},
      {"min": 20, "max": 27, "label": "Severe", "severity": "severe", "color": "#dc2626"}
    ]'::jsonb,
    ARRAY['mental_health', 'primary_care'],
    'depression',
    '44249-1',
    9,
    '2-3 minutes',
    'Every visit during acute treatment; monthly for maintenance',
    'Question 9 assesses suicidal ideation and requires follow-up if positive. A score decrease of 5+ points is considered clinically significant improvement.',
    '{"urgent_referral": 20, "follow_up_soon": 15, "monitor": 10, "suicidal_ideation_item": 9}'::jsonb,
    'Kroenke et al., 2001'
  ),

  -- GAD-7: Anxiety Screening
  (
    'GAD-7',
    'Generalized Anxiety Disorder-7',
    'A 7-item self-report scale designed to screen for and measure severity of generalized anxiety disorder.',
    0,
    21,
    '[
      {"min": 0, "max": 4, "label": "Minimal", "severity": "none", "color": "#22c55e"},
      {"min": 5, "max": 9, "label": "Mild", "severity": "mild", "color": "#eab308"},
      {"min": 10, "max": 14, "label": "Moderate", "severity": "moderate", "color": "#f97316"},
      {"min": 15, "max": 21, "label": "Severe", "severity": "severe", "color": "#dc2626"}
    ]'::jsonb,
    ARRAY['mental_health', 'primary_care'],
    'anxiety',
    '69737-5',
    7,
    '2-3 minutes',
    'Every visit during acute treatment; monthly for maintenance',
    'Often used in conjunction with PHQ-9 for comprehensive mood assessment. A score of 10+ warrants further evaluation.',
    '{"urgent_referral": 15, "follow_up_soon": 10, "monitor": 5}'::jsonb,
    'Spitzer et al., 2006'
  ),

  -- PCL-5: PTSD Screening
  (
    'PCL-5',
    'PTSD Checklist for DSM-5',
    'A 20-item self-report measure that assesses the presence and severity of PTSD symptoms as defined by DSM-5.',
    0,
    80,
    '[
      {"min": 0, "max": 10, "label": "Minimal", "severity": "none", "color": "#22c55e"},
      {"min": 11, "max": 20, "label": "Subthreshold", "severity": "subthreshold", "color": "#84cc16"},
      {"min": 21, "max": 30, "label": "Mild", "severity": "mild", "color": "#eab308"},
      {"min": 31, "max": 40, "label": "Moderate", "severity": "moderate", "color": "#f97316"},
      {"min": 41, "max": 60, "label": "Moderately Severe", "severity": "moderate-severe", "color": "#ef4444"},
      {"min": 61, "max": 80, "label": "Severe", "severity": "severe", "color": "#dc2626"}
    ]'::jsonb,
    ARRAY['mental_health'],
    'trauma',
    '70221-7',
    20,
    '5-10 minutes',
    'Initial assessment, then every 4-8 weeks during treatment',
    'A total score of 31-33 is suggested as a cutoff for probable PTSD diagnosis. A 10-20 point decrease indicates clinically meaningful improvement.',
    '{"probable_ptsd": 31, "clinically_significant_change": 10, "reliable_change": 5}'::jsonb,
    'Weathers et al., 2013'
  ),

  -- AUDIT-C: Alcohol Use Screening
  (
    'AUDIT-C',
    'Alcohol Use Disorders Identification Test - Consumption',
    'A brief 3-item alcohol screening tool derived from the full AUDIT. Identifies hazardous drinking and possible alcohol use disorders.',
    0,
    12,
    '[
      {"min": 0, "max": 2, "label": "Low Risk", "severity": "none", "color": "#22c55e"},
      {"min": 3, "max": 3, "label": "At Risk (Women)", "severity": "at-risk", "color": "#eab308"},
      {"min": 4, "max": 4, "label": "At Risk (Men)", "severity": "at-risk", "color": "#eab308"},
      {"min": 5, "max": 7, "label": "Hazardous", "severity": "moderate", "color": "#f97316"},
      {"min": 8, "max": 12, "label": "Harmful/Dependent", "severity": "severe", "color": "#dc2626"}
    ]'::jsonb,
    ARRAY['mental_health', 'primary_care', 'substance_abuse'],
    'substance',
    '75626-2',
    3,
    '1 minute',
    'Annual screening; more frequent in high-risk populations',
    'Positive screen threshold differs by sex: 3+ for women, 4+ for men. Higher scores warrant full AUDIT or clinical evaluation.',
    '{"positive_women": 3, "positive_men": 4, "high_risk": 8}'::jsonb,
    'Bush et al., 1998'
  )
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- HELPER FUNCTION: Get Severity Label for Score
-- ============================================

CREATE OR REPLACE FUNCTION get_severity_label(
  p_measure_code TEXT,
  p_score INTEGER
) RETURNS TEXT AS $$
DECLARE
  v_ranges JSONB;
  v_range JSONB;
BEGIN
  SELECT severity_ranges INTO v_ranges
  FROM outcome_measure_definitions
  WHERE code = p_measure_code;

  IF v_ranges IS NULL THEN
    RETURN NULL;
  END IF;

  FOR v_range IN SELECT * FROM jsonb_array_elements(v_ranges)
  LOOP
    IF p_score >= (v_range->>'min')::INTEGER AND p_score <= (v_range->>'max')::INTEGER THEN
      RETURN v_range->>'label';
    END IF;
  END LOOP;

  RETURN 'Unknown';
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- HELPER FUNCTION: Get Severity Color for Score
-- ============================================

CREATE OR REPLACE FUNCTION get_severity_color(
  p_measure_code TEXT,
  p_score INTEGER
) RETURNS TEXT AS $$
DECLARE
  v_ranges JSONB;
  v_range JSONB;
BEGIN
  SELECT severity_ranges INTO v_ranges
  FROM outcome_measure_definitions
  WHERE code = p_measure_code;

  IF v_ranges IS NULL THEN
    RETURN NULL;
  END IF;

  FOR v_range IN SELECT * FROM jsonb_array_elements(v_ranges)
  LOOP
    IF p_score >= (v_range->>'min')::INTEGER AND p_score <= (v_range->>'max')::INTEGER THEN
      RETURN v_range->>'color';
    END IF;
  END LOOP;

  RETURN '#6b7280'; -- Gray default
END;
$$ LANGUAGE plpgsql STABLE;
