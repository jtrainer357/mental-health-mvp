-- Mental Health MVP - Clinical Documentation Tables
-- Created: 2026-02-09
-- Agent: DELTA - Clinical Documentation
-- Migration Range: 400-409

-- ============================================
-- NOTE TYPE ENUM
-- ============================================
DO $$ BEGIN
    CREATE TYPE note_type AS ENUM (
        'progress_note',
        'initial_evaluation',
        'crisis_note'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- NOTE STATUS ENUM
-- ============================================
DO $$ BEGIN
    CREATE TYPE note_status AS ENUM (
        'draft',
        'signed',
        'amended'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- DIAGNOSIS STATUS ENUM
-- ============================================
DO $$ BEGIN
    CREATE TYPE diagnosis_status AS ENUM (
        'active',
        'resolved',
        'rule_out'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- SESSION NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS session_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_start_time TIMESTAMPTZ,
    session_end_time TIMESTAMPTZ,
    total_minutes INTEGER,
    note_type note_type NOT NULL DEFAULT 'progress_note',
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    biopsychosocial_history TEXT,
    safety_assessment TEXT,
    safety_plan TEXT,
    cpt_code TEXT,
    cpt_code_suggested TEXT,
    cpt_override_reason TEXT,
    status note_status NOT NULL DEFAULT 'draft',
    signed_by UUID REFERENCES users(id),
    signed_at TIMESTAMPTZ,
    signer_name TEXT,
    signer_credentials TEXT,
    is_late_entry BOOLEAN DEFAULT false,
    last_saved_at TIMESTAMPTZ DEFAULT NOW(),
    ai_generated BOOLEAN DEFAULT false,
    ai_transcript TEXT,
    ai_model TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- ============================================
-- SESSION ADDENDUMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS session_addendums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_note_id UUID NOT NULL REFERENCES session_notes(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    author_name TEXT NOT NULL,
    author_credentials TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PATIENT DIAGNOSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    icd10_code TEXT NOT NULL,
    description TEXT NOT NULL,
    status diagnosis_status NOT NULL DEFAULT 'active',
    is_primary BOOLEAN DEFAULT false,
    date_diagnosed DATE DEFAULT CURRENT_DATE,
    date_resolved DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- ============================================
-- PATIENT MEDICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    prescribing_provider TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    discontinued_reason TEXT,
    quantity INTEGER,
    refills_remaining INTEGER,
    next_refill_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- ============================================
-- OUTCOME MEASURE SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS outcome_measure_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    measure_type TEXT NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    context_notes TEXT,
    severity TEXT,
    next_assessment_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ============================================
-- SIGNED NOTE EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS signed_note_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_note_id UUID NOT NULL REFERENCES session_notes(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL,
    practice_id UUID NOT NULL,
    signed_by UUID NOT NULL,
    signed_at TIMESTAMPTZ NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_session_notes_patient ON session_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_practice ON session_notes(practice_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_status ON session_notes(status);
CREATE INDEX IF NOT EXISTS idx_session_notes_date ON session_notes(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_notes_draft ON session_notes(patient_id, status) WHERE status = 'draft';
CREATE INDEX IF NOT EXISTS idx_addendums_session ON session_addendums(session_note_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient ON patient_diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_practice ON patient_diagnoses(practice_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_status ON patient_diagnoses(status);
CREATE INDEX IF NOT EXISTS idx_diagnoses_primary ON patient_diagnoses(patient_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_medications_patient ON patient_medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_practice ON patient_medications(practice_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON patient_medications(patient_id, end_date) WHERE end_date IS NULL;
CREATE INDEX IF NOT EXISTS idx_outcome_scores_patient ON outcome_measure_scores(patient_id);
CREATE INDEX IF NOT EXISTS idx_outcome_scores_type ON outcome_measure_scores(patient_id, measure_type, measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_signed_events_unprocessed ON signed_note_events(processed) WHERE processed = false;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_addendums ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_measure_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE signed_note_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TRIGGER: Updated At
-- ============================================
CREATE TRIGGER update_session_notes_updated_at
    BEFORE UPDATE ON session_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_diagnoses_updated_at
    BEFORE UPDATE ON patient_diagnoses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_medications_updated_at
    BEFORE UPDATE ON patient_medications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Signed Note Event
-- ============================================
CREATE OR REPLACE FUNCTION create_signed_note_event()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'signed' AND (OLD.status IS NULL OR OLD.status != 'signed') THEN
        INSERT INTO signed_note_events (
            session_note_id, patient_id, practice_id, signed_by, signed_at
        ) VALUES (
            NEW.id, NEW.patient_id, NEW.practice_id, NEW.signed_by, NEW.signed_at
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_signed_note_event
    AFTER INSERT OR UPDATE ON session_notes
    FOR EACH ROW
    EXECUTE FUNCTION create_signed_note_event();
