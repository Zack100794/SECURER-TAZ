-- Row Level Security (RLS) Policies
-- Version: 1.0
-- Description: Secure all tables with user-scoped RLS policies

-- =============================================================================
-- PROFILES TABLE RLS
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =============================================================================
-- QUESTIONNAIRES TABLE RLS (Public Read)
-- =============================================================================
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active questionnaires"
    ON questionnaires FOR SELECT
    USING (is_active = TRUE);

-- =============================================================================
-- QUESTIONS TABLE RLS (Public Read)
-- =============================================================================
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions"
    ON questions FOR SELECT
    USING (TRUE);

-- =============================================================================
-- ASSESSMENTS TABLE RLS
-- =============================================================================
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessments"
    ON assessments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments"
    ON assessments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
    ON assessments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments"
    ON assessments FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- QUESTIONNAIRE_RESPONSES TABLE RLS
-- =============================================================================
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own questionnaire responses"
    ON questionnaire_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = questionnaire_responses.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own questionnaire responses"
    ON questionnaire_responses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = questionnaire_responses.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own questionnaire responses"
    ON questionnaire_responses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = questionnaire_responses.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own questionnaire responses"
    ON questionnaire_responses FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = questionnaire_responses.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

-- =============================================================================
-- STEP1_REGULATION_ANALYSIS TABLE RLS
-- =============================================================================
ALTER TABLE step1_regulation_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own regulation analysis"
    ON step1_regulation_analysis FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step1_regulation_analysis.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own regulation analysis"
    ON step1_regulation_analysis FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step1_regulation_analysis.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own regulation analysis"
    ON step1_regulation_analysis FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step1_regulation_analysis.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

-- =============================================================================
-- STEP2_REQUIREMENTS TABLE RLS
-- =============================================================================
ALTER TABLE step2_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requirements"
    ON step2_requirements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step2_requirements.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own requirements"
    ON step2_requirements FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step2_requirements.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own requirements"
    ON step2_requirements FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step2_requirements.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

-- =============================================================================
-- STEP3_TEST_SPECIFICATIONS TABLE RLS
-- =============================================================================
ALTER TABLE step3_test_specifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own test specifications"
    ON step3_test_specifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step3_test_specifications.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own test specifications"
    ON step3_test_specifications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step3_test_specifications.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own test specifications"
    ON step3_test_specifications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step3_test_specifications.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

-- =============================================================================
-- UPLOADED_FILES TABLE RLS
-- =============================================================================
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploaded files"
    ON uploaded_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = uploaded_files.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own uploaded files"
    ON uploaded_files FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = uploaded_files.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own uploaded files"
    ON uploaded_files FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = uploaded_files.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

-- =============================================================================
-- STEP4_TEST_CASES TABLE RLS
-- =============================================================================
ALTER TABLE step4_test_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own test cases"
    ON step4_test_cases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step4_test_cases.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own test cases"
    ON step4_test_cases FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step4_test_cases.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own test cases"
    ON step4_test_cases FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step4_test_cases.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

-- =============================================================================
-- STEP5_FINAL_REPORT TABLE RLS
-- =============================================================================
ALTER TABLE step5_final_report ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own final report"
    ON step5_final_report FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step5_final_report.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own final report"
    ON step5_final_report FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step5_final_report.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own final report"
    ON step5_final_report FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = step5_final_report.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );
