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

// Generate blueprint from raw astrology data (no AI)
export async function generateBlueprintWithClaude(input: BlueprintInput): Promise<string> {
  const lifePathDesc = lifePathDescriptions[input.lifePathNumber] || 'A unique soul path';
  const currentYear = new Date().getFullYear();

  // Fetch real astrology chart
  let chart: any = { source: 'fallback' };
  try {
    const birthData: BirthData = {
      name: input.name,
      dob: input.dob,
      birthTime: input.birthTime || '12:00',
      birthPlace: input.birthPlace,
    };
    chart = await fetchAstrologyChart(birthData);
  } catch (err) {
    console.error('Chart fetch error:', err);
  }

  // Build HTML report from raw data
  let html = `<div class="blueprint">`;

  // Header
  html += `<h2>Life Blueprint for ${input.name}</h2>`;
  html += `<p><strong>Date of Birth:</strong> ${input.dob} | <strong>Birth Time:</strong> ${input.birthTime || 'Not provided'} | <strong>Birth Place:</strong> ${input.birthPlace}</p>`;

  // Numerology Section
  html += `<h2>1. Numerology Profile</h2>`;
  html += `<p><strong>Life Path Number ${input.lifePathNumber}:</strong> ${lifePathDesc}</p>`;
  html += `<ul>`;
  html += `<li>Birthday Number: ${input.birthdayNumber}</li>`;
  html += `<li>Personal Year ${currentYear}: ${input.personalYear}</li>`;
  html += `</ul>`;

  // Astrology Chart Section
  if (chart.source !== 'fallback') {
    html += `<h2>2. Vedic Astrology Chart</h2>`;
    html += `<p><em>Chart data sourced from ${chart.source === 'astrologyapi' ? 'AstrologyAPI' : 'Prokerala'}</em></p>`;
    html += `<ul>`;
    
    if (chart.sunSign) html += `<li><strong>Sun Sign:</strong> ${chart.sunSign}</li>`;
    if (chart.moonSign) html += `<li><strong>Moon Sign:</strong> ${chart.moonSign}</li>`;
    if (chart.risingSign) html += `<li><strong>Ascendant/Rising:</strong> ${chart.risingSign}</li>`;

    // Nakshatra
    if (chart.nakshatraDetails) {
      const n = chart.nakshatraDetails;
      if (n.nakshatra) {
        const nakName = n.nakshatra?.name || n.nakshatra;
        html += `<li><strong>Birth Nakshatra:</strong> ${nakName}</li>`;
      }
      if (n.chandra_rasi) {
        const rasi = n.chandra_rasi?.name || n.chandra_rasi;
        html += `<li><strong>Chandra Rasi (Moon Sign):</strong> ${rasi}</li>`;
      }
      if (n.soorya_rasi) {
        const rasi = n.soorya_rasi?.name || n.soorya_rasi;
        html += `<li><strong>Soorya Rasi (Sun Sign):</strong> ${rasi}</li>`;
      }
      if (n.additional_info || n.zodiac) {
        const zodiac = n.zodiac?.name || '';
        if (zodiac) html += `<li><strong>Zodiac:</strong> ${zodiac}</li>`;
      }
    }
    html += `</ul>`;

    // Planet Positions
    if (chart.natalPlanets && Array.isArray(chart.natalPlanets) && chart.natalPlanets.length > 0) {
      html += `<h2>3. Planetary Positions</h2>`;
      html += `<ul>`;
      chart.natalPlanets.forEach((planet: any) => {
        if (planet.name && planet.sign) {
          const retro = planet.isRetro === 'true' || planet.isRetro === true ? ' (Retrograde)' : '';
          const house = planet.house ? ` — House ${planet.house}` : '';
          html += `<li><strong>${planet.name}:</strong> ${planet.sign}${house}${retro}</li>`;
        }
      });
      html += `</ul>`;
    }

    // Dasha
    if (chart.dashaDetails) {
      const d = chart.dashaDetails;
      html += `<h2>4. Current Dasha Period</h2>`;
      html += `<ul>`;
      
      const major = d.major_dasha || d.dasha || (d.dasha_periods && d.dasha_periods[0]);
      if (major) {
        const planet = major?.planet || major?.name || major;
        html += `<li><strong>Major Dasha (Mahadasha):</strong> ${planet}</li>`;
      }
      const sub = d.sub_dasha || d.antardasha || d.bhukti;
      if (sub) {
        const planet = sub?.planet || sub?.name || sub;
        html += `<li><strong>Sub Dasha (Antardasha):</strong> ${planet}</li>`;
      }
      html += `</ul>`;
      html += `<p>The current planetary period influences your life themes and timing. Use this period for activities aligned with the ruling planet's energy.</p>`;
    }

    // Kundali (Prokerala)
    if (chart.kundaliDetails) {
      const k = chart.kundaliDetails;
      html += `<h2>5. Kundali Details</h2>`;
      html += `<ul>`;
      if (k.nakshatra_details?.nakshatra) {
        html += `<li><strong>Nakshatra:</strong> ${k.nakshatra_details.nakshatra.name}</li>`;
      }
      if (k.nakshatra_details?.chandra_rasi) {
        html += `<li><strong>Moon Sign:</strong> ${k.nakshatra_details.chandra_rasi.name}</li>`;
      }
      if (k.mangal_dosha) {
        html += `<li><strong>Mangal Dosha:</strong> ${k.mangal_dosha.has_dosha ? 'Present' : 'Not Present'}</li>`;
      }
      if (k.yoga_details && Array.isArray(k.yoga_details)) {
        k.yoga_details.slice(0, 5).forEach((yoga: any) => {
          if (yoga.name) html += `<li><strong>Yoga:</strong> ${yoga.name}</li>`;
        });
      }
      html += `</ul>`;
    }
  } else {
    html += `<h2>2. Astrology Chart</h2>`;
    html += `<p>Detailed chart data is being prepared. Your numerology profile above provides key insights into your life path.</p>`;
  }

  // Questions
  if (input.questions) {
    html += `<h2>Your Questions</h2>`;
    html += `<p><em>"${input.questions}"</em></p>`;
    html += `<p>These areas of inquiry can be explored through the planetary positions and dasha periods shown above. Consider consulting for a detailed personal session.</p>`;
  }

  // Footer
  html += `<h2>Activation Recommendations</h2>`;
  html += `<ul>`;
  html += `<li><strong>Focus Period:</strong> Personal Year ${input.personalYear} themes</li>`;
  html += `<li><strong>Life Path ${input.lifePathNumber}:</strong> Align actions with your core nature</li>`;
  html += `</ul>`;
  html += `<p style="margin-top:20px;font-style:italic;">This blueprint is prepared by NAKSH369 using authentic Vedic calculations. For spiritual guidance and personal reflection.</p>`;

  html += `</div>`;
  return html;
}
