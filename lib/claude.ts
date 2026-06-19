import { lifePathDescriptions } from './numerology';
import { fetchAstrologyChart, formatChartForPrompt, BirthData } from './astrology';

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

  // Fetch real astrology chart
  let chartSection = '';
  try {
    const birthData: BirthData = {
      name: input.name,
      dob: input.dob,
      birthTime: input.birthTime || '12:00',
      birthPlace: input.birthPlace,
    };
    const chart = await fetchAstrologyChart(birthData);
    chartSection = formatChartForPrompt(chart, input.name);
    console.log(`Chart fetched from: ${chart.source}`);
  } catch (err) {
    console.error('Chart fetch error:', err);
    chartSection = 'Note: Astrology chart data unavailable. Generate reading based on numerology only.';
  }

  const prompt = `You are NAKSH369, a master Vedic astrologer and numerologist. Create a deeply personalized Life Blueprint for ${input.name}.

BIRTH DATA:
- DOB: ${input.dob} | Time: ${input.birthTime || 'Unknown'} | Place: ${input.birthPlace}
- Gender: ${input.gender}
- Life Path: ${input.lifePathNumber} (${lifePathDesc})
- Personal Year ${new Date().getFullYear()}: ${input.personalYear}
${chartSection}
${input.questions ? `\nClient Questions: ${input.questions}` : ''}

Write a focused, deeply personal Life Blueprint in HTML. Use the REAL chart data above to make it specific and accurate. Cover these 5 sections in second person ("You are...", "Your path..."):

1. Soul Overview & Life Mission
   - Life Path ${input.lifePathNumber} interpretation
   - Birth Nakshatra significance (if available)
   - Sun/Moon/Rising signs meaning (if available)

2. Current Life Period
   - Personal Year ${input.personalYear} in ${new Date().getFullYear()}
   - Current Dasha period insights (if available)
   - What this period means for ${input.name}

3. Career & Purpose
   - Natural gifts from chart
   - Ideal career paths
   - Business/work timing advice

4. Love & Relationships
   - Relationship patterns from chart
   - What ${input.name} needs in a partner
   - Current relationship timing

5. Specific Guidance
   - Answer client questions directly
   - Activation recommendations (Mantra, Gemstone, Color)
   - Key dates/periods to watch

Rules:
- Use REAL chart data — mention actual planets, nakshatra, dasha by name
- 120-150 words per section (total ~700 words)
- Warm, specific, deeply personal — not generic
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
      max_tokens: 2000,
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
