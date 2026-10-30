/**
 * AgriSmart AI - Live Weather & Agro-Climatic Intelligence Service
 * 
 * Powered by Open-Meteo (Free, open-source weather API with no API key requirement)
 * Includes real-time Geolocation, live current weather, 7-day precipitation forecast,
 * and a comprehensive fallback agricultural database for major Indian and global farming regions.
 */

// WMO Weather Interpretation Codes (WW)
export const WMO_WEATHER_MAP = {
  0: { label: 'Clear Sky • साफ आसमान', icon: '☀️', condition: 'clear' },
  1: { label: 'Mainly Clear • मुख्य रूप से साफ', icon: '🌤️', condition: 'mostly_clear' },
  2: { label: 'Partly Cloudy • आंशिक बादल', icon: '⛅', condition: 'partly_cloudy' },
  3: { label: 'Overcast • घने बादल', icon: '☁️', condition: 'overcast' },
  45: { label: 'Foggy • कोहरा', icon: '🌫️', condition: 'fog' },
  48: { label: 'Depositing Rime Fog • घना कोहरा', icon: '🌫️', condition: 'fog' },
  51: { label: 'Light Drizzle • हल्की बूंदाबांदी', icon: '🌦️', condition: 'drizzle' },
  53: { label: 'Moderate Drizzle • बूंदाबांदी', icon: '🌦️', condition: 'drizzle' },
  55: { label: 'Dense Drizzle • तेज बूंदाबांदी', icon: '🌧️', condition: 'drizzle' },
  61: { label: 'Slight Rain • हल्की बारिश', icon: '🌧️', condition: 'rain' },
  63: { label: 'Moderate Rain • मध्यम बारिश', icon: '🌧️', condition: 'rain' },
  65: { label: 'Heavy Rain • भारी बारिश', icon: '⛈️', condition: 'heavy_rain' },
  71: { label: 'Slight Snow • हल्की बर्फबारी', icon: '🌨️', condition: 'snow' },
  73: { label: 'Moderate Snow • मध्यम बर्फबारी', icon: '❄️', condition: 'snow' },
  75: { label: 'Heavy Snow • भारी बर्फबारी', icon: '❄️', condition: 'heavy_snow' },
  80: { label: 'Rain Showers • बौछारें', icon: '🌦️', condition: 'showers' },
  81: { label: 'Moderate Showers • मध्यम बौछारें', icon: '🌧️', condition: 'showers' },
  82: { label: 'Violent Showers • मूसलाधार बौछारें', icon: '⛈️', condition: 'violent_showers' },
  95: { label: 'Thunderstorm • आंधी-तूफान', icon: '⛈️', condition: 'thunderstorm' },
  96: { label: 'Thunderstorm with Hail • ओलावृष्टि व तूफान', icon: '⛈️', condition: 'thunderstorm_hail' },
};

