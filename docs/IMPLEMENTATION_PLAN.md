# 🚀 Securer - Complete Implementation Plan

## 📋 Overview
This document provides a complete step-by-step implementation plan for the Securer cybersecurity compliance assessment application.

---

## Phase 1: Project Foundation & Setup

### Step 1.1: Initialize Next.js Project
**Objective:** Set up the base Next.js application with TypeScript and essential dependencies

**Tasks:**
- [ ] Create Next.js project with App Router: `npx create-next-app@latest securer --typescript --app --use-npm`
- [ ] Install core dependencies:
  ```bash
  npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
  npm install zod react-hook-form @hookform/resolvers
  npm install lucide-react class-variance-authority clsx tailwind-merge
  npm install cheerio # For HTML parsing
  npm install pdf-lib jspdf # For PDF generation
  npm install mammoth # For DOCX handling
  ```
- [ ] Install dev dependencies:
  ```bash
  npm install -D @types/node @types/react
  ```

**Deliverables:**
- Working Next.js application
- `package.json` with all dependencies
- TypeScript configuration

---

### Step 1.2: Environment Configuration
**Objective:** Set up environment variables and configuration

**Tasks:**
- [ ] Create `.env.local` file with:
  ```env
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  
  # LLM Configuration
  NODE_ENV=development # or production
  OLLAMA_BASE_URL=http://localhost:11434
  OPENAI_API_KEY=your_openai_key
  
  # Application
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```
- [ ] Create `.env.example` template
- [ ] Add `.env.local` to `.gitignore`
- [ ] Create `src/config/env.ts` for environment validation using Zod

**Deliverables:**
- `.env.local` file (not committed)
- `.env.example` template
- Environment validation utility

**Files to Create:**
```
/src/config/env.ts
```

---

### Step 1.3: Project Structure Setup
**Objective:** Establish clean folder structure

**Tasks:**
- [ ] Create the following directory structure:
  ```
  /src
    /app                    # Next.js App Router
      /api                  # API routes
      /auth                 # Auth pages
      /(authenticated)      # Protected routes
      /page.tsx             # Landing page
      /layout.tsx           # Root layout
    /components
      /ui                   # Reusable UI components
      /auth                 # Auth-specific components
      /wizard               # Step wizard components
      /questionnaire        # Questionnaire components
    /lib
      /supabase            # Supabase clients
      /llm                 # LLM abstraction
      /utils               # Utility functions
    /types                 # TypeScript types
    /hooks                 # Custom React hooks
    /scripts               # Utility scripts
  /supabase
    /migrations            # Database migrations
  /public                  # Static assets
  ```

**Deliverables:**
- Complete folder structure
- README.md with project overview

---

## Phase 2: Database Schema & Authentication

### Step 2.1: Design Supabase Database Schema
**Objective:** Create comprehensive database schema with RLS

**Tasks:**
- [ ] Create migration file: `supabase/migrations/001_initial_schema.sql`
- [ ] Define tables:

**Tables:**

