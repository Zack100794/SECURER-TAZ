import { z } from 'zod';

// Step 1: Regulation Analysis Schemas
export const RegulationRecommendationSchema = z.object({
  name: z.string(),
  description: z.string(),
  relevanceScore: z.number().min(0).max(100),
  reasoning: z.string(),
  keyRequirements: z.array(z.string()),
});

export const Step1ResponseSchema = z.object({
  recommendations: z.array(RegulationRecommendationSchema),
  analysis: z.string(),
});

export type RegulationRecommendation = z.infer<typeof RegulationRecommendationSchema>;
export type Step1Response = z.infer<typeof Step1ResponseSchema>;

// Step 2: Requirements Extraction Schemas
export const RequirementSchema = z.object({
  text: z.string(),
  category: z.string(),
  standardClause: z.string().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
});

export const Step2ResponseSchema = z.object({
  requirements: z.array(RequirementSchema),
  totalCount: z.number(),
});

export type Requirement = z.infer<typeof RequirementSchema>;
export type Step2Response = z.infer<typeof Step2ResponseSchema>;

// Step 3: Test Specification Schemas
export const TestSpecificationSchema = z.object({
  testId: z.string(),
  requirementText: z.string(),
  testDescription: z.string(),
  expectedOutcome: z.string(),
  testMethod: z.string(),
});

export const Step3ResponseSchema = z.object({
  testSpecifications: z.array(TestSpecificationSchema),
});

export type TestSpecification = z.infer<typeof TestSpecificationSchema>;
export type Step3Response = z.infer<typeof Step3ResponseSchema>;

// Step 4: Test Case Generation Schemas
export const TestCaseSchema = z.object({
  name: z.string(),
  description: z.string(),
  code: z.string(),
  language: z.string(),
  framework: z.string().optional(),
});

export const Step4ResponseSchema = z.object({
  testCases: z.array(TestCaseSchema),
  language: z.string(),
  totalTests: z.number(),
});

export type TestCase = z.infer<typeof TestCaseSchema>;
export type Step4Response = z.infer<typeof Step4ResponseSchema>;

// Step 5: Vulnerability Analysis Schemas
export const VulnerabilitySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  affectedRequirement: z.string(),
  cveId: z.string().optional(),
  recommendation: z.string(),
});

export const RecommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(['immediate', 'short_term', 'long_term']),
  effort: z.enum(['low', 'medium', 'high']),
});

export const Step5ResponseSchema = z.object({
  overallStatus: z.enum(['compliant', 'non_compliant', 'partial']),
  riskScore: z.number().min(0).max(100),
  vulnerabilities: z.array(VulnerabilitySchema),
  recommendations: z.array(RecommendationSchema),
  summary: z.string(),
  compliancePercentage: z.number().min(0).max(100),
});

export type Vulnerability = z.infer<typeof VulnerabilitySchema>;
export type RecommendationItem = z.infer<typeof RecommendationSchema>;
export type Step5Response = z.infer<typeof Step5ResponseSchema>;
