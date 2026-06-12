// background.js for ClockForClaude Chrome Extension

const DEFAULT_SETTINGS = {
  enabled: true,
  autoInjectMode: 'first', // 'first', 'all', 'manual'
  includeWeather: true,
  includeOffPeak: true,
  locationMode: 'auto', // 'auto', 'manual'
  manualLocation: { latitude: 48.8566, longitude: 2.3522, city: "Paris" },
  autoLocation: { latitude: null, longitude: null, city: "" }
};

// Initialize settings on install
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await chrome.storage.local.get();
  const initSettings = {};
  for (const [key, val] of Object.entries(DEFAULT_SETTINGS)) {
    if (settings[key] === undefined) {
      initSettings[key] = val;
    }
  }
  if (Object.keys(initSettings).length > 0) {
    await chrome.storage.local.set(initSettings);
  }
  
  // Clear weather cache to force fresh formatting
  const keysToRemove = Object.keys(settings).filter(k => k.startsWith('weather_'));
  if (keysToRemove.length > 0) {
    await chrome.storage.local.remove(keysToRemove);
  }
  console.log("ClockForClaude extension initialized and weather cache cleared.");
});

const CONTEXT_STRINGS = {
  fr: { timestampLabel: "Horodatage : ", weatherLabel: "Météo : ", unknownConditions: "Conditions inconnues", weatherUnavailable: "indisponible", weatherPrefix: "Météo         : ", windPrefix: "Vent          : ", sunsetPrefix: "Coucher soleil: ", posNotDetected: "position non détectée", windUnit: "km/h", humidityLabel: "Humidité", localeCode: "fr-FR" },
  en: { timestampLabel: "Timestamp: ", weatherLabel: "Weather: ", unknownConditions: "Unknown conditions", weatherUnavailable: "unavailable", weatherPrefix: "Weather       : ", windPrefix: "Wind          : ", sunsetPrefix: "Sunset        : ", posNotDetected: "location not detected", windUnit: "mph", humidityLabel: "Humidity", localeCode: "en-US" },
  es: { timestampLabel: "Marca de tiempo: ", weatherLabel: "Tiempo: ", unknownConditions: "Condiciones desconocidas", weatherUnavailable: "no disponible", weatherPrefix: "Tiempo        : ", windPrefix: "Viento        : ", sunsetPrefix: "Ocaso         : ", posNotDetected: "ubicación no detectada", windUnit: "km/h", humidityLabel: "Humedad", localeCode: "es-ES" },
  it: { timestampLabel: "Marca temporale: ", weatherLabel: "Meteo: ", unknownConditions: "Condizioni sconosciute", weatherUnavailable: "non disponibile", weatherPrefix: "Meteo         : ", windPrefix: "Vento         : ", sunsetPrefix: "Tramonto      : ", posNotDetected: "posizione non rilevata", windUnit: "km/h", humidityLabel: "Umidità", localeCode: "it-IT" },
  de: { timestampLabel: "Zeitstempel: ", weatherLabel: "Wetter: ", unknownConditions: "Unbekannte Bedingungen", weatherUnavailable: "nicht verfügbar", weatherPrefix: "Wetter        : ", windPrefix: "Wind          : ", sunsetPrefix: "Sonnenuntergang: ", posNotDetected: "Standort nicht erkannt", windUnit: "km/h", humidityLabel: "Luftfeuchtigkeit", localeCode: "de-DE" },
  pt: { timestampLabel: "Carimbo de data/hora: ", weatherLabel: "Clima: ", unknownConditions: "Condições desconhecidas", weatherUnavailable: "indisponível", weatherPrefix: "Clima         : ", windPrefix: "Vento         : ", sunsetPrefix: "Pôr do sol    : ", posNotDetected: "localização não detectada", windUnit: "km/h", humidityLabel: "Umidade", localeCode: "pt-PT" },
  zh: { timestampLabel: "时间戳: ", weatherLabel: "天气: ", unknownConditions: "未知天气状况", weatherUnavailable: "不可用", weatherPrefix: "天气          : ", windPrefix: "风速          : ", sunsetPrefix: "日落时间      : ", posNotDetected: "未检测到位置", windUnit: "km/h", humidityLabel: "湿度", localeCode: "zh-CN" },
  ja: { timestampLabel: "タイムスタンプ: ", weatherLabel: "天気: ", unknownConditions: "未知の天候", weatherUnavailable: "利用不可", weatherPrefix: "天気          : ", windPrefix: "風速          : ", sunsetPrefix: "日没時間      : ", posNotDetected: "位置情報未検出", windUnit: "m/s", humidityLabel: "湿度", localeCode: "ja-JP" },
  ar: { timestampLabel: "الطابع الزمني: ", weatherLabel: "الطقس: ", unknownConditions: "ظروف غير معروفة", weatherUnavailable: "غير متاح", weatherPrefix: "الطقس         : ", windPrefix: "الرياح        : ", sunsetPrefix: "غروب الشمس    : ", posNotDetected: "لم يتم اكتشاف الموقع", windUnit: "كم/س", humidityLabel: "الرطوبة", localeCode: "ar-EG" },
  ru: { timestampLabel: "Временная метка: ", weatherLabel: "Погода: ", unknownConditions: "Неизвестные условия", weatherUnavailable: "недоступно", weatherPrefix: "Погода        : ", windPrefix: "Ветер         : ", sunsetPrefix: "Закат         : ", posNotDetected: "местоположение не определено", windUnit: "м/с", humidityLabel: "Влажность", localeCode: "ru-RU" },
  nl: { timestampLabel: "Tijdstempel: ", weatherLabel: "Weer: ", unknownConditions: "Onbekende omstandigheden", weatherUnavailable: "niet beschikbaar", weatherPrefix: "Weer          : ", windPrefix: "Wind          : ", sunsetPrefix: "Zonsondergang : ", posNotDetected: "locatie niet gedetecteerd", windUnit: "km/u", humidityLabel: "Luchtvochtigheid", localeCode: "nl-NL" },
  ko: { timestampLabel: "타임스탬프: ", weatherLabel: "날씨: ", unknownConditions: "알 수 없는 상태", weatherUnavailable: "사용 불가", weatherPrefix: "날씨          : ", windPrefix: "풍속          : ", sunsetPrefix: "일몰 시간      : ", posNotDetected: "위치 미검출", windUnit: "m/s", humidityLabel: "습도", localeCode: "ko-KR" },
  hi: { timestampLabel: "समय संकेत: ", weatherLabel: "मौसम: ", unknownConditions: "अज्ञात मौसम स्थिति", weatherUnavailable: "अनुपलब्ध", weatherPrefix: "मौसम          : ", windPrefix: "हवा           : ", sunsetPrefix: "सूर्यास्त      : ", posNotDetected: "स्थान का पता नहीं चला", windUnit: "किमी/घंटा", humidityLabel: "आर्द्रता", localeCode: "hi-IN" },
  tr: { timestampLabel: "Zaman damgası: ", weatherLabel: "Hava Durumu: ", unknownConditions: "Bilinmeyen koşullar", weatherUnavailable: "kullanılamıyor", weatherPrefix: "Hava Durumu   : ", windPrefix: "Rüzgar        : ", sunsetPrefix: "Gün batımı    : ", posNotDetected: "konum tespit edilemedi", windUnit: "km/sa", humidityLabel: "Nem", localeCode: "tr-TR" },
  pl: { timestampLabel: "Znacznik czasu: ", weatherLabel: "Pogoda: ", unknownConditions: "Nieznane warunki", weatherUnavailable: "niedostępne", weatherPrefix: "Pogoda        : ", windPrefix: "Wiatr         : ", sunsetPrefix: "Zachód słońca : ", posNotDetected: "nie wykryto lokalizacji", windUnit: "km/h", humidityLabel: "Wilgotność", localeCode: "pl-PL" },
  sv: { timestampLabel: "Tidsstämpel: ", weatherLabel: "Väder: ", unknownConditions: "Okända förhållanden", weatherUnavailable: "ej tillgänglig", weatherPrefix: "Väder         : ", windPrefix: "Vind          : ", sunsetPrefix: "Solnedgång    : ", posNotDetected: "position detekterades inte", windUnit: "m/s", humidityLabel: "Luftfuktighet", localeCode: "sv-SE" }
};

const PERIOD_STRINGS = {
  fr: { morning: "Matin", afternoon: "Après-midi", evening: "Soirée", night: "Nuit" },
  en: { morning: "Morning", afternoon: "Afternoon", evening: "Evening", night: "Night" },
  es: { morning: "Mañana", afternoon: "Tarde", evening: "Tarde/Noche", night: "Noche" },
  it: { morning: "Mattina", afternoon: "Pomeriggio", evening: "Sera", night: "Notte" },
  de: { morning: "Morgen", afternoon: "Nachmittag", evening: "Abend", night: "Nacht" },
  pt: { morning: "Manhã", afternoon: "Tarde", evening: "Noite", night: "Madrugada" },
  zh: { morning: "早上", afternoon: "下午", evening: "晚上", night: "深夜" },
  ja: { morning: "朝", afternoon: "昼", evening: "夜", night: "深夜" },
  ar: { morning: "صباحاً", afternoon: "بعد الظهر", evening: "مساءً", night: "ليلاً" },
  ru: { morning: "Утро", afternoon: "День", evening: "Вечер", night: "Ночь" },
  nl: { morning: "Ochtend", afternoon: "Middag", evening: "Avond", night: "Nacht" },
  ko: { morning: "아침", afternoon: "오후", evening: "저녁", night: "밤" },
  hi: { morning: "सुबह", afternoon: "दोपहर", evening: "शाम", night: "रात" },
  tr: { morning: "Sabah", afternoon: "Öğleden Sonra", evening: "Akşam", night: "Gece" },
  pl: { morning: "Rano", afternoon: "Popołudnie", evening: "Wieczór", night: "Noc" },
  sv: { morning: "Morgon", afternoon: "Eftermiddag", evening: "Kväll", night: "Natt" }
};

