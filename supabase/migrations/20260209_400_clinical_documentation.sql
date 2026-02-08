-- Migration 400: Clinical Documentation Module
-- Part of AGENT DELTA's clinical documentation feature set

-- Create enums for note types and statuses
DO $$ BEGIN
    CREATE TYPE note_type AS ENUM (
        'progress_note',
        'initial_evaluation',
        'treatment_plan',
        'crisis_note',
        'discharge_summary',
        'group_note',
        'collateral_contact'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE note_status AS ENUM (
        'draft',
        'pending_signature',
        'signed',
        'amended'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE diagnosis_status AS ENUM (
        'active',
        'resolved',
        'in_remission'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Session Notes Table (core clinical documentation)
CREATE TABLE IF NOT EXISTS session_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES auth.users(id),

    -- Session timing
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_start_time TIMESTAMPTZ,
    session_end_time TIMESTAMPTZ,
    duration_minutes INTEGER,

    -- Note metadata
    note_type note_type NOT NULL DEFAULT 'progress_note',
    status note_status NOT NULL DEFAULT 'draft',

    -- Billing
    cpt_code VARCHAR(10),
    cpt_description TEXT,

    -- Note content (SOAP format)
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,

    -- Additional structured data
    interventions TEXT[],
    risk_assessment JSONB,

    -- Signature data
    signed_at TIMESTAMPTZ,
    signed_by UUID REFERENCES auth.users(id),
    signature_hash TEXT,
    is_late_entry BOOLEAN DEFAULT false,
    late_entry_reason TEXT,

    -- Auto-save tracking
    last_auto_saved_at TIMESTAMPTZ,
    auto_save_version INTEGER DEFAULT 0,

    -- Standard timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Addendums (append-only after signature)
CREATE TABLE IF NOT EXISTS session_addendums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_note_id UUID NOT NULL REFERENCES session_notes(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id),

    content TEXT NOT NULL,
    reason TEXT NOT NULL,

    -- Signature for addendum
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    signature_hash TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient Diagnoses (ICD-10)
CREATE TABLE IF NOT EXISTS patient_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

    icd10_code VARCHAR(10) NOT NULL,
    description TEXT NOT NULL,

    status diagnosis_status NOT NULL DEFAULT 'active',
    is_primary BOOLEAN DEFAULT false,

    onset_date DATE,
    resolved_date DATE,

    diagnosed_by UUID REFERENCES auth.users(id),
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient Medications
CREATE TABLE IF NOT EXISTS patient_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    route VARCHAR(50),

    prescriber VARCHAR(255),
    pharmacy VARCHAR(255),

    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,

    refills_remaining INTEGER,
    next_refill_date DATE,

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outcome Measure Scores
CREATE TABLE IF NOT EXISTS outcome_measure_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    session_note_id UUID REFERENCES session_notes(id) ON DELETE SET NULL,

    measure_type VARCHAR(20) NOT NULL CHECK (measure_type IN ('PHQ-9', 'GAD-7', 'PCL-5', 'AUDIT', 'DAST-10', 'Columbia-CSS')),
    total_score INTEGER NOT NULL,

    -- Individual item responses stored as JSONB
    item_responses JSONB,

    -- Severity band (calculated based on score)
    severity_band VARCHAR(20),

    administered_by UUID REFERENCES auth.users(id),
    administered_at TIMESTAMPTZ DEFAULT NOW(),

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signed Note Events (for EPSILON substrate integration)
CREATE TABLE IF NOT EXISTS signed_note_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_note_id UUID NOT NULL REFERENCES session_notes(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES auth.users(id),

    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('signed', 'addendum_added')),

    -- Snapshot of key data at time of event
    cpt_code VARCHAR(10),
    diagnosis_codes TEXT[],

    processed_by_substrate BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_notes_patient_id ON session_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_provider_id ON session_notes(provider_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_session_date ON session_notes(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_notes_status ON session_notes(status);
CREATE INDEX IF NOT EXISTS idx_session_notes_draft_lookup ON session_notes(patient_id, status) WHERE status = 'draft';

CREATE INDEX IF NOT EXISTS idx_session_addendums_note_id ON session_addendums(session_note_id);

CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_patient_id ON patient_diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_active ON patient_diagnoses(patient_id, status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_patient_medications_patient_id ON patient_medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medications_active ON patient_medications(patient_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_outcome_scores_patient_id ON outcome_measure_scores(patient_id);
CREATE INDEX IF NOT EXISTS idx_outcome_scores_type ON outcome_measure_scores(patient_id, measure_type);

CREATE INDEX IF NOT EXISTS idx_signed_note_events_unprocessed ON signed_note_events(processed_by_substrate) WHERE processed_by_substrate = false;

-- Row Level Security Policies
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_addendums ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_measure_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE signed_note_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for session_notes
CREATE POLICY "Users can view their own session notes"
    ON session_notes FOR SELECT
    USING (provider_id = auth.uid());

CREATE POLICY "Users can insert their own session notes"
    ON session_notes FOR INSERT
    WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Users can update their own draft notes"
    ON session_notes FOR UPDATE
    USING (provider_id = auth.uid() AND status = 'draft')
    WITH CHECK (provider_id = auth.uid());

-- RLS Policies for session_addendums
CREATE POLICY "Users can view addendums for their notes"
    ON session_addendums FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM session_notes
        WHERE session_notes.id = session_addendums.session_note_id
        AND session_notes.provider_id = auth.uid()
    ));

CREATE POLICY "Users can add addendums to their signed notes"
    ON session_addendums FOR INSERT
    WITH CHECK (
        author_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM session_notes
            WHERE session_notes.id = session_note_id
            AND session_notes.provider_id = auth.uid()
            AND session_notes.status = 'signed'
        )
    );

-- RLS Policies for patient_diagnoses
CREATE POLICY "Users can view diagnoses for their patients"
    ON patient_diagnoses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM patients
        WHERE patients.id = patient_diagnoses.patient_id
        AND patients.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage diagnoses for their patients"
    ON patient_diagnoses FOR ALL
    USING (EXISTS (
        SELECT 1 FROM patients
        WHERE patients.id = patient_diagnoses.patient_id
        AND patients.user_id = auth.uid()
    ));

-- RLS Policies for patient_medications
CREATE POLICY "Users can view medications for their patients"
    ON patient_medications FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM patients
        WHERE patients.id = patient_medications.patient_id
        AND patients.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage medications for their patients"
    ON patient_medications FOR ALL
    USING (EXISTS (
        SELECT 1 FROM patients
        WHERE patients.id = patient_medications.patient_id
        AND patients.user_id = auth.uid()
    ));

-- RLS Policies for outcome_measure_scores
CREATE POLICY "Users can view outcome scores for their patients"
    ON outcome_measure_scores FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM patients
        WHERE patients.id = outcome_measure_scores.patient_id
        AND patients.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert outcome scores for their patients"
    ON outcome_measure_scores FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM patients
        WHERE patients.id = patient_id
        AND patients.user_id = auth.uid()
    ));

-- RLS Policies for signed_note_events
CREATE POLICY "Users can view their own signed note events"
    ON signed_note_events FOR SELECT
    USING (provider_id = auth.uid());

-- Trigger function to create signed_note_event when note is signed
CREATE OR REPLACE FUNCTION create_signed_note_event()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'signed' AND (OLD.status IS NULL OR OLD.status != 'signed') THEN
        INSERT INTO signed_note_events (
            session_note_id,
            patient_id,
            provider_id,
            event_type,
            cpt_code,
            diagnosis_codes
        )
        SELECT
            NEW.id,
            NEW.patient_id,
            NEW.provider_id,
            'signed',
            NEW.cpt_code,
            ARRAY(
                SELECT icd10_code FROM patient_diagnoses
                WHERE patient_id = NEW.patient_id AND status = 'active'
            );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_signed_note_event
    AFTER UPDATE ON session_notes
    FOR EACH ROW
    EXECUTE FUNCTION create_signed_note_event();

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Add comments for documentation
COMMENT ON TABLE session_notes IS 'Clinical session documentation with SOAP format and e-signature support';
COMMENT ON TABLE session_addendums IS 'Append-only addendums to signed session notes';
COMMENT ON TABLE patient_diagnoses IS 'Patient diagnosis list with ICD-10 codes';
COMMENT ON TABLE patient_medications IS 'Patient medication list with refill tracking';
COMMENT ON TABLE outcome_measure_scores IS 'Standardized outcome measure scores (PHQ-9, GAD-7, etc.)';
COMMENT ON TABLE signed_note_events IS 'Event log for substrate integration when notes are signed';
