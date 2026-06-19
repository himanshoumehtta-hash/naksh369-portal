// Astrology API Integration
// Primary: AstrologyAPI.com
// Backup: Prokerala

export interface BirthData {
  name: string;
  dob: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  birthPlace: string;
  latitude?: number;
  longitude?: number;
  timezone?: number;
}

export interface AstrologyChart {
  source: 'astrologyapi' | 'prokerala' | 'fallback';
  natalPlanets?: any;
  nakshatraDetails?: any;
  dashaDetails?: any;
  kundaliDetails?: any;
  ascendant?: any;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  lifePathNumber?: number;
  error?: string;
}

// ─── Get coordinates from place name ───────────────────────────────────────
async function getCoordinates(place: string): Promise<{ lat: number; lng: number; tz: number }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'NAKSH369/1.0' } }
    );
    const data = await response.json();
    if (data && data[0]) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      // Estimate timezone from longitude
      const tz = Math.round(lng / 15);
      return { lat, lng, tz };
    }
  } catch (e) {
    console.error('Geocoding error:', e);
  }
  // Default to Mumbai if geocoding fails
  return { lat: 19.0760, lng: 72.8777, tz: 5.5 };
}

// ─── Parse DOB ──────────────────────────────────────────────────────────────
function parseDOB(dob: string, time: string) {
  const [year, month, day] = dob.split('-').map(Number);
  const [hour, minute] = (time || '12:00').split(':').map(Number);
  return { year, month, day, hour, minute };
}

// ─── PRIMARY: AstrologyAPI.com ──────────────────────────────────────────────
async function fetchFromAstrologyAPI(birth: BirthData): Promise<AstrologyChart> {
  const apiKey = 'ak-c072461a1290b863d47683d0858ca28cca8b364c';
  const coords = await getCoordinates(birth.birthPlace);
  const { year, month, day, hour, minute } = parseDOB(birth.dob, birth.birthTime);

  const baseUrl = 'https://api.astrologyapi.com/v1';
  const headers = {
    'Authorization': `Basic ${btoa(`${apiKey}:`)}`,
    'Content-Type': 'application/json',
  };

  const body = JSON.stringify({
    year, month, day,
    hour, min: minute,
    lat: coords.lat,
    lon: coords.lng,
    tzone: coords.tz,
  });

  try {
    // Fetch natal planets
    const [planetsRes, nakshatraRes, dashaRes] = await Promise.allSettled([
      fetch(`${baseUrl}/planets`, { method: 'POST', headers, body }),
      fetch(`${baseUrl}/birth_details`, { method: 'POST', headers, body }),
      fetch(`${baseUrl}/current_vdasha`, { method: 'POST', headers, body }),
    ]);

    const planets = planetsRes.status === 'fulfilled' && planetsRes.value.ok
      ? await planetsRes.value.json() : null;
    const nakshatra = nakshatraRes.status === 'fulfilled' && nakshatraRes.value.ok
      ? await nakshatraRes.value.json() : null;
    const dasha = dashaRes.status === 'fulfilled' && dashaRes.value.ok
      ? await dashaRes.value.json() : null;

    if (!planets && !nakshatra) {
      throw new Error('AstrologyAPI returned no data');
    }

    return {
      source: 'astrologyapi',
      natalPlanets: planets,
      nakshatraDetails: nakshatra,
      dashaDetails: dasha,
      sunSign: planets?.find((p: any) => p.name === 'Sun')?.sign,
      moonSign: planets?.find((p: any) => p.name === 'Moon')?.sign,
      risingSign: nakshatra?.ascendant,
    };
  } catch (error) {
    console.error('AstrologyAPI error:', error);
    throw error;
  }
}

