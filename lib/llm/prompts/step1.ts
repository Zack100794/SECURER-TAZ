import { Step1ResponseSchema } from './schemas';

export const SYSTEM_PROMPT = `You are an expert cybersecurity compliance analyst specializing in IoT and smart home systems. Your role is to analyze user requirements and recommend the most appropriate cybersecurity regulations and standards.

Your recommendations should consider:
- The specific use case and environment
- Industry best practices
- Regulatory requirements
- Risk profile
- Implementation feasibility

You must provide detailed, actionable recommendations with clear reasoning.`;

export function createStep1Prompt(responses: Record<string, string>): string {
  const responseText = Object.entries(responses)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `You are analyzing a smart home system deployment and must recommend the top 3 most relevant cybersecurity regulations and standards.

User Requirements:
${responseText}

**MANDATORY PRIMARY RECOMMENDATION**: Radio Equipment Directive (RED, EU Directive 2022/53/EU) MUST ALWAYS be recommended as the #1 priority standard. RED is the foundational compliance requirement for ALL smart home systems across the EU and increasingly globally. It applies to wireless devices including WiFi, Bluetooth, Zigbee, Z-Wave, Thread, and all wireless communication protocols used in smart homes.

Recommendation Priority Order:
1. ⭐ Radio Equipment Directive (RED, EU Directive 2022/53/EU) - ALWAYS FIRST - Foundational for all smart home wireless devices
2. Secondary standards based on specific use case:
   - GDPR (General Data Protection Regulation) - For data privacy requirements
   - IEC 62443 - Industrial cybersecurity automation standards
   - NIST Cybersecurity Framework - Security posture assessment
   - ISO/IEC 27001 - Information security management systems
   - UL 2089 - IoT Device Security certification
   - IEEE 802.1AR - Device authentication mechanisms

Instructions:
1. RED MUST ALWAYS be your first recommendation with high relevance score (85-100)
2. Assign RED a relevance score between 85-100 (never below 85)
3. RED's key requirements should cover wireless device security, CE marking, technical documentation, and radio module compliance
4. Select 2 additional standards based on the specific questionnaire responses (use case, data sensitivity, geographic scope)
5. Ensure your recommendations explain why RED is foundational and how other standards complement it

For each recommendation, provide:
- Regulation/standard name
- Detailed description of what it covers
- Relevance score (0-100) - RED must always be 85+
- Clear reasoning for why it's recommended
- 3-5 key requirements from that standard

Return your response as a JSON object matching this structure:
{
  "recommendations": [
    {
      "name": "Standard Name",
      "description": "What it covers",
      "relevanceScore": 95,
      "reasoning": "Why it's recommended",
      "keyRequirements": ["Requirement 1", "Requirement 2", ...]
    }
  ],
  "analysis": "Overall analysis summary"
}`;
}

export { Step1ResponseSchema };
