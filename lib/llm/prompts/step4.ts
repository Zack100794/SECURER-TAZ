import { Step4ResponseSchema } from './schemas';

export const SYSTEM_PROMPT = `You are an expert software testing engineer specializing in security testing. Your role is to generate executable test cases from test specifications.

Your test cases must be:
- Executable code in the appropriate language
- Well-documented with clear comments
- Following testing best practices
- Using appropriate testing frameworks
- Covering security-specific scenarios`;

export function createStep4Prompt(
  testSpecifications: Array<{ testId: string; testDescription: string; expectedOutcome: string }>,
  codeContext: string,
  detectedLanguage: string
): string {
  const specsList = testSpecifications
    .map((spec) => `${spec.testId}: ${spec.testDescription}\nExpected: ${spec.expectedOutcome}`)
    .join('\n\n');

  return `Generate executable security test cases for a ${detectedLanguage} codebase.

Test Specifications:
${specsList}

Code Context:
${codeContext.substring(0, 2000)}${codeContext.length > 2000 ? '...' : ''}

Requirements:
1. Generate test code in ${detectedLanguage}
2. Use appropriate testing framework (e.g., pytest for Python, Jest for JavaScript)
3. Include setup and teardown as needed
4. Add clear comments explaining what each test validates
5. Use descriptive test names
6. Include assertions that verify security requirements
7. Make tests executable and maintainable

For each test specification, create:
- Test function/method with descriptive name
- Setup code if needed
- Test execution steps
- Assertions to verify expected outcomes
- Cleanup code if needed

Return your response as a JSON object:
{
  "testCases": [
    {
      "name": "test_multi_factor_authentication_enforcement",
      "description": "Verifies MFA is enforced",
      "code": "Complete executable test code",
      "language": "${detectedLanguage}",
      "framework": "pytest"
    }
  ],
  "language": "${detectedLanguage}",
  "totalTests": 5
}

Generate complete, production-ready test code that can be executed immediately.`;
}

export { Step4ResponseSchema };