1. **profiles**
   ```sql
   CREATE TABLE profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     email TEXT NOT NULL,
     full_name TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **questionnaires**
   ```sql
   CREATE TABLE questionnaires (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     description TEXT,
     html_content TEXT NOT NULL,
     version TEXT DEFAULT '1.0',
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **questions**
   ```sql
   CREATE TABLE questions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE,
     question_text TEXT NOT NULL,
     question_type TEXT NOT NULL, -- text, radio, checkbox, select
     options JSONB, -- For multi-choice questions
     html_id TEXT,
     order_index INTEGER,
     is_required BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

4. **assessments**
   ```sql
   CREATE TABLE assessments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     status TEXT DEFAULT 'questionnaire', -- questionnaire, step1, step2, step3, step4, step5, completed
     current_step INTEGER DEFAULT 0,
     questionnaire_id UUID REFERENCES questionnaires(id),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

5. **questionnaire_responses**
   ```sql
   CREATE TABLE questionnaire_responses (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
     question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
     response_value TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

6. **step1_regulation_analysis**
   ```sql
   CREATE TABLE step1_regulation_analysis (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
     regulation_name TEXT NOT NULL, -- RED, GDPR, NIST, ISO/IEC, NIS2
     explanation TEXT NOT NULL,
     confidence_score DECIMAL(3,2),
     clause_references JSONB,
     llm_reasoning TEXT NOT NULL,
     is_selected BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

7. **step2_requirements**
   ```sql
   CREATE TABLE step2_requirements (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
     regulation_name TEXT NOT NULL,
     category TEXT NOT NULL, -- Cryptography, Authentication, etc.
     requirement_text TEXT NOT NULL,
     standard_reference TEXT,
     risk_severity TEXT, -- low, medium, high, critical
     is_selected BOOLEAN DEFAULT false,
     llm_reasoning TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

8. **step3_test_specifications**
   ```sql
   CREATE TABLE step3_test_specifications (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
     test_id TEXT NOT NULL, -- TSO 1.1, TSO 2.4, etc.
     requirement_id UUID REFERENCES step2_requirements(id),
     objective TEXT NOT NULL,
     expected_behavior TEXT NOT NULL,
     failure_impact TEXT NOT NULL,
     standard_mapping TEXT,
     is_confirmed BOOLEAN DEFAULT false,
     llm_reasoning TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

9. **uploaded_files**
   ```sql
   CREATE TABLE uploaded_files (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
     file_name TEXT NOT NULL,
     file_type TEXT NOT NULL,
     file_size INTEGER NOT NULL,
     storage_path TEXT NOT NULL,
     upload_step INTEGER, -- 4 for code, 5 for test results
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

10. **step4_test_cases**
    ```sql
    CREATE TABLE step4_test_cases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
      test_specification_id UUID REFERENCES step3_test_specifications(id),
      test_case_name TEXT NOT NULL,
      execution_steps TEXT NOT NULL,
      expected_results TEXT NOT NULL,
      programming_language TEXT,
      test_code TEXT,
      llm_reasoning TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```

11. **step5_final_report**
    ```sql
    CREATE TABLE step5_final_report (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
      compliance_status TEXT NOT NULL, -- compliant, partially_compliant, non_compliant
      vulnerabilities JSONB NOT NULL,
      cve_mappings JSONB,
      risk_scores JSONB,
      recommendations TEXT NOT NULL,
      report_content TEXT NOT NULL,
      report_pdf_path TEXT,
      llm_reasoning TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```

**Tasks continued:**
- [ ] Create indexes for performance
- [ ] Add updated_at triggers
- [ ] Document schema in `supabase/schema.md`

**Deliverables:**
- Complete SQL migration file
- Schema documentation

**Files to Create:**
```
/supabase/migrations/001_initial_schema.sql
/supabase/schema.md
```

---

### Step 2.2: Implement Row Level Security (RLS)
**Objective:** Secure all tables with user-scoped RLS policies

**Tasks:**
- [ ] Enable RLS on all tables
- [ ] Create policies for each table:

**RLS Policies:**

```sql
-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Assessments
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

-- Apply similar patterns to all user-scoped tables
-- questionnaire_responses, step1_regulation_analysis, step2_requirements,
-- step3_test_specifications, uploaded_files, step4_test_cases, step5_final_report
```

- [ ] Create migration file: `supabase/migrations/002_rls_policies.sql`
- [ ] Test RLS policies with different users

**Deliverables:**
- RLS policies for all tables
- Test script for RLS validation

**Files to Create:**
```
/supabase/migrations/002_rls_policies.sql
```

---

### Step 2.3: Supabase Client Setup
**Objective:** Create Supabase client utilities for server and client

**Tasks:**
- [ ] Create server-side Supabase client:
  ```typescript
  // src/lib/supabase/server.ts
  import { createServerClient } from '@supabase/auth-helpers-nextjs'
  import { cookies } from 'next/headers'
  ```

- [ ] Create client-side Supabase client:
  ```typescript
  // src/lib/supabase/client.ts
  import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
  ```

- [ ] Create middleware-compatible client:
  ```typescript
  // src/lib/supabase/middleware.ts
  import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
  ```

- [ ] Create type-safe database types:
  ```bash
  npx supabase gen types typescript --project-id your_project_id > src/types/supabase.ts
  ```

**Deliverables:**
- Server client utility
- Browser client utility
- Middleware client utility
- Type definitions

**Files to Create:**
```
/src/lib/supabase/server.ts
/src/lib/supabase/client.ts
/src/lib/supabase/middleware.ts
/src/types/supabase.ts
/src/types/database.types.ts
```

---

### Step 2.4: Authentication Implementation
**Objective:** Implement complete authentication flow

**Tasks:**
- [ ] Create authentication middleware:
  ```typescript
  // src/middleware.ts
  // Validate session and refresh tokens
  ```

- [ ] Create auth utility functions:
  ```typescript
  // src/lib/auth/session.ts
  // getUserSession, requireAuth, etc.
  ```

- [ ] Build Sign In page:
  ```
  /src/app/auth/signin/page.tsx
  ```

- [ ] Build Sign Up page:
  ```
  /src/app/auth/signup/page.tsx
  ```

- [ ] Create auth form components:
  ```
  /src/components/auth/SignInForm.tsx
  /src/components/auth/SignUpForm.tsx
  ```

- [ ] Implement auth callback handler:
  ```
  /src/app/auth/callback/route.ts
  ```

- [ ] Create logout functionality

**Deliverables:**
- Working sign in/up flow
- Session management
- Protected route middleware

**Files to Create:**
```
/src/middleware.ts
/src/lib/auth/session.ts
/src/app/auth/signin/page.tsx
/src/app/auth/signup/page.tsx
/src/app/auth/callback/route.ts
/src/components/auth/SignInForm.tsx
/src/components/auth/SignUpForm.tsx
/src/components/auth/AuthProvider.tsx
```

---

## Phase 3: LLM Abstraction Layer

### Step 3.1: LLM Configuration & Detection
**Objective:** Create unified LLM interface that auto-detects environment

**Tasks:**
- [ ] Create LLM configuration:
  ```typescript
  // src/lib/llm/config.ts
  export const getLLMConfig = () => {
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    return {
      provider: isProduction ? 'openai' : 'ollama',
      baseURL: isProduction ? 'https://api.openai.com/v1' : process.env.OLLAMA_BASE_URL,
      apiKey: isProduction ? process.env.OPENAI_API_KEY : undefined,
      model: isProduction ? 'gpt-4-turbo-preview' : 'llama3.2:latest'
    };
  };
  ```

- [ ] Document environment detection logic

**Deliverables:**
- LLM configuration module
- Environment detection logic

**Files to Create:**
```
/src/lib/llm/config.ts
```

---

### Step 3.2: Unified LLM Client
**Objective:** Create single interface for both Ollama and OpenAI

**Tasks:**
- [ ] Create LLM client abstraction:
  ```typescript
  // src/lib/llm/client.ts
  export interface LLMResponse {
    content: string;
    model: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }

  export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  export class LLMClient {
    async chat(messages: LLMMessage[], options?: {}): Promise<LLMResponse>
    async parseJSON<T>(messages: LLMMessage[], schema: z.ZodSchema<T>): Promise<T>
  }
  ```

- [ ] Implement Ollama adapter
- [ ] Implement OpenAI adapter
- [ ] Add error handling and retries
- [ ] Add response validation with Zod

**Deliverables:**
- Unified LLM client
- Ollama integration
- OpenAI integration
- Type-safe response parsing

**Files to Create:**
```
/src/lib/llm/client.ts
/src/lib/llm/adapters/ollama.ts
/src/lib/llm/adapters/openai.ts
/src/lib/llm/types.ts
```

---

### Step 3.3: LLM Prompt Templates
**Objective:** Create structured prompts for each step

**Tasks:**
- [ ] Create prompt template system:
  ```typescript
  // src/lib/llm/prompts/index.ts
  export const prompts = {
    step1_regulation_analysis: (responses: any) => {...},
    step2_requirement_extraction: (regulation: string) => {...},
    step3_test_specification: (requirements: any[]) => {...},
    step4_test_generation: (code: string, specs: any[]) => {...},
    step5_vulnerability_analysis: (testResults: any) => {...}
  };
  ```

- [ ] Create prompts for each step with:
  - System instructions
  - Task description
  - Output format requirements (JSON schema)
  - Examples

**Deliverables:**
- Prompt templates for all 5 steps
- Prompt testing utilities

**Files to Create:**
```
/src/lib/llm/prompts/index.ts
/src/lib/llm/prompts/step1.ts
/src/lib/llm/prompts/step2.ts
/src/lib/llm/prompts/step3.ts
/src/lib/llm/prompts/step4.ts
/src/lib/llm/prompts/step5.ts
/src/lib/llm/prompts/schemas.ts (Zod schemas for responses)
```

---

## Phase 4: Questionnaire Management

### Step 4.1: HTML Parser Script
**Objective:** Create script to parse and upload questionnaire HTML

**Tasks:**
- [ ] Create parser script:
  ```typescript
  // src/scripts/parse-questionnaire.ts
  import * as cheerio from 'cheerio';
  
  async function parseQuestionnaireHTML(htmlPath: string) {
    // Parse HTML
    // Extract questions, input types, options
    // Upload to Supabase
  }
  ```

- [ ] Implement HTML parsing logic:
  - Detect input types (text, radio, checkbox, select)
  - Extract labels and IDs
  - Extract options for multi-choice
  - Maintain order

- [ ] Add validation and error handling
- [ ] Make script idempotent (check existing before insert)
- [ ] Add logging

- [ ] Create NPM script:
  ```json
  "scripts": {
    "parse-questionnaire": "tsx src/scripts/parse-questionnaire.ts"
  }
  ```

**Deliverables:**
- HTML parser script
- Documentation for usage
- Sample questionnaire HTML

**Files to Create:**
```
/src/scripts/parse-questionnaire.ts
/src/scripts/README.md
/sample-data/questionnaire.html
```

---

### Step 4.2: Questionnaire API Routes
**Objective:** Create API endpoints for questionnaire operations

**Tasks:**
- [ ] Create API route to get questionnaires:
  ```
  /src/app/api/questionnaires/route.ts
  GET /api/questionnaires - List all active questionnaires
  ```

- [ ] Create API route to get questionnaire details:
  ```
  /src/app/api/questionnaires/[id]/route.ts
  GET /api/questionnaires/:id - Get questionnaire with questions
  ```

- [ ] Create API route to submit responses:
  ```
  /src/app/api/questionnaires/[id]/responses/route.ts
  POST /api/questionnaires/:id/responses - Submit questionnaire responses
  ```

- [ ] Add session validation to all routes
- [ ] Add input validation with Zod

**Deliverables:**
- Questionnaire API routes
- Request/response types

**Files to Create:**
```
/src/app/api/questionnaires/route.ts
/src/app/api/questionnaires/[id]/route.ts
/src/app/api/questionnaires/[id]/responses/route.ts
/src/types/api.types.ts
```

---

### Step 4.3: Questionnaire Frontend Component
**Objective:** Build dynamic questionnaire form

**Tasks:**
- [ ] Create questionnaire form component:
  ```typescript
  // src/components/questionnaire/QuestionnaireForm.tsx
  // Dynamically render questions from database
  // Support all input types
  // Validate responses
  // Submit to API
  ```

- [ ] Create individual question components:
  - TextInput
  - RadioGroup
  - CheckboxGroup
  - SelectInput

- [ ] Add form state management
- [ ] Add validation
- [ ] Add progress indicator
- [ ] Add save draft functionality

**Deliverables:**
- Dynamic questionnaire form
- Reusable question components
- Form validation

**Files to Create:**
```
/src/components/questionnaire/QuestionnaireForm.tsx
/src/components/questionnaire/QuestionInput.tsx
/src/components/questionnaire/QuestionTypes.tsx
/src/hooks/useQuestionnaire.ts
```

---

## Phase 5: Assessment Wizard - Step 1

### Step 5.1: Step 1 API - Regulation Analysis
**Objective:** Implement LLM-powered regulation recommendation

**Tasks:**
- [ ] Create Step 1 API route:
  ```typescript
  // src/app/api/assessments/[id]/step1/route.ts
  POST /api/assessments/:id/step1
  
  // 1. Get assessment and questionnaire responses
  // 2. Format responses for LLM
  // 3. Call LLM with regulation analysis prompt
  // 4. Parse LLM response
  // 5. Store in step1_regulation_analysis table
  // 6. Return recommendations to frontend
  ```

- [ ] Implement LLM analysis logic
- [ ] Define response schema:
  ```typescript
  interface RegulationAnalysis {
    regulations: {
      name: 'RED' | 'GDPR' | 'NIST' | 'ISO/IEC' | 'NIS2';
      explanation: string;
      confidenceScore: number;
      clauseReferences: string[];
      reasoning: string;
    }[];
  }
  ```

- [ ] Add error handling
- [ ] Add loading states

**Deliverables:**
- Step 1 API route
- LLM integration for regulation analysis

**Files to Create:**
```
/src/app/api/assessments/[id]/step1/route.ts
/src/app/api/assessments/[id]/step1/select/route.ts (for user selection)
```

---

### Step 5.2: Step 1 Frontend
**Objective:** Build UI for regulation recommendation

**Tasks:**
- [ ] Create Step 1 component:
  ```typescript
  // src/components/wizard/Step1RegulationAnalysis.tsx
  ```

- [ ] Display:
  - Loading state while LLM processes
  - List of regulations with:
    - Name
    - Explanation
    - Confidence score
    - Clause references (expandable)
  - Radio button for selection
  - Continue button

- [ ] Add expandable sections for detailed reasoning
- [ ] Implement selection persistence

**Deliverables:**
- Step 1 UI component
- Loading and error states

**Files to Create:**
```
/src/components/wizard/Step1RegulationAnalysis.tsx
/src/components/wizard/RegulationCard.tsx
```

---

## Phase 6: Assessment Wizard - Step 2

### Step 6.1: Step 2 API - Requirement Extraction
**Objective:** Extract testable requirements from selected regulation

**Tasks:**
- [ ] Create Step 2 API route:
  ```typescript
  // src/app/api/assessments/[id]/step2/route.ts
  POST /api/assessments/:id/step2
  
  // 1. Get selected regulation
  // 2. Call LLM with requirement extraction prompt
  // 3. Parse requirements by category
  // 4. Store in step2_requirements table
  // 5. Return to frontend
  ```

- [ ] Define requirement categories
- [ ] Implement LLM extraction logic
- [ ] Add standard clause mapping

**Deliverables:**
- Step 2 API route
- Requirement extraction logic

**Files to Create:**
```
/src/app/api/assessments/[id]/step2/route.ts
/src/app/api/assessments/[id]/step2/select/route.ts
```

---

### Step 6.2: Step 2 Frontend
**Objective:** Build UI for requirement selection

**Tasks:**
- [ ] Create Step 2 component:
  ```typescript
  // src/components/wizard/Step2Requirements.tsx
  ```

- [ ] Display:
  - Requirements grouped by category
  - Checkbox for each requirement
  - Description and standard reference
  - Risk severity indicator
  - Select all by category

- [ ] Implement multi-select
- [ ] Add requirement details modal

**Deliverables:**
- Step 2 UI component
- Requirement selection interface

**Files to Create:**
```
/src/components/wizard/Step2Requirements.tsx
/src/components/wizard/RequirementCheckbox.tsx
/src/components/wizard/RequirementDetails.tsx
```

---

## Phase 7: Assessment Wizard - Step 3

### Step 7.1: Step 3 API - Test Specification Mapping
**Objective:** Map requirements to formal test specifications

**Tasks:**
- [ ] Create Step 3 API route:
  ```typescript
  // src/app/api/assessments/[id]/step3/route.ts
  POST /api/assessments/:id/step3
  
  // 1. Get selected requirements
  // 2. Call LLM to generate test specifications
  // 3. Assign unique test IDs (TSO x.y)
  // 4. Store in step3_test_specifications table
  // 5. Return to frontend
  ```

- [ ] Implement test ID generation logic
- [ ] Define test specification schema

**Deliverables:**
- Step 3 API route
- Test specification generation

**Files to Create:**
```
/src/app/api/assessments/[id]/step3/route.ts
/src/app/api/assessments/[id]/step3/confirm/route.ts
```

---

### Step 7.2: Step 3 Frontend
**Objective:** Build UI for test specification review

**Tasks:**
- [ ] Create Step 3 component:
  ```typescript
  // src/components/wizard/Step3TestSpecifications.tsx
  ```

- [ ] Display test specifications with:
  - Test ID
  - Objective
  - Expected behavior
  - Failure impact
  - Standard mapping
  - Expandable details

- [ ] Add confirmation mechanism

**Deliverables:**
- Step 3 UI component
- Test spec display

**Files to Create:**
```
/src/components/wizard/Step3TestSpecifications.tsx
/src/components/wizard/TestSpecCard.tsx
```

---

## Phase 8: Assessment Wizard - Step 4

### Step 8.1: File Upload Infrastructure
**Objective:** Implement secure file upload system

**Tasks:**
- [ ] Set up Supabase Storage bucket for uploads
- [ ] Configure CORS and security rules
- [ ] Create file upload utility:
  ```typescript
  // src/lib/storage/upload.ts
  export async function uploadFile(
    file: File,
    assessmentId: string,
    userId: string
  ): Promise<string>
  ```

- [ ] Add file validation:
  - File size limits (50MB)
  - Allowed file types
  - Virus scanning (if available)

- [ ] Implement file parsing utilities:
  - Text extraction from PDF
  - Code file reading
  - DOCX parsing

**Deliverables:**
- File upload system
- Storage configuration
- File parsing utilities

**Files to Create:**
```
/src/lib/storage/upload.ts
/src/lib/storage/parse.ts
/src/app/api/upload/route.ts
```

---

### Step 8.2: Step 4 API - Test Case Generation
**Objective:** Generate test cases from uploaded code

**Tasks:**
- [ ] Create Step 4 API route:
  ```typescript
  // src/app/api/assessments/[id]/step4/route.ts
  POST /api/assessments/:id/step4
  
  // 1. Get uploaded files
  // 2. Parse/extract code content
  // 3. Get test specifications from Step 3
  // 4. Call LLM to generate test cases
  // 5. Store in step4_test_cases table
  // 6. Generate downloadable artifacts
  ```

- [ ] Implement language detection
- [ ] Generate executable test code
- [ ] Create downloadable test files

**Deliverables:**
- Step 4 API route
- Test case generation logic
- Downloadable artifacts

**Files to Create:**
```
/src/app/api/assessments/[id]/step4/route.ts
/src/app/api/assessments/[id]/step4/download/route.ts
/src/lib/llm/test-generation.ts
```

---

### Step 8.3: Step 4 Frontend
**Objective:** Build UI for code upload and test case display

**Tasks:**
- [ ] Create Step 4 component:
  ```typescript
  // src/components/wizard/Step4TestGeneration.tsx
  ```

- [ ] Implement file upload interface:
  - Drag-and-drop
  - File browser
  - Multi-file upload
  - Upload progress
  - File list with remove option

- [ ] Display generated test cases:
  - Test case name
  - Execution steps
  - Expected results
  - Code snippets (syntax highlighted)
  - Download buttons

- [ ] Add code syntax highlighting

**Deliverables:**
- Step 4 UI component
- File upload interface
- Test case display

**Files to Create:**
```
/src/components/wizard/Step4TestGeneration.tsx
/src/components/upload/FileUpload.tsx
/src/components/upload/FileList.tsx
/src/components/wizard/TestCaseDisplay.tsx
```

---

## Phase 9: Assessment Wizard - Step 5

### Step 9.1: Step 5 API - Vulnerability Analysis
**Objective:** Analyze test results and generate final report

**Tasks:**
- [ ] Create Step 5 API route:
  ```typescript
  // src/app/api/assessments/[id]/step5/route.ts
  POST /api/assessments/:id/step5
  
  // 1. Get uploaded test results
  // 2. Parse results
  // 3. Call LLM for vulnerability analysis
  // 4. Perform CVE mapping
  // 5. Calculate risk scores
  // 6. Generate recommendations
  // 7. Store in step5_final_report table
  // 8. Generate PDF report
  ```

- [ ] Implement result parsing for various formats (JSON, CSV, TXT)
- [ ] Integrate CVE database lookup (optional)
- [ ] Implement risk scoring algorithm
- [ ] Create PDF generation logic

**Deliverables:**
- Step 5 API route
- Vulnerability analysis
- Report generation

**Files to Create:**
```
/src/app/api/assessments/[id]/step5/route.ts
/src/app/api/assessments/[id]/step5/report/route.ts
/src/lib/reports/pdf-generator.ts
/src/lib/reports/markdown-generator.ts
```

---

### Step 9.2: Step 5 Frontend
**Objective:** Build final report UI

**Tasks:**
- [ ] Create Step 5 component:
  ```typescript
  // src/components/wizard/Step5FinalReport.tsx
  ```

- [ ] Display:
  - Overall compliance status (badge/icon)
  - Vulnerability list:
    - Severity
    - Description
    - CVE references
    - Affected components
  - Risk score visualization
  - Recommendations (prioritized)
  - Download buttons (PDF, Markdown)

- [ ] Create report preview
- [ ] Add export functionality

**Deliverables:**
- Step 5 UI component
- Report visualization
- Download functionality

**Files to Create:**
```
/src/components/wizard/Step5FinalReport.tsx
/src/components/reports/ComplianceStatus.tsx
/src/components/reports/VulnerabilityList.tsx
/src/components/reports/RecommendationsList.tsx
/src/components/reports/ReportPreview.tsx
```

---

## Phase 10: Main Application Pages

### Step 10.1: Landing Page
**Objective:** Create main landing page with auth-aware UI

**Tasks:**
- [ ] Create landing page component:
  ```typescript
  // src/app/page.tsx
  ```

- [ ] Implement auth state detection
- [ ] Create two views:
  - **Unauthenticated:**
    - Hero section
    - Feature highlights
    - Sign In / Sign Up CTAs
  - **Authenticated:**
    - Welcome message
    - Start Compliance Assessment button
    - My Assessments link
    - Upload Questionnaire link (admin)

- [ ] Add smooth transitions between states

**Deliverables:**
- Landing page with dual state
- Auth-aware navigation

**Files to Create:**
```
/src/app/page.tsx
/src/components/landing/HeroSection.tsx
/src/components/landing/Features.tsx
/src/components/landing/AuthenticatedHome.tsx
```

---

### Step 10.2: Assessment Dashboard
**Objective:** Create dashboard to view all user assessments

**Tasks:**
- [ ] Create assessments page:
  ```typescript
  // src/app/(authenticated)/assessments/page.tsx
  ```

- [ ] Display assessment list:
  - Assessment name
  - Current step
  - Status
  - Created date
  - Last updated
  - Actions (Resume, Delete)

- [ ] Add filtering and sorting
- [ ] Add "New Assessment" button
- [ ] Implement assessment deletion

**Deliverables:**
- Assessment dashboard
- Assessment list UI

**Files to Create:**
```
/src/app/(authenticated)/assessments/page.tsx
/src/app/(authenticated)/assessments/layout.tsx
/src/components/assessments/AssessmentList.tsx
/src/components/assessments/AssessmentCard.tsx
```

---

### Step 10.3: Wizard Layout & Navigation
**Objective:** Create wizard container with step navigation

**Tasks:**
- [ ] Create wizard layout:
  ```typescript
  // src/app/(authenticated)/assessments/[id]/layout.tsx
  ```

- [ ] Implement step navigation:
  - Step indicator (1-5)
  - Progress bar
  - Back/Next buttons
  - Save & Exit

- [ ] Add step validation
- [ ] Implement auto-save
- [ ] Add confirmation dialogs

**Deliverables:**
- Wizard layout component
- Step navigation
- Progress tracking

**Files to Create:**
```
/src/app/(authenticated)/assessments/[id]/layout.tsx
/src/app/(authenticated)/assessments/[id]/page.tsx (redirects to current step)
/src/app/(authenticated)/assessments/[id]/questionnaire/page.tsx
/src/app/(authenticated)/assessments/[id]/step1/page.tsx
/src/app/(authenticated)/assessments/[id]/step2/page.tsx
/src/app/(authenticated)/assessments/[id]/step3/page.tsx
/src/app/(authenticated)/assessments/[id]/step4/page.tsx
/src/app/(authenticated)/assessments/[id]/step5/page.tsx
/src/components/wizard/WizardLayout.tsx
/src/components/wizard/StepIndicator.tsx
/src/hooks/useWizard.ts
```

---

## Phase 11: UI Components & Styling

### Step 11.1: Design System Setup
**Objective:** Establish consistent design system

**Tasks:**
- [ ] Configure Tailwind CSS theme:
  ```javascript
  // tailwind.config.js
  // Define color palette, typography, spacing
  ```

- [ ] Create design tokens:
  ```typescript
  // src/styles/tokens.ts
  ```

- [ ] Set up CSS variables for theming
- [ ] Create global styles

**Deliverables:**
- Tailwind configuration
- Design tokens
- Global styles

**Files to Create:**
```
/tailwind.config.js
/src/styles/globals.css
/src/styles/tokens.ts
```

---

### Step 11.2: Reusable UI Components
**Objective:** Build component library

**Tasks:**
- [ ] Create base components:
  - Button (variants: primary, secondary, danger, ghost)
  - Input
  - Textarea
  - Select
  - Checkbox
  - Radio
  - Card
  - Badge
  - Alert
  - Modal
  - Loading spinner
  - Progress bar
  - Tooltip
  - Accordion

- [ ] Use class-variance-authority for variants
- [ ] Add proper accessibility (ARIA labels, keyboard navigation)
- [ ] Create Storybook stories (optional)

**Deliverables:**
- Complete UI component library
- Consistent styling

**Files to Create:**
```
/src/components/ui/Button.tsx
/src/components/ui/Input.tsx
/src/components/ui/Select.tsx
/src/components/ui/Checkbox.tsx
/src/components/ui/Radio.tsx
/src/components/ui/Card.tsx
/src/components/ui/Badge.tsx
/src/components/ui/Alert.tsx
/src/components/ui/Modal.tsx
/src/components/ui/Spinner.tsx
/src/components/ui/Progress.tsx
/src/components/ui/Tooltip.tsx
/src/components/ui/Accordion.tsx
```

---

## Phase 12: Testing & Quality Assurance

### Step 12.1: Unit Testing Setup
**Objective:** Set up testing infrastructure

**Tasks:**
- [ ] Install testing dependencies:
  ```bash
  npm install -D jest @testing-library/react @testing-library/jest-dom
  npm install -D @testing-library/user-event jest-environment-jsdom
  ```

- [ ] Configure Jest:
  ```javascript
  // jest.config.js
  ```

- [ ] Create test utilities:
  ```typescript
  // src/test/utils.tsx
  // Custom render function with providers
  ```

**Deliverables:**
- Jest configuration
- Testing utilities

**Files to Create:**
```
/jest.config.js
/jest.setup.js
/src/test/utils.tsx
```

---

### Step 12.2: Write Tests
**Objective:** Achieve good test coverage

**Tasks:**
- [ ] Write unit tests for:
  - Utility functions
  - LLM client
  - Auth functions
  - API route handlers

- [ ] Write component tests for:
  - UI components
  - Form components
  - Wizard steps

- [ ] Write integration tests for:
  - Authentication flow
  - Assessment workflow
  - File upload

- [ ] Aim for >70% coverage on critical paths

**Deliverables:**
- Test suite
- Test coverage report

**Files to Create:**
```
/src/__tests__/lib/llm/client.test.ts
/src/__tests__/lib/auth/session.test.ts
/src/__tests__/components/ui/Button.test.tsx
/src/__tests__/components/wizard/Step1.test.tsx
```

---

### Step 12.3: End-to-End Testing
**Objective:** Test complete user flows

**Tasks:**
- [ ] Install Playwright:
  ```bash
  npm install -D @playwright/test
  ```

- [ ] Write E2E tests for:
  - Sign up flow
  - Sign in flow
  - Complete assessment workflow (all 5 steps)
  - File upload
  - Report generation

**Deliverables:**
- E2E test suite

**Files to Create:**
```
/playwright.config.ts
/e2e/auth.spec.ts
/e2e/assessment-flow.spec.ts
```

---

## Phase 13: Security Hardening

### Step 13.1: Security Audit
**Objective:** Ensure application security

**Tasks:**
- [ ] Verify RLS policies on all tables
- [ ] Test unauthorized access attempts
- [ ] Implement rate limiting on API routes
- [ ] Add CSRF protection
- [ ] Implement file upload security:
  - File type validation
  - Size limits
  - Malware scanning (if available)
- [ ] Sanitize LLM inputs/outputs
- [ ] Review environment variable usage
- [ ] Ensure no secrets in client code
- [ ] Add security headers

**Deliverables:**
- Security audit report
- Security improvements implemented

**Files to Create:**
```
/src/middleware.ts (updated with security headers)
/src/lib/security/rate-limiter.ts
/src/lib/security/file-validator.ts
/SECURITY.md
```

---

### Step 13.2: Error Handling & Logging
**Objective:** Implement comprehensive error handling

**Tasks:**
- [ ] Create error handling utilities:
  ```typescript
  // src/lib/errors/handler.ts
  ```

- [ ] Implement logging system:
  - Console logs (development)
  - Structured logging (production)
  - Error tracking (Sentry optional)

- [ ] Add error boundaries in React
- [ ] Create user-friendly error messages
- [ ] Implement retry logic for transient errors

**Deliverables:**
- Error handling system
- Logging infrastructure

**Files to Create:**
```
/src/lib/errors/handler.ts
/src/lib/errors/types.ts
/src/lib/logging/logger.ts
/src/components/ErrorBoundary.tsx
```

---

## Phase 14: Deployment Preparation

### Step 14.1: Vercel Configuration
**Objective:** Configure for Vercel deployment

**Tasks:**
- [ ] Create `vercel.json`:
  ```json
  {
    "buildCommand": "npm run build",
    "devCommand": "npm run dev",
    "installCommand": "npm install",
    "framework": "nextjs",
    "regions": ["iad1"]
  }
  ```

- [ ] Configure environment variables in Vercel dashboard
- [ ] Set up production Supabase project
- [ ] Configure OpenAI API key
- [ ] Set up domain (optional)

**Deliverables:**
- Vercel configuration
- Production environment setup

**Files to Create:**
```
/vercel.json
```

---

### Step 14.2: Build Optimization
**Objective:** Optimize production build

**Tasks:**
- [ ] Configure Next.js for production:
  ```javascript
  // next.config.js
  module.exports = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ['your-supabase-project.supabase.co']
    }
  };
  ```

- [ ] Optimize images
- [ ] Implement code splitting
- [ ] Add bundle analyzer
- [ ] Minimize bundle size
- [ ] Enable compression

**Deliverables:**
- Optimized production build
- Performance improvements

**Files to Create:**
```
/next.config.js (updated)
```

---

### Step 14.3: Documentation
**Objective:** Create comprehensive documentation

**Tasks:**
- [ ] Create README.md with:
  - Project overview
  - Tech stack
  - Setup instructions
  - Environment variables
  - Development workflow
  - Deployment guide

- [ ] Create API documentation
- [ ] Document database schema
- [ ] Create user guide
- [ ] Write developer guide
- [ ] Document LLM prompts

**Deliverables:**
- Complete documentation

**Files to Create:**
```
/README.md
/docs/API.md
/docs/DATABASE.md
/docs/USER_GUIDE.md
/docs/DEVELOPER_GUIDE.md
/docs/LLM_PROMPTS.md
```

---

## Phase 15: Local Development & Testing

### Step 15.1: Ollama Setup
**Objective:** Configure local Ollama for development

**Tasks:**
- [ ] Install Ollama locally
- [ ] Pull required models:
  ```bash
  ollama pull deepseek-coder
  ollama pull llama2
  ```

- [ ] Test Ollama API:
  ```bash
  curl http://localhost:11434/api/generate -d '{"model": "deepseek-coder", "prompt": "test"}'
  ```

- [ ] Configure OLLAMA_BASE_URL in .env.local
- [ ] Test LLM client with Ollama

**Deliverables:**
- Working local LLM setup
- Ollama configuration guide

**Files to Create:**
```
/docs/OLLAMA_SETUP.md
```

---

### Step 15.2: Development Scripts
**Objective:** Create helpful development scripts

**Tasks:**
- [ ] Create database seed script:
  ```typescript
  // src/scripts/seed-db.ts
  // Create sample assessments, questionnaires
  ```

- [ ] Create database reset script
- [ ] Create user creation script
- [ ] Add NPM scripts:
  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "playwright test",
    "seed": "tsx src/scripts/seed-db.ts",
    "db:reset": "tsx src/scripts/reset-db.ts"
  }
  ```

**Deliverables:**
- Development scripts
- Seeding utilities

**Files to Create:**
```
/src/scripts/seed-db.ts
/src/scripts/reset-db.ts
/src/scripts/create-user.ts
/package.json (updated)
```

---

## Phase 16: Final Testing & Launch

### Step 16.1: User Acceptance Testing
**Objective:** Validate with real users

**Tasks:**
- [ ] Create test accounts
- [ ] Prepare test data
- [ ] Conduct user testing sessions
- [ ] Collect feedback
- [ ] Fix identified issues
- [ ] Document known issues

**Deliverables:**
- UAT report
- Bug fixes

---

### Step 16.2: Production Deployment
**Objective:** Deploy to production

**Tasks:**
- [ ] Final security review
- [ ] Run all tests
- [ ] Build production bundle
- [ ] Deploy to Vercel
- [ ] Verify environment variables
- [ ] Test production deployment
- [ ] Monitor error logs
- [ ] Set up uptime monitoring

**Deliverables:**
- Live production application

---

### Step 16.3: Post-Launch Monitoring
**Objective:** Monitor application health

**Tasks:**
- [ ] Set up monitoring:
  - Vercel Analytics
  - Error tracking
  - Performance monitoring
  - Database metrics

- [ ] Create runbook for common issues
- [ ] Set up alerts
- [ ] Document incident response process

**Deliverables:**
- Monitoring setup
- Runbook

**Files to Create:**
```
/docs/RUNBOOK.md
/docs/MONITORING.md
```

---

## 📊 Project Timeline Estimate

| Phase | Estimated Duration | Priority |
|-------|-------------------|----------|
| Phase 1: Foundation & Setup | 2-3 days | Critical |
| Phase 2: Database & Auth | 3-4 days | Critical |
| Phase 3: LLM Abstraction | 2-3 days | Critical |
| Phase 4: Questionnaire | 2-3 days | High |
| Phase 5: Step 1 | 2 days | High |
| Phase 6: Step 2 | 2 days | High |
| Phase 7: Step 3 | 2 days | High |
| Phase 8: Step 4 | 3-4 days | High |
| Phase 9: Step 5 | 3-4 days | High |
| Phase 10: Main Pages | 2-3 days | High |
| Phase 11: UI Components | 2-3 days | Medium |
| Phase 12: Testing | 3-4 days | High |
| Phase 13: Security | 2-3 days | Critical |
| Phase 14: Deployment | 1-2 days | Critical |
| Phase 15: Local Dev | 1-2 days | Medium |
| Phase 16: Launch | 2-3 days | Critical |

**Total Estimated Duration: 6-8 weeks**

---

## 🎯 Success Criteria

### Functional Requirements
- [ ] User can sign up/sign in
- [ ] User can complete questionnaire
- [ ] System recommends regulations (Step 1)
- [ ] System extracts requirements (Step 2)
- [ ] System maps test specifications (Step 3)
- [ ] User can upload code, system generates tests (Step 4)
- [ ] User can upload results, system analyzes and generates report (Step 5)
- [ ] All data is user-isolated (RLS working)
- [ ] Reports are downloadable

### Technical Requirements
- [ ] Works on local (Ollama) and production (OpenAI)
- [ ] Auto-detects environment
- [ ] All API routes validate sessions
- [ ] No hardcoded credentials
- [ ] All secrets in environment variables
- [ ] Responsive UI on mobile/tablet/desktop
- [ ] Accessibility standards met

### Security Requirements
- [ ] RLS enforced on all tables
- [ ] File uploads validated
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] CSRF protection enabled
- [ ] Rate limiting on API routes

---

## 🔄 Maintenance & Future Enhancements

### Short-term (1-3 months)
- Add more OAuth providers
- Implement email verification
- Add password reset flow
- Create admin dashboard
- Add export to Excel/CSV
- Implement notification system

### Medium-term (3-6 months)
- Add collaborative assessments
- Implement assessment templates
- Add API for third-party integrations
- Create mobile app
- Add real-time collaboration
- Implement audit logging

### Long-term (6-12 months)
- AI-powered requirement suggestions
- Automatic code vulnerability scanning
- Integration with CI/CD pipelines
- Multi-language support
- Advanced analytics dashboard
- Machine learning for better recommendations

---

## 📚 Resources & References

### Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Documentation](https://supabase.com/docs)
- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [OpenAI API](https://platform.openai.com/docs/api-reference)

### Key Libraries
- [@supabase/auth-helpers-nextjs](https://github.com/supabase/auth-helpers)
- [Zod](https://zod.dev/) - Schema validation
- [React Hook Form](https://react-hook-form.com/) - Form management
- [Cheerio](https://cheerio.js.org/) - HTML parsing
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation

---

## 🎬 Getting Started

To begin implementation:

1. **Review this plan** with your team
2. **Set up development environment** (Node.js, Git, VS Code)
3. **Create Supabase project** and note credentials
4. **Follow Phase 1** step by step
5. **Commit regularly** to version control
6. **Test continuously** as you build

---

## ✅ Next Actions

1. Review and approve this implementation plan
2. Set up project repository
3. Create Supabase project
4. Begin Phase 1: Project Foundation & Setup

---

**Document Version:** 1.0  
**Last Updated:** February 1, 2026  
**Status:** Ready for Implementation
