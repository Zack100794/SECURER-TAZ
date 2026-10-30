export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questionnaires: {
        Row: {
          id: string
          name: string
          description: string | null
          version: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          version?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          version?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          questionnaire_id: string
          section_title: string
          question_number: number
          question_text: string
          input_type: 'radio' | 'checkbox' | 'text' | 'textarea' | 'select'
          options: Json | null
          is_required: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          questionnaire_id: string
          section_title: string
          question_number: number
          question_text: string
          input_type: 'radio' | 'checkbox' | 'text' | 'textarea' | 'select'
          options?: Json | null
          is_required?: boolean
          display_order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          questionnaire_id?: string
          section_title?: string
          question_number?: number
          question_text?: string
          input_type?: 'radio' | 'checkbox' | 'text' | 'textarea' | 'select'
          options?: Json | null
          is_required?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          name: string
          current_step: number
          status: 'in_progress' | 'completed' | 'archived'
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          current_step?: number
          status?: 'in_progress' | 'completed' | 'archived'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          current_step?: number
          status?: 'in_progress' | 'completed' | 'archived'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questionnaire_responses: {
        Row: {
          id: string
          assessment_id: string
          question_id: string
          response_value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          question_id: string
          response_value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          question_id?: string
          response_value?: string
          created_at?: string
          updated_at?: string
        }
      }
      step1_regulation_analysis: {
        Row: {
          id: string
          assessment_id: string
          recommended_regulations: Json
          selected_regulation: string | null
          reasoning: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          recommended_regulations: Json
          selected_regulation?: string | null
          reasoning?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          recommended_regulations?: Json
          selected_regulation?: string | null
          reasoning?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      step2_requirements: {
        Row: {
          id: string
          assessment_id: string
          requirement_text: string
          category: string
          standard_clause: string | null
          is_selected: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          requirement_text: string
          category: string
          standard_clause?: string | null
          is_selected?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          requirement_text?: string
          category?: string
          standard_clause?: string | null
          is_selected?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      step3_test_specifications: {
        Row: {
          id: string
          assessment_id: string
          requirement_id: string
          test_id: string
          test_description: string
          expected_outcome: string
          test_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          requirement_id: string
          test_id: string
          test_description: string
          expected_outcome: string
          test_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          requirement_id?: string
          test_id?: string
          test_description?: string
          expected_outcome?: string
          test_method?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      uploaded_files: {
        Row: {
          id: string
          assessment_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          uploaded_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          uploaded_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          uploaded_at?: string
        }
      }
      step4_test_cases: {
        Row: {
          id: string
          assessment_id: string
          test_spec_id: string
          test_case_name: string
          test_code: string
          programming_language: string
          file_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          test_spec_id: string
          test_case_name: string
          test_code: string
          programming_language: string
          file_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          test_spec_id?: string
          test_case_name?: string
          test_code?: string
          programming_language?: string
          file_path?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      step5_final_report: {
        Row: {
          id: string
          assessment_id: string
          overall_status: 'compliant' | 'non_compliant' | 'partial'
          vulnerabilities: Json
          recommendations: Json
          risk_score: number | null
          report_pdf_path: string | null
          report_markdown: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          overall_status: 'compliant' | 'non_compliant' | 'partial'
          vulnerabilities: Json
          recommendations: Json
          risk_score?: number | null
          report_pdf_path?: string | null
          report_markdown?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          overall_status?: 'compliant' | 'non_compliant' | 'partial'
          vulnerabilities?: Json
          recommendations?: Json
          risk_score?: number | null
          report_pdf_path?: string | null
          report_markdown?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
