import { lifePathDescriptions } from './numerology';
import { fetchAstrologyChart, BirthData } from './astrology';

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
  const lifePathDesc = lifePathDescriptions[input.lifePathNumber] || 'A unique soul path';
  const currentYear = new Date().getFullYear();

  let chart: any = { source: 'fallback' };
  try {
    chart = await fetchAstrologyChart({
      name: input.name,
      dob: input.dob,
      birthTime: input.birthTime || '12:00',
      birthPlace: input.birthPlace,
    });
  } catch (err) { console.error('Chart fetch error:', err); }

  let html = `<div class="blueprint">`;
  html += `<h2>Life Blueprint for ${input.name}</h2>`;
  html += `<p><strong>Date of Birth:</strong> ${input.dob} | <strong>Time:</strong> ${input.birthTime || 'Not provided'} | <strong>Place:</strong> ${input.birthPlace}</p>`;

  // 1. Numerology
  html += `<h2>1. Numerology Profile</h2>`;
  html += `<p><strong>Life Path Number ${input.lifePathNumber}:</strong> ${lifePathDesc}</p>`;
  html += `<ul>`;
  html += `<li><strong>Birthday Number:</strong> ${input.birthdayNumber}</li>`;
  html += `<li><strong>Personal Year ${currentYear}:</strong> ${input.personalYear}</li>`;
  html += `</ul>`;

  // 2. AstrologyAPI rich data
  if (chart.source === 'astrologyapi' && chart.astroDetails) {
    const a = chart.astroDetails;
    html += `<h2>2. Your Vedic Birth Profile</h2>`;
    html += `<ul>`;
    if (a.ascendant) html += `<li><strong>Ascendant (Lagna):</strong> ${a.ascendant}</li>`;
    if (a.sign) html += `<li><strong>Moon Sign (Rashi):</strong> ${a.sign}</li>`;
    if (a.SignLord) html += `<li><strong>Sign Lord:</strong> ${a.SignLord}</li>`;
    if (a.Naksahtra) html += `<li><strong>Nakshatra:</strong> ${a.Naksahtra}${a.Charan ? ' (Pada ' + a.Charan + ')' : ''}</li>`;
    if (a.NaksahtraLord) html += `<li><strong>Nakshatra Lord:</strong> ${a.NaksahtraLord}</li>`;
    if (a.Tithi) html += `<li><strong>Tithi:</strong> ${a.Tithi}</li>`;
    if (a.Yog) html += `<li><strong>Yoga:</strong> ${a.Yog}</li>`;
    if (a.Karan) html += `<li><strong>Karan:</strong> ${a.Karan}</li>`;
    if (a.tatva) html += `<li><strong>Element (Tatva):</strong> ${a.tatva}</li>`;
    if (a.Varna) html += `<li><strong>Varna:</strong> ${a.Varna}</li>`;
    if (a.Yoni) html += `<li><strong>Yoni:</strong> ${a.Yoni}</li>`;
    if (a.Gan) html += `<li><strong>Gana:</strong> ${a.Gan}</li>`;
    if (a.Nadi) html += `<li><strong>Nadi:</strong> ${a.Nadi}</li>`;
    if (a.paya) html += `<li><strong>Paya:</strong> ${a.paya}</li>`;
    if (a.name_alphabet) html += `<li><strong>Favourable Name Letter:</strong> ${a.name_alphabet}</li>`;
    html += `</ul>`;

    // Planets
    if (chart.natalPlanets && Array.isArray(chart.natalPlanets)) {
      html += `<h2>3. Planetary Positions</h2><ul>`;
      chart.natalPlanets.forEach((p: any) => {
        if (p.name && p.sign) {
          const retro = (p.isRetro === 'true' || p.isRetro === true) ? ' (Retrograde)' : '';
          const house = p.house ? ` — House ${p.house}` : '';
          html += `<li><strong>${p.name}:</strong> ${p.sign}${house}${retro}</li>`;
        }
      });
      html += `</ul>`;
    }

    // House report (interpretation text)
    if (chart.generalHouseReport) {
      const hr = chart.generalHouseReport;
      const reports = hr.house_report || hr.report || (Array.isArray(hr) ? hr : null);
      if (reports && Array.isArray(reports) && reports.length > 0) {
        html += `<h2>4. Personality & Life Reading</h2>`;
        reports.slice(0, 6).forEach((r: any) => {
          const text = r.house_report || r.report_text || r;
          if (typeof text === 'string') html += `<p>${text}</p>`;
        });
      }
    }

    // Dasha
    if (chart.dashaDetails) {
      const d = chart.dashaDetails;
      html += `<h2>5. Current Planetary Period (Dasha)</h2><ul>`;
      const major = d.major || d.major_dasha || d.dasha;
      if (major) html += `<li><strong>Mahadasha:</strong> ${major?.planet || major?.name || major}</li>`;
      const minor = d.minor || d.sub_dasha || d.antardasha;
      if (minor) html += `<li><strong>Antardasha:</strong> ${minor?.planet || minor?.name || minor}</li>`;
      html += `</ul>`;
    }
  } else if (chart.source === 'prokerala') {
    html += `<h2>2. Vedic Birth Profile (Prokerala)</h2><ul>`;
    if (chart.nakshatra) html += `<li><strong>Nakshatra:</strong> ${chart.nakshatra}</li>`;
    if (chart.moonSign) html += `<li><strong>Moon Sign:</strong> ${chart.moonSign}</li>`;
    html += `</ul>`;
    if (chart.dashaDetails?.dasha_periods) {
      html += `<h2>3. Dasha Periods</h2><ul>`;
      chart.dashaDetails.dasha_periods.slice(0, 3).forEach((d: any) => {
        if (d.name) html += `<li><strong>${d.name}</strong></li>`;
      });
      html += `</ul>`;
    }
  } else {
    html += `<h2>2. Astrology Chart</h2>`;
    html += `<p>Chart data is being prepared. Your numerology profile above provides key insights.</p>`;
  }

  // Questions
  if (input.questions) {
    html += `<h2>Your Questions</h2><p><em>"${input.questions}"</em></p>`;
    html += `<p>These areas can be explored through the planetary positions and dasha periods above.</p>`;
  }

  html += `<h2>Activation Recommendations</h2><ul>`;
  html += `<li><strong>Personal Year ${input.personalYear}:</strong> Focus on its core themes</li>`;
  html += `<li><strong>Life Path ${input.lifePathNumber}:</strong> Align actions with your nature</li>`;
  html += `</ul>`;
  html += `<p style="margin-top:20px;font-style:italic;">For spiritual guidance and reflection only. Not professional advice. Prepared by NAKSH369 using authentic Vedic calculations.</p>`;
  html += `</div>`;
  return html;
}