// Curated Agro-Climatic Hubs across India with seasonal agricultural norms
export const INDIAN_AGRI_HUBS = [
  {
    id: 'ludhiana',
    name: 'Ludhiana, Punjab',
    nameHi: 'लुधियाना (पंजाब)',
    state: 'Punjab',
    lat: 30.9010,
    lon: 75.8573,
    majorCrops: 'Wheat, Rice, Cotton, Maize',
    normalTemp: 24.5,
    normalHumidity: 65,
    normalRainfall: 78.0,
    soilType: 'Alluvial Loam (जलोढ़ दोमट)'
  },
  {
    id: 'karnal',
    name: 'Karnal, Haryana',
    nameHi: 'करनाल (हरियाणा)',
    state: 'Haryana',
    lat: 29.6857,
    lon: 76.9907,
    majorCrops: 'Basmati Rice, Wheat, Sugarcane',
    normalTemp: 25.2,
    normalHumidity: 68,
    normalRainfall: 85.0,
    soilType: 'Alluvial Soil (जलोढ़ मिट्टी)'
  },
  {
    id: 'nashik',
    name: 'Nashik, Maharashtra',
    nameHi: 'नासिक (महाराष्ट्र)',
    state: 'Maharashtra',
    lat: 19.9975,
    lon: 73.7898,
    majorCrops: 'Grapes, Onion, Pomegranate, Sugarcane',
    normalTemp: 26.0,
    normalHumidity: 60,
    normalRainfall: 95.0,
    soilType: 'Black Clayey Soil (काली मिट्टी)'
  },
  {
    id: 'pune',
    name: 'Pune / Baramati, Maharashtra',
    nameHi: 'पुणे / बारामती (महाराष्ट्र)',
    state: 'Maharashtra',
    lat: 18.5204,
    lon: 73.8567,
    majorCrops: 'Sugarcane, Soybean, Chickpea, Cotton',
    normalTemp: 27.0,
    normalHumidity: 62,
    normalRainfall: 102.0,
    soilType: 'Medium Black Soil (काली दोमट)'
  },
  {
    id: 'varanasi',
    name: 'Varanasi, Uttar Pradesh',
    nameHi: 'वाराणसी (उत्तर प्रदेश)',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lon: 82.9739,
    majorCrops: 'Rice, Wheat, Mustard, Lentils',
    normalTemp: 26.5,
    normalHumidity: 74,
    normalRainfall: 115.0,
    soilType: 'Gangetic Alluvial (गंगा का कछार)'
  },
  {
    id: 'indore',
    name: 'Indore, Madhya Pradesh',
    nameHi: 'इंदौर (मध्य प्रदेश)',
    state: 'Madhya Pradesh',
    lat: 22.7196,
    lon: 75.8577,
    majorCrops: 'Soybean, Wheat, Chickpea, Cotton',
    normalTemp: 26.2,
    normalHumidity: 58,
    normalRainfall: 92.0,
    soilType: 'Deep Black Soil (गहरी काली मिट्टी)'
  },
  {
    id: 'rajkot',
    name: 'Rajkot, Gujarat',
    nameHi: 'राजकोट (गुजरात)',
    state: 'Gujarat',
    lat: 22.3039,
    lon: 70.8022,
    majorCrops: 'Cotton, Groundnut, Cumin, Sesame',
    normalTemp: 28.5,
    normalHumidity: 62,
    normalRainfall: 75.0,
    soilType: 'Black Cotton Soil (रेगुर मिट्टी)'
  },
  {
    id: 'burdwan',
    name: 'Purba Bardhaman, West Bengal',
    nameHi: 'बर्धमान (पश्चिम बंगाल)',
    state: 'West Bengal',
    lat: 23.2324,
    lon: 87.8615,
    majorCrops: 'Rice (Aman/Boro), Jute, Potato, Mustard',
    normalTemp: 27.5,
    normalHumidity: 84,
    normalRainfall: 175.0,
    soilType: 'Fertile Alluvial (उपजाऊ जलोढ़)'
  },
  {
    id: 'patna',
    name: 'Patna, Bihar',
    nameHi: 'पटना (बिहार)',
    state: 'Bihar',
    lat: 25.5941,
    lon: 85.1376,
    majorCrops: 'Maize, Rice, Wheat, Pulses',
    normalTemp: 26.4,
    normalHumidity: 78,
    normalRainfall: 135.0,
    soilType: 'Alluvial Silt Loam (दोमट सिल्ट)'
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore, Tamil Nadu',
    nameHi: 'कोयंबटूर (तमिलनाडु)',
    state: 'Tamil Nadu',
    lat: 11.0168,
    lon: 76.9558,
    majorCrops: 'Cotton, Coconut, Banana, Maize',
    normalTemp: 27.8,
    normalHumidity: 72,
    normalRainfall: 68.0,
    soilType: 'Red Loam & Black Soil (लाल दोमट)'
  },
  {
    id: 'guntur',
    name: 'Guntur, Andhra Pradesh',
    nameHi: 'गुंटूर (आंध्र प्रदेश)',
    state: 'Andhra Pradesh',
    lat: 16.3067,
    lon: 80.4365,
    majorCrops: 'Chilli, Cotton, Tobacco, Rice',
    normalTemp: 29.5,
    normalHumidity: 75,
    normalRainfall: 110.0,
    soilType: 'Deep Black Cotton Soil'
  },
  {
    id: 'shimoga',
    name: 'Shimoga, Karnataka',
    nameHi: 'शिमोगा (कर्नाटक)',
    state: 'Karnataka',
    lat: 13.9299,
    lon: 75.5681,
    majorCrops: 'Paddy, Arecanut, Coffee, Maize',
    normalTemp: 25.6,
    normalHumidity: 76,
    normalRainfall: 145.0,
    soilType: 'Laterite & Red Loam (लैटेराइट मिट्टी)'
  },
  {
    id: 'jaipur',
    name: 'Jaipur, Rajasthan',
    nameHi: 'जयपुर (राजस्थान)',
    state: 'Rajasthan',
    lat: 26.9124,
    lon: 75.7873,
    majorCrops: 'Mustard, Bajra, Mothbeans, Barley',
    normalTemp: 28.5,
    normalHumidity: 42,
    normalRainfall: 52.0,
    soilType: 'Sandy Loam (बलुई दोमट)'
  },
  {
    id: 'guwahati',
    name: 'Guwahati, Assam',
    nameHi: 'गुवाहाटी (असम)',
    state: 'Assam',
    lat: 26.1445,
    lon: 91.7362,
    majorCrops: 'Rice, Jute, Tea, Banana',
    normalTemp: 25.0,
    normalHumidity: 85,
    normalRainfall: 195.0,
    soilType: 'Alluvial & Acidic Soil'
  }
];

