/**
 * Weather tool — Open-Meteo (free, no API key)
 * https://open-meteo.com/en/docs
 */

let weatherCache = null;
let cacheTime = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const WMO_CODES = {
  0: 'Ciel dégagé', 1: 'Principalement dégagé', 2: 'Partiellement nuageux', 3: 'Couvert',
  45: 'Brouillard', 48: 'Givre',
  51: 'Bruine légère', 53: 'Bruine modérée', 55: 'Bruine dense',
  61: 'Pluie légère', 63: 'Pluie modérée', 65: 'Pluie forte',
  71: 'Neige légère', 73: 'Neige modérée', 75: 'Neige forte',
  80: 'Averses légères', 81: 'Averses', 82: 'Averses violentes',
  95: 'Orage', 99: 'Orage avec grêle'
};

async function getWeather(lat, lon, city = '') {
  // Check cache
  if (weatherCache && cacheTime && (Date.now() - cacheTime < CACHE_TTL)) {
    return weatherCache;
  }

  if (!lat || !lon) {
    return 'Météo : position non fournie — activez la géolocalisation dans les settings';
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m` +
      `&daily=sunset&timezone=auto&forecast_days=1`;

    const res = await fetch(url);
    const data = await res.json();

    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weathercode;
    const wind = Math.round(data.current.windspeed_10m);
    const humidity = data.current.relative_humidity_2m;
    const desc = WMO_CODES[code] || 'Conditions inconnues';
    
    // Sunset time
    const sunsetISO = data.daily.sunset[0];
    const sunset = sunsetISO ? sunsetISO.split('T')[1].slice(0, 5) : '—';

    const cityStr = city ? `${city} — ` : '';
    const result = [
      `Météo         : ${cityStr}${temp}°C, ${desc}`,
      `Vent          : ${wind} km/h | Humidité : ${humidity}%`,
      `Coucher soleil: ${sunset}`
    ].join('\n');

    weatherCache = result;
    cacheTime = Date.now();
    return result;

  } catch (err) {
    return `Météo : erreur de récupération (${err.message})`;
  }
}

module.exports = { getWeather };
