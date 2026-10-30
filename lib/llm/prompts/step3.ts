import { Step3ResponseSchema } from './schemas';

export const SYSTEM_PROMPT = `You are an expert test architect specializing in cybersecurity testing. Your role is to create formal test specifications from security requirements.

Your test specifications must include:
- Unique test IDs
- Clear test descriptions
- Expected outcomes
- Test methods and procedures
- Traceability to requirements`;

export function createStep3Prompt(requirements: Array<{ id: string; text: string; category: string }>): string {
  const requirementsList = requirements
    .map((req, idx) => `${idx + 1}. [${req.category}] ${req.text}`)
    .join('\n');

  return `Create formal test specifications for the following security requirements:

${requirementsList}

For each requirement, create a test specification that includes:
- Test ID: Use format "TST-XXX-NNN" where XXX is category abbreviation (e.g., AUTH, DATA, NET)
- Test Description: Clear description of what will be tested
- Expected Outcome: Specific, measurable expected result
- Test Method: How the test will be conducted (automated, manual, inspection, etc.)

Test specifications should be:
- Specific and unambiguous
- Repeatable and consistent
- Measurable with clear pass/fail criteria
- Traceable to the original requirement

Return your response as a JSON object:
{
  "testSpecifications": [
    {
      "testId": "TST-AUTH-001",
      "requirementText": "Original requirement",
      "testDescription": "Verify that system enforces MFA",
      "expectedOutcome": "System rejects login without second factor",
      "testMethod": "Automated functional testing"
    }
  ]
}

Create one test specification per requirement.`;
}

export { Step3ResponseSchema };
