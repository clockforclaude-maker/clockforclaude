/**
 * Weather tool — Open-Meteo (free, no API key)
 * https://open-meteo.com/en/docs
 */

let weatherCache = null;
let cacheTime = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const WMO_CODES = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Light showers', 81: 'Showers', 82: 'Violent showers',
  95: 'Thunderstorm', 99: 'Thunderstorm with hail'
};

async function getWeather(lat, lon, city = '') {
  // Check cache
  if (weatherCache && cacheTime && (Date.now() - cacheTime < CACHE_TTL)) {
    return weatherCache;
  }

  if (!lat || !lon) {
    return 'Weather    : location not provided — pass latitude and longitude';
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
    const desc = WMO_CODES[code] || 'Unknown conditions';

    // Sunset time
    const sunsetISO = data.daily.sunset[0];
    const sunset = sunsetISO ? sunsetISO.split('T')[1].slice(0, 5) : '—';

    const cityStr = city ? `${city} — ` : '';
    const result = [
      `Weather    : ${cityStr}${temp}°C, ${desc}`,
      `Wind       : ${wind} km/h | Humidity: ${humidity}%`,
      `Sunset     : ${sunset}`
    ].join('\n');

    weatherCache = result;
    cacheTime = Date.now();
    return result;

  } catch (err) {
    return `Weather    : fetch error (${err.message})`;
  }
}

module.exports = { getWeather };
