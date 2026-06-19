import { lifePathDescriptions } from './numerology';

export interface BlueprintInput {
  name: string;
  dob: string;
  birthTime?: string;
  birthPlace: string;
  gender: string;
  lifePathNumber: number;
  birthdayNumber: number;
  personalYear: number;
  questions?: string;
  readingType: string;
}

export async function generateBlueprintWithClaude(input: BlueprintInput): Promise<string> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error('CLAUDE_API_KEY is not set');

  const lifePathDesc = lifePathDescriptions[input.lifePathNumber] || 'A unique soul path';

  const prompt = `You are NAKSH369, a master astro-numerologist. Create a personalized Life Blueprint for ${input.name}.

BIRTH DATA:
- DOB: ${input.dob} | Time: ${input.birthTime || 'Unknown'} | Place: ${input.birthPlace}
- Gender: ${input.gender} | Life Path: ${input.lifePathNumber} (${lifePathDesc})
- Personal Year ${new Date().getFullYear()}: ${input.personalYear}
${input.questions ? `\nClient Questions: ${input.questions}` : ''}

Write a focused, deeply personal Life Blueprint in HTML. Cover these 5 areas in second person ("You are...", "Your path..."):

1. Soul Overview & Life Mission (Life Path ${input.lifePathNumber})
2. This Year's Energy (Personal Year ${input.personalYear} in ${new Date().getFullYear()})  
3. Career & Purpose — natural gifts and ideal paths
4. Love & Relationships — patterns and what they need
5. Specific Guidance — address client questions directly

Rules:
- 100-150 words per section (total ~600-700 words)
- Warm, specific, insightful — not generic
- HTML using only h2, p, ul, li tags — no CSS
- Start with: <div class="blueprint">
- End with: </div>`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.content?.[0];
  if (!content || content.type !== 'text') {
    throw new Error('Unexpected response from Claude API');
  }

  let html = content.text as string;
  if (!html.includes('</div>')) html += '\n</div>';
  return html;
}