const WEATHER_CATEGORIES = {
  fr: ['Ciel dégagé', 'Nuageux', 'Brouillard', 'Pluie', 'Neige', 'Orage'],
  en: ['Clear sky', 'Cloudy', 'Fog', 'Rain', 'Snow', 'Thunderstorm'],
  es: ['Despejado', 'Nublado', 'Niebla', 'Lluvia', 'Nieve', 'Tormenta'],
  it: ['Sereno', 'Nuvoloso', 'Nebbia', 'Pioggia', 'Neve', 'Temporale'],
  de: ['Klar', 'Bewölkt', 'Nebel', 'Regen', 'Schnee', 'Gewitter'],
  pt: ['Limpo', 'Nublado', 'Nevoeiro', 'Chuva', 'Neve', 'Trovoada'],
  zh: ['晴朗', '多云', '雾', '有雨', '有雪', '雷暴'],
  ja: ['快晴', '曇り', '霧', '雨', '雪', '雷雨'],
  ar: ['صافٍ', 'غائم', 'ضباب', 'مطر', 'ثلج', 'عاصفة رعدية'],
  ru: ['Ясно', 'Облачно', 'Туман', 'Дождь', 'Снегопад', 'Гроза'],
  nl: ['Helder', 'Bewolkt', 'Mist', 'Regen', 'Sneeuw', 'Onweer'],
  ko: ['맑음', '흐림', '안개', '비', '눈', '뇌우'],
  hi: ['साफ़', 'बादल', 'कोहरा', 'बारिश', 'बर्फ़', 'आंधी'],
  tr: ['Açık', 'Bulutlu', 'Sisli', 'Yağmurlu', 'Karlı', 'Fırtına'],
  pl: ['Przejaśnienia', 'Zachmurzenie', 'Mgła', 'Deszcz', 'Śnieg', 'Burza'],
  sv: ['Klart', 'Molnigt', 'Dimma', 'Regn', 'Snö', 'Åska']
};

function getWeatherCategory(code) {
  if (code === 0 || code === 1) return 0; // Clear
  if (code === 2 || code === 3) return 1; // Cloudy
  if (code === 45 || code === 48) return 2; // Fog
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 3; // Rain
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 4; // Snow
  if ([95, 96, 99].includes(code)) return 5; // Thunderstorm
  return 0;
}

