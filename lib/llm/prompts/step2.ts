import { Step2ResponseSchema } from './schemas';

export const SYSTEM_PROMPT = `You are an expert in cybersecurity standards and compliance requirements. Your role is to extract specific, testable requirements from regulations and standards.

Your extracted requirements must be:
- Specific and measurable
- Testable through technical means
- Clearly categorized
- Mapped to standard clauses when possible
- Prioritized by criticality`;

export function createStep2Prompt(
  regulationName: string,
  userContext: string
): string {
  return `Extract testable cybersecurity requirements from the ${regulationName} standard for a smart home system.

User Context:
${userContext}

Extract requirements in these categories:
1. Authentication & Access Control
2. Data Protection & Encryption
3. Network Security
4. Physical Security
5. Monitoring & Logging
6. Incident Response
7. Software Security
8. Update & Patch Management

For each requirement:
- Provide clear, actionable requirement text
- Assign appropriate category
- Include standard clause reference if applicable
- Set priority level (critical, high, medium, low)

Focus on requirements that are:
- Technically testable
- Relevant to IoT/smart home devices
- Practical to implement
- Security-focused

Return your response as a JSON object:
{
  "requirements": [
    {
      "text": "System must enforce multi-factor authentication",
      "category": "Authentication & Access Control",
      "standardClause": "Section 4.2.1",
      "priority": "critical"
    }
  ],
  "totalCount": 25
}

Aim for 20-30 comprehensive requirements covering all critical security aspects.`;
}

export { Step2ResponseSchema };
