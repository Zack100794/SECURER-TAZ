
-- 1. Allow the application roles to use the public schema at all.
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- 2. service_role bypasses RLS and should keep full access to everything.
GRANT ALL PRIVILEGES ON ALL TABLES   IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 3. Public-read tables (RLS already restricts rows; here we only allow SELECT).
--    questionnaires: only active rows are visible (policy "Anyone can view active questionnaires")
--    questions:      all rows visible (policy "Anyone can view questions")
GRANT SELECT ON public.questionnaires TO anon, authenticated;
GRANT SELECT ON public.questions      TO anon, authenticated;

-- 4. User-owned tables: the `authenticated` role needs full CRUD.
--    RLS policies keep each user to their own rows (auth.uid() = user_id).
--    The stepN_* / uploaded_files tables are scoped through the owning
--    assessment's user_id, so CRUD is granted here and filtered by RLS.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles                    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments                 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaire_responses     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.step1_regulation_analysis   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.step2_requirements          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.step3_test_specifications   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uploaded_files              TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.step4_test_cases            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.step5_final_report          TO authenticated;

-- 5. Sequences: none exist today (tables use gen_random_uuid(), not SERIAL),
--    but grant anyway so a future SERIAL column keeps working.
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 6. Quick verification — should print `t` (true) for every public table.
SELECT
    tablename                                                          AS table_name,
    has_table_privilege('authenticated', 'public.' || tablename, 'SELECT') AS can_select,
    has_table_privilege('authenticated', 'public.' || tablename, 'INSERT') AS can_insert,
    has_table_privilege('authenticated', 'public.' || tablename, 'UPDATE') AS can_update,
    has_table_privilege('authenticated', 'public.' || tablename, 'DELETE') AS can_delete
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
