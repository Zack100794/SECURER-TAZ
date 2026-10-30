-- Securer Database Schema
-- Version: 1.0
-- Description: Complete schema for cybersecurity compliance assessment application

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- QUESTIONNAIRES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS questionnaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    version TEXT DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- QUESTIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE,
    section_title TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    input_type TEXT NOT NULL CHECK (input_type IN ('radio', 'checkbox', 'text', 'textarea', 'select')),
    options JSONB, -- Array of options for radio/checkbox/select
    is_required BOOLEAN DEFAULT TRUE,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ASSESSMENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    current_step INTEGER DEFAULT 0 CHECK (current_step >= 0 AND current_step <= 5),
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- QUESTIONNAIRE_RESPONSES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    response_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assessment_id, question_id)
);

-- =============================================================================
-- STEP 1: REGULATION ANALYSIS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS step1_regulation_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID UNIQUE REFERENCES assessments(id) ON DELETE CASCADE,
    recommended_regulations JSONB NOT NULL, -- Array of regulation recommendations
    selected_regulation TEXT,
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STEP 2: REQUIREMENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS step2_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    requirement_text TEXT NOT NULL,
    category TEXT NOT NULL,
    standard_clause TEXT,
    is_selected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STEP 3: TEST SPECIFICATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS step3_test_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES step2_requirements(id) ON DELETE CASCADE,
    test_id TEXT NOT NULL,
    test_description TEXT NOT NULL,
    expected_outcome TEXT NOT NULL,
    test_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- UPLOADED FILES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STEP 4: TEST CASES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS step4_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    test_spec_id UUID REFERENCES step3_test_specifications(id) ON DELETE CASCADE,
    test_case_name TEXT NOT NULL,
    test_code TEXT NOT NULL,
    programming_language TEXT NOT NULL,
    file_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STEP 5: FINAL REPORT TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS step5_final_report (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID UNIQUE REFERENCES assessments(id) ON DELETE CASCADE,
    overall_status TEXT NOT NULL CHECK (overall_status IN ('compliant', 'non_compliant', 'partial')),
    vulnerabilities JSONB NOT NULL, -- Array of vulnerability objects
    recommendations JSONB NOT NULL, -- Array of recommendation objects
    risk_score DECIMAL(5,2),
    report_pdf_path TEXT,
    report_markdown TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_questions_questionnaire_id ON questions(questionnaire_id);
CREATE INDEX idx_questionnaire_responses_assessment_id ON questionnaire_responses(assessment_id);
CREATE INDEX idx_step2_requirements_assessment_id ON step2_requirements(assessment_id);
CREATE INDEX idx_step3_test_specs_assessment_id ON step3_test_specifications(assessment_id);
CREATE INDEX idx_step4_test_cases_assessment_id ON step4_test_cases(assessment_id);
CREATE INDEX idx_uploaded_files_assessment_id ON uploaded_files(assessment_id);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaires_updated_at BEFORE UPDATE ON questionnaires
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaire_responses_updated_at BEFORE UPDATE ON questionnaire_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_step1_regulation_analysis_updated_at BEFORE UPDATE ON step1_regulation_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_step2_requirements_updated_at BEFORE UPDATE ON step2_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_step3_test_specifications_updated_at BEFORE UPDATE ON step3_test_specifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_step4_test_cases_updated_at BEFORE UPDATE ON step4_test_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_step5_final_report_updated_at BEFORE UPDATE ON step5_final_report
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