function getExtensionLanguage() {
  try {
    const uiLang = chrome.i18n.getUILanguage() || 'en';
    const lang = uiLang.split('-')[0].toLowerCase();
    return CONTEXT_STRINGS[lang] ? lang : 'en';
  } catch (e) {
    return 'en';
  }
}

function getWeatherDesc(lang, code) {
  const cats = WEATHER_CATEGORIES[lang] || WEATHER_CATEGORIES['en'];
  const catIdx = getWeatherCategory(code);
  return cats[catIdx];
}

// Fetch weather from Open-Meteo with caching
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function getWeatherString(lat, lon, city) {
  const lang = getExtensionLanguage();
  const strings = CONTEXT_STRINGS[lang];

  if (!lat || !lon) {
    return `${strings.weatherPrefix}${strings.posNotDetected}`;
  }

  // Check cache
  const cacheKey = `weather_${lat}_${lon}`;
  const stored = await chrome.storage.local.get(cacheKey);
  const cache = stored[cacheKey];

  if (cache && (Date.now() - cache.timestamp < CACHE_TTL)) {
    console.log("Using cached weather data");
    return cache.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m` +
      `&daily=sunset&timezone=auto&forecast_days=1`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();

    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weathercode;
    const wind = Math.round(data.current.windspeed_10m);
    const humidity = data.current.relative_humidity_2m;
    const desc = getWeatherDesc(lang, code);
    
    // Sunset time
    const sunsetISO = data.daily.sunset[0];
    const sunset = sunsetISO ? sunsetISO.split('T')[1].slice(0, 5) : '—';

    const cityStr = city ? `${city} — ` : '';
    const result = [
      `${strings.weatherPrefix}${cityStr}${temp}°C, ${desc}`,
      `${strings.windPrefix}${wind} ${strings.windUnit} | ${strings.humidityLabel} : ${humidity}%`,
      `${strings.sunsetPrefix}${sunset}`
    ].join('\n');

    // Cache the result
    await chrome.storage.local.set({
      [cacheKey]: {
        data: result,
        timestamp: Date.now()
      }
    });

    return result;
  } catch (err) {
    console.error("Error fetching weather:", err);
    return `${strings.weatherPrefix}${strings.weatherUnavailable} (${err.message})`;
  }
}

// Compute datetime details
function getDatetimeString(tz) {
  const lang = getExtensionLanguage();
  const strings = CONTEXT_STRINGS[lang];
  const now = new Date();
  const opts = { timeZone: tz, hour12: false };
  const time = now.toLocaleTimeString(strings.localeCode, { ...opts, hour: '2-digit', minute: '2-digit' });
  const day = now.toLocaleDateString(strings.localeCode, { ...opts, weekday: 'long' });
  const date = now.toLocaleDateString(strings.localeCode, { ...opts, day: 'numeric', month: 'long', year: 'numeric' });
  
  // Timezone offset
  const offset = -now.getTimezoneOffset() / 60;
  const utcStr = `UTC${offset >= 0 ? '+' : ''}${offset}`;
  
  // Season (Northern Hemisphere)
  const month = now.getMonth() + 1;
  let season = lang === 'fr' ? 'Hiver' : 'Winter';
  if (month >= 3 && month <= 5) season = lang === 'fr' ? 'Printemps' : 'Spring';
  else if (month >= 6 && month <= 8) season = lang === 'fr' ? 'Été' : 'Summer';
  else if (month >= 9 && month <= 11) season = lang === 'fr' ? 'Automne' : 'Autumn';
  
  const hour = parseInt(time.split(':')[0]);
  const periods = PERIOD_STRINGS[lang] || PERIOD_STRINGS['en'];
  let period = periods.night;
  if (hour >= 6 && hour < 12) period = periods.morning;
  else if (hour >= 12 && hour < 18) period = periods.afternoon;
  else if (hour >= 18 && hour < 23) period = periods.evening;
  
  const hourLabel = lang === 'fr' ? 'Heure locale  : ' : 'Local Time    : ';
  const dateLabel = lang === 'fr' ? 'Date          : ' : 'Date          : ';
  const tzLabel = lang === 'fr' ? 'Fuseau        : ' : 'Timezone      : ';
  const seasonLabel = lang === 'fr' ? 'Saison        : ' : 'Season        : ';
  const momentLabel = lang === 'fr' ? 'Moment : ' : 'Moment: ';

  return [
    `${hourLabel}${time}`,
    `${dateLabel}${day.charAt(0).toUpperCase() + day.slice(1)} ${date}`,
    `${tzLabel}${tz} (${utcStr})`,
    `${seasonLabel}${season} | ${momentLabel}${period}`
  ].join('\n');
}

// Assemble full context block
async function getFullContext() {
  const settings = await chrome.storage.local.get();
  const enabled = settings.enabled !== false;
  if (!enabled) return '';

  const lang = getExtensionLanguage();
  const strings = CONTEXT_STRINGS[lang];
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const now = new Date();
  const opts = { timeZone: tz, hour12: false };
  const time = now.toLocaleTimeString(strings.localeCode, { ...opts, hour: '2-digit', minute: '2-digit' });
  const day = now.toLocaleDateString(strings.localeCode, { ...opts, weekday: 'long' });
  const date = now.toLocaleDateString(strings.localeCode, { ...opts, day: 'numeric', month: 'long', year: 'numeric' });
  const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);
  
  const hourVal = parseInt(time.split(':')[0]);
  const periodsVal = PERIOD_STRINGS[lang] || PERIOD_STRINGS['en'];
  let periodVal = periodsVal.night;
  if (hourVal >= 6 && hourVal < 12) periodVal = periodsVal.morning;
  else if (hourVal >= 12 && hourVal < 18) periodVal = periodsVal.afternoon;
  else if (hourVal >= 18 && hourVal < 23) periodVal = periodsVal.evening;

  let contextLine = `[${strings.timestampLabel}${formattedDay} ${date}, ${time} (${periodVal})`;

  // Add weather if enabled
  if (settings.includeWeather !== false) {
    const activeLoc = settings.locationMode === 'auto' ? settings.autoLocation : settings.manualLocation;
    const lat = activeLoc?.latitude;
    const lon = activeLoc?.longitude;
    const city = activeLoc?.city;
    if (lat && lon) {
      try {
        const cacheKey = `weather_${lat}_${lon}`;
        const stored = await chrome.storage.local.get(cacheKey);
        const cache = stored[cacheKey];
        let weatherInfo = '';
        if (cache && (Date.now() - cache.timestamp < CACHE_TTL)) {
          weatherInfo = cache.data;
        } else {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,weathercode` +
            `&timezone=auto&forecast_days=1`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const temp = Math.round(data.current.temperature_2m);
            const code = data.current.weathercode;
            const desc = getWeatherDesc(lang, code);
            weatherInfo = `${city ? city + ' : ' : ''}${temp}°C, ${desc}`;
            // Cache the compact format
            await chrome.storage.local.set({
              [cacheKey]: { data: weatherInfo, timestamp: Date.now() }
            });
          }
        }
        if (weatherInfo) {
          const cleanWeather = weatherInfo.split('\n')[0].replace(/^[a-zA-Zà-üÀ-Ü\s]+:\s*/, '');
          contextLine += ` | ${strings.weatherLabel}${cleanWeather}`;
        }
      } catch (err) {
        console.error("Error fetching weather for single line:", err);
      }
    }
  }

  contextLine += ']';
  return contextLine;
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "get_full_context") {
    getFullContext()
      .then(context => sendResponse({ context }))
      .catch(err => sendResponse({ error: err.message }));
    return true; // Keep message channel open for async response
  }

  if (message.action === "refresh_weather") {
    // Force a fresh weather fetch
    chrome.storage.local.get()
      .then(async (settings) => {
        const activeLoc = settings.locationMode === 'auto' ? settings.autoLocation : settings.manualLocation;
        const lat = activeLoc?.latitude;
        const lon = activeLoc?.longitude;
        const city = activeLoc?.city;
        
        if (lat && lon) {
          const cacheKey = `weather_${lat}_${lon}`;
          await chrome.storage.local.remove(cacheKey); // clear cache
          const weatherStr = await getWeatherString(lat, lon, city);
          sendResponse({ success: true, weather: weatherStr });
        } else {
          sendResponse({ success: false, error: "No location coordinates available." });
        }
      })
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