// ─── BACKUP: Prokerala ──────────────────────────────────────────────────────
async function fetchFromProkerala(birth: BirthData): Promise<AstrologyChart> {
  const clientId = '1c1bd1d6-025a-4692-a691-5201ecaabed4';
  const clientSecret = 'tjm944xvm0cmYRb2r81nBN621w7zz32rxJ2fbFKp';
  const coords = await getCoordinates(birth.birthPlace);
  const { year, month, day, hour, minute } = parseDOB(birth.dob, birth.birthTime);

  try {
    // Get access token
    const tokenRes = await fetch('https://api.prokerala.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    if (!token) throw new Error('Prokerala auth failed');

    const datetime = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00+05:30`;
    const coordinates = `${coords.lat},${coords.lng}`;
    const ayanamsa = 1; // Lahiri

    const headers = { 'Authorization': `Bearer ${token}` };
    const params = `ayanamsa=${ayanamsa}&coordinates=${coordinates}&datetime=${encodeURIComponent(datetime)}`;

    const [kundaliRes, nakshatraRes, dashaRes] = await Promise.allSettled([
      fetch(`https://api.prokerala.com/v2/astrology/kundli?${params}`, { headers }),
      fetch(`https://api.prokerala.com/v2/astrology/nakshatra-details?${params}`, { headers }),
      fetch(`https://api.prokerala.com/v2/astrology/vimshottari-dasha?${params}`, { headers }),
    ]);

    const kundali = kundaliRes.status === 'fulfilled' && kundaliRes.value.ok
      ? await kundaliRes.value.json() : null;
    const nakshatra = nakshatraRes.status === 'fulfilled' && nakshatraRes.value.ok
      ? await nakshatraRes.value.json() : null;
    const dasha = dashaRes.status === 'fulfilled' && dashaRes.value.ok
      ? await dashaRes.value.json() : null;

    return {
      source: 'prokerala',
      kundaliDetails: kundali?.data,
      nakshatraDetails: nakshatra?.data,
      dashaDetails: dasha?.data,
      moonSign: nakshatra?.data?.nakshatra?.rasi?.name,
    };
  } catch (error) {
    console.error('Prokerala error:', error);
    throw error;
  }
}

// ─── MAIN: Fetch with fallback ───────────────────────────────────────────────
export async function fetchAstrologyChart(birth: BirthData): Promise<AstrologyChart> {
  // Try primary first
  try {
    console.log('Fetching from AstrologyAPI...');
    const chart = await fetchFromAstrologyAPI(birth);
    console.log('AstrologyAPI success');
    return chart;
  } catch (primaryError) {
    console.warn('AstrologyAPI failed, trying Prokerala...', primaryError);
  }

  // Try backup
  try {
    const chart = await fetchFromProkerala(birth);
    console.log('Prokerala success');
    return chart;
  } catch (backupError) {
    console.warn('Both APIs failed, using fallback', backupError);
  }

  // Fallback — return empty chart
  return {
    source: 'fallback',
    error: 'Both astrology APIs unavailable',
  };
}

// ─── Format chart data for Claude prompt ────────────────────────────────────
export function formatChartForPrompt(chart: AstrologyChart, name: string): string {
  if (chart.source === 'fallback') {
    return `Note: Astrology chart data unavailable. Generate reading based on numerology only.`;
  }

  let formatted = `\n═══ VEDIC ASTROLOGY CHART (${chart.source.toUpperCase()}) ═══\n`;

  if (chart.sunSign) formatted += `Sun Sign: ${chart.sunSign}\n`;
  if (chart.moonSign) formatted += `Moon Sign: ${chart.moonSign}\n`;
  if (chart.risingSign) formatted += `Rising/Ascendant: ${chart.risingSign}\n`;

  if (chart.nakshatraDetails) {
    const n = chart.nakshatraDetails;
    if (n.nakshatra) formatted += `Birth Nakshatra: ${n.nakshatra?.name || n.nakshatra}\n`;
    if (n.chandra_rasi) formatted += `Chandra Rasi: ${n.chandra_rasi?.name || n.chandra_rasi}\n`;
    if (n.soorya_rasi) formatted += `Soorya Rasi: ${n.soorya_rasi?.name || n.soorya_rasi}\n`;
  }

  if (chart.natalPlanets && Array.isArray(chart.natalPlanets)) {
    formatted += `\nPlanet Positions:\n`;
    chart.natalPlanets.forEach((planet: any) => {
      if (planet.name && planet.sign) {
        formatted += `  ${planet.name}: ${planet.sign}${planet.isRetro ? ' (Retrograde)' : ''}\n`;
      }
    });
  }

  if (chart.dashaDetails) {
    const d = chart.dashaDetails;
    if (d.major_dasha || d.dasha) {
      const major = d.major_dasha || d.dasha;
      formatted += `\nCurrent Dasha Period:\n`;
      formatted += `  Major: ${major?.planet || major?.name || 'Unknown'}\n`;
      if (d.sub_dasha || d.antardasha) {
        const sub = d.sub_dasha || d.antardasha;
        formatted += `  Sub: ${sub?.planet || sub?.name || 'Unknown'}\n`;
      }
    }
  }

  if (chart.kundaliDetails) {
    const k = chart.kundaliDetails;
    if (k.ascendant) formatted += `\nAscendant: ${k.ascendant?.name || k.ascendant}\n`;
  }

  return formatted;
}