/**
 * Calculates estimated monthly / seasonal vegetative precipitation (in mm)
 * based on Open-Meteo's 7-day precipitation forecast and agro-climatic clamping.
 */
export function calculateEstimatedRainfall(dailyPrecipArray, fallbackRainfall = 95.0) {
  if (!dailyPrecipArray || !Array.isArray(dailyPrecipArray) || dailyPrecipArray.length === 0) {
    return Math.round(fallbackRainfall * 10) / 10;
  }

  // Sum of rainfall over next 7 days in mm
  const sum7Days = dailyPrecipArray.reduce((acc, val) => acc + (Number(val) || 0), 0);

  let estimatedMonthly = 0;
  if (sum7Days > 1.5) {
    // If active precipitation occurs, project to 30-day vegetative equivalent
    estimatedMonthly = sum7Days * 4.1;
  } else {
    // During dry spell / non-rainy weeks, blend with regional climatology
    estimatedMonthly = (fallbackRainfall * 0.75) + (sum7Days * 3.5);
  }

  // Clamp within realistic crop recommendation bounds (30 mm to 280 mm)
  const clamped = Math.max(30.0, Math.min(280.0, estimatedMonthly));
  return Math.round(clamped * 10) / 10;
}

/**
 * Fetches real-time weather metrics using Open-Meteo API
 */
export async function fetchLiveWeather(lat, lon, fallbackRainfall = 95.0) {
  const roundedLat = Math.round(lat * 10000) / 10000;
  const roundedLon = Math.round(lon * 10000) / 10000;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${roundedLat}&longitude=${roundedLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=auto`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      throw new Error(`Open-Meteo responded with status ${response.status}`);
    }

    const data = await response.json();
    const current = data.current || {};
    const daily = data.daily || {};

    const weatherCode = current.weather_code ?? 0;
    const weatherMeta = WMO_WEATHER_MAP[weatherCode] || { label: 'Moderate Weather • सामान्य मौसम', icon: '🌤️', condition: 'moderate' };

    const rawTemp = current.temperature_2m ?? 25.0;
    const rawHumidity = current.relative_humidity_2m ?? 65.0;
    const precipArray = daily.precipitation_sum || [];
    const estimatedRainfall = calculateEstimatedRainfall(precipArray, fallbackRainfall);

    return {
      success: true,
      latitude: roundedLat,
      longitude: roundedLon,
      temperature: Math.round(rawTemp * 10) / 10,
      feelsLike: Math.round((current.apparent_temperature ?? rawTemp) * 10) / 10,
      humidity: Math.round(rawHumidity * 10) / 10,
      rainfall: estimatedRainfall,
      weatherCode,
      weatherLabel: weatherMeta.label,
      weatherIcon: weatherMeta.icon,
      isDay: current.is_day === 1,
      windSpeed: current.wind_speed_10m ?? 0,
      sevenDayPrecipitationSum: Math.round(precipArray.reduce((a, b) => a + (Number(b) || 0), 0) * 10) / 10,
      source: 'Open-Meteo Live API'
    };
  } catch (err) {
    console.warn('Direct Open-Meteo fetch failed or timed out:', err.message);
    throw err;
  }
}

/**
 * Searches city / district coordinates via Open-Meteo Geocoding API
 */
export async function searchGeocoding(query) {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = encodeURIComponent(query.trim());
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${cleanQuery}&count=6&language=en&format=json`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).map(r => ({
      id: r.id,
      name: r.name,
      admin1: r.admin1 || '', // State / Province
      country: r.country || '',
      countryCode: r.country_code || '',
      lat: r.latitude,
      lon: r.longitude
    }));
  } catch (err) {
    console.warn('Geocoding search failed:', err.message);
    return [];
  }
}

/**
 * Reverse-geocodes latitude and longitude to get district and state name
 */
export async function reverseGeocode(lat, lon) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const data = await response.json();
      const locality = data.locality || data.city || data.principalSubdivision || '';
      const state = data.principalSubdivision || '';
      const country = data.countryName || '';
      const parts = [locality, state, country].filter(Boolean);
      return parts.join(', ');
    }
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
  }
  return `Coordinates: ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
}
