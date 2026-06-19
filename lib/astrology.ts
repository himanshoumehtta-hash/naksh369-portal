// Astrology API Integration
// Primary: AstrologyAPI.com (json.astrologyapi.com)
// Backup: Prokerala

export interface BirthData {
  name: string;
  dob: string;
  birthTime: string;
  birthPlace: string;
}

export interface AstrologyChart {
  source: 'astrologyapi' | 'prokerala' | 'fallback';
  astroDetails?: any;
  natalPlanets?: any;
  generalHouseReport?: any;
  nakshatraDetails?: any;
  dashaDetails?: any;
  kundaliDetails?: any;
  sunSign?: string;
  moonSign?: string;
  ascendant?: string;
  nakshatra?: string;
  error?: string;
}

// ─── Geocoding ─────────────────────────────────────────────────────────────
async function getCoordinates(place: string): Promise<{ lat: number; lng: number; tz: number }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'NAKSH369/1.0' } }
    );
    const data = await response.json();
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), tz: 5.5 };
    }
  } catch (e) { console.error('Geocoding error:', e); }
  return { lat: 19.0760, lng: 72.8777, tz: 5.5 };
}

function parseDOB(dob: string, time: string) {
  const [year, month, day] = dob.split('-').map(Number);
  const [hour, minute] = (time || '12:00').split(':').map(Number);
  return { year, month, day, hour, minute };
}

// ─── PRIMARY: AstrologyAPI.com ──────────────────────────────────────────────
async function fetchFromAstrologyAPI(birth: BirthData): Promise<AstrologyChart> {
  const userId = process.env.ASTROLOGY_API_USER_ID || '';
  const apiKey = process.env.ASTROLOGY_API_KEY || 'ak-c072461a1290b863d47683d0858ca28cca8b364c';

  if (!userId) {
    throw new Error('ASTROLOGY_API_USER_ID not set — need User ID for auth');
  }

  const coords = await getCoordinates(birth.birthPlace);
  const { year, month, day, hour, minute } = parseDOB(birth.dob, birth.birthTime);

  const baseUrl = 'https://json.astrologyapi.com/v1';
  const auth = 'Basic ' + Buffer.from(`${userId}:${apiKey}`).toString('base64');
  const headers = {
    'Authorization': auth,
    'Content-Type': 'application/json',
    'Accept-Language': 'en',
  };
  const body = JSON.stringify({
    day, month, year, hour, min: minute,
    lat: coords.lat, lon: coords.lng, tzone: coords.tz,
  });

  // Fetch multiple rich endpoints
  const [astroRes, planetsRes, houseRes, dashaRes] = await Promise.allSettled([
    fetch(`${baseUrl}/astro_details`, { method: 'POST', headers, body }),
    fetch(`${baseUrl}/planets`, { method: 'POST', headers, body }),
    fetch(`${baseUrl}/general_house_report/sun`, { method: 'POST', headers, body }),
    fetch(`${baseUrl}/current_vdasha`, { method: 'POST', headers, body }),
  ]);

  const getJson = async (r: any) => (r.status === 'fulfilled' && r.value.ok) ? await r.value.json() : null;

  const astroDetails = await getJson(astroRes);
  const planets = await getJson(planetsRes);
  const houseReport = await getJson(houseRes);
  const dasha = await getJson(dashaRes);

  if (!astroDetails && !planets) {
    throw new Error('AstrologyAPI returned no data (check User ID + API Key)');
  }

  return {
    source: 'astrologyapi',
    astroDetails,
    natalPlanets: planets,
    generalHouseReport: houseReport,
    dashaDetails: dasha,
    ascendant: astroDetails?.ascendant,
    sunSign: astroDetails?.sign,
    nakshatra: astroDetails?.Naksahtra,
  };
}

// ─── BACKUP: Prokerala ──────────────────────────────────────────────────────
async function fetchFromProkerala(birth: BirthData): Promise<AstrologyChart> {
  const clientId = process.env.PROKERALA_CLIENT_ID || '1c1bd1d6-025a-4692-a691-5201ecaabed4';
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET || 'tjm944xvm0cmYRb2r81nBN621w7zz32rxJ2fbFKp';
  const coords = await getCoordinates(birth.birthPlace);
  const { year, month, day, hour, minute } = parseDOB(birth.dob, birth.birthTime);

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
  const headers = { 'Authorization': `Bearer ${token}` };
  const params = `ayanamsa=1&coordinates=${coordinates}&datetime=${encodeURIComponent(datetime)}`;

  const [kundaliRes, nakshatraRes, dashaRes] = await Promise.allSettled([
    fetch(`https://api.prokerala.com/v2/astrology/kundli?${params}`, { headers }),
    fetch(`https://api.prokerala.com/v2/astrology/nakshatra-details?${params}`, { headers }),
    fetch(`https://api.prokerala.com/v2/astrology/vimshottari-dasha?${params}`, { headers }),
  ]);

  const getJson = async (r: any) => (r.status === 'fulfilled' && r.value.ok) ? await r.value.json() : null;

  const kundali = await getJson(kundaliRes);
  const nakshatra = await getJson(nakshatraRes);
  const dasha = await getJson(dashaRes);

  return {
    source: 'prokerala',
    kundaliDetails: kundali?.data,
    nakshatraDetails: nakshatra?.data,
    dashaDetails: dasha?.data,
    moonSign: nakshatra?.data?.nakshatra?.rasi?.name,
    nakshatra: nakshatra?.data?.nakshatra?.name,
  };
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export async function fetchAstrologyChart(birth: BirthData): Promise<AstrologyChart> {
  try {
    return await fetchFromAstrologyAPI(birth);
  } catch (e) {
    console.warn('AstrologyAPI failed, trying Prokerala:', e);
  }
  try {
    return await fetchFromProkerala(birth);
  } catch (e) {
    console.warn('Both APIs failed:', e);
  }
  return { source: 'fallback', error: 'Both astrology APIs unavailable' };
}

export function formatChartForPrompt(chart: AstrologyChart, name: string): string {
  return JSON.stringify(chart, null, 2);
}
