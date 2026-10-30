import { Step5ResponseSchema } from './schemas';

export const SYSTEM_PROMPT = `You are an expert cybersecurity auditor specializing in vulnerability analysis and compliance reporting. Your role is to analyze test results and generate comprehensive security assessment reports.

Your analysis must include:
- Identification of vulnerabilities and security gaps
- Risk assessment and scoring
- Compliance status evaluation
- Actionable recommendations
- Clear, executive-level summaries`;

export function createStep5Prompt(
  testResults: string,
  originalRequirements: Array<{ text: string; category: string }>,
  regulationName: string
): string {
  const requirementsList = originalRequirements
    .map((req) => `- [${req.category}] ${req.text}`)
    .join('\n');

  return `Analyze the following security test results and generate a comprehensive compliance report for ${regulationName}.

Test Results:
${testResults.substring(0, 3000)}${testResults.length > 3000 ? '...' : ''}

Original Requirements:
${requirementsList}

Perform a thorough analysis and provide:

1. OVERALL STATUS: Determine if the system is:
   - compliant: All critical requirements met
   - non_compliant: Critical failures present
   - partial: Some requirements not met but no critical failures

2. RISK SCORE: Calculate overall risk (0-100, where 100 is highest risk)

3. VULNERABILITIES: Identify specific security issues found:
   - Assign unique IDs (e.g., VUL-001)
   - Provide clear titles and descriptions
   - Set severity (critical, high, medium, low)
   - Map to affected requirements
   - Include CVE IDs if known vulnerabilities
   - Provide specific remediation recommendations

4. RECOMMENDATIONS: Prioritized action items:
   - Clear titles and descriptions
   - Priority (immediate, short_term, long_term)
   - Implementation effort (low, medium, high)

5. SUMMARY: Executive summary of findings

6. COMPLIANCE PERCENTAGE: What % of requirements are met

Return your response as a JSON object:
{
  "overallStatus": "partial",
  "riskScore": 65,
  "vulnerabilities": [
    {
      "id": "VUL-001",
      "title": "Weak Authentication",
      "description": "System allows single-factor authentication",
      "severity": "high",
      "affectedRequirement": "Multi-factor authentication required",
      "cveId": "CVE-2023-XXXXX",
      "recommendation": "Implement MFA for all user accounts"
    }
  ],
  "recommendations": [
    {
      "title": "Enable Multi-Factor Authentication",
      "description": "Deploy MFA solution across all authentication points",
      "priority": "immediate",
      "effort": "medium"
    }
  ],
  "summary": "The system shows moderate security posture with several high-priority issues requiring immediate attention...",
  "compliancePercentage": 72
}

Be thorough, specific, and actionable in your analysis.`;
}

export { Step5ResponseSchema };
