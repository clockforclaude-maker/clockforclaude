// contextService.js - Assemble full context block on native mobile side
import { NativeModules, Platform } from 'react-native';
import * as Location from 'expo-location';
import { getUpcomingEventsString } from './calendarService';
import { isPremiumUser } from './stripeService';

const CONTEXT_STRINGS = {
  fr: { timestamp: "Horodatage : ", weather: "Météo : ", calendar: "Agenda : ", weatherPrefix: "Météo : ", posUnavailable: "position indisponible", weatherError: "erreur de récupération" },
  en: { timestamp: "Timestamp: ", weather: "Weather: ", calendar: "Calendar: ", weatherPrefix: "Weather: ", posUnavailable: "location unavailable", weatherError: "retrieval error" },
  es: { timestamp: "Marca de tiempo: ", weather: "Tiempo: ", calendar: "Agenda: ", weatherPrefix: "Tiempo: ", posUnavailable: "ubicación no disponible", weatherError: "error de recuperación" },
  it: { timestamp: "Marca temporale: ", weather: "Meteo: ", calendar: "Calendario: ", weatherPrefix: "Meteo: ", posUnavailable: "posizione non disponibile", weatherError: "errore di recupero" },
  de: { timestamp: "Zeitstempel: ", weather: "Wetter: ", calendar: "Kalender: ", weatherPrefix: "Wetter: ", posUnavailable: "Standort nicht verfügbar", weatherError: "Abruffehler" },
  pt: { timestamp: "Carimbo de data/hora: ", weather: "Clima: ", calendar: "Agenda: ", weatherPrefix: "Clima: ", posUnavailable: "localização indisponível", weatherError: "erro de recuperação" },
  zh: { timestamp: "时间戳: ", weather: "天气: ", calendar: "日历: ", weatherPrefix: "天气: ", posUnavailable: "位置不可用", weatherError: "获取失败" },
  ja: { timestamp: "タイムスタンプ: ", weather: "天気: ", calendar: "カレンダー: ", weatherPrefix: "天気: ", posUnavailable: "位置情報利用不可", weatherError: "取得エラー" },
  ar: { timestamp: "الطابع الزمني: ", weather: "الطقس: ", calendar: "التقويم: ", weatherPrefix: "الطقس: ", posUnavailable: "الموقع غير متاح", weatherError: "خطأ في الاسترداد" },
  ru: { timestamp: "Временная метка: ", weather: "Погода: ", calendar: "Календарь: ", weatherPrefix: "Погода: ", posUnavailable: "местоположение недоступно", weatherError: "ошибка получения" },
  nl: { timestamp: "Tijdstempel: ", weather: "Weer: ", calendar: "Agenda: ", weatherPrefix: "Weer: ", posUnavailable: "locatie onbeschikbaar", weatherError: "ophaalfout" },
  ko: { timestamp: "타임스탬프: ", weather: "날씨: ", calendar: "일정: ", weatherPrefix: "날씨: ", posUnavailable: "위치 정보를 사용할 수 없음", weatherError: "가져오기 오류" },
  hi: { timestamp: "समय संकेत: ", weather: "मौसम: ", calendar: "कैलेंडर: ", weatherPrefix: "मौसम: ", posUnavailable: "स्थान अनुपलब्ध", weatherError: "प्राप्ति त्रुटi" },
  tr: { timestamp: "Zaman damgası: ", weather: "Hava Durumu: ", calendar: "Takvim: ", weatherPrefix: "Hava Durumu: ", posUnavailable: "konum kullanılamıyor", weatherError: "alma hatası" },
  pl: { timestamp: "Znacznik czasu: ", weather: "Pogoda: ", calendar: "Kalendarz: ", weatherPrefix: "Pogoda: ", posUnavailable: "lokalizacja niedostępna", weatherError: "błąd pobierania" },
  sv: { timestamp: "Tidsstämpel: ", weather: "Väder: ", calendar: "Kalender: ", weatherPrefix: "Väder: ", posUnavailable: "plats otillgänglig", weatherError: "hämtningsfel" }
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

const getDeviceLocale = () => {
  let locale = 'en-US';
  try {
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings;
      locale = settings?.AppleLocale || settings?.AppleLanguages?.[0] || 'en-US';
    } else if (Platform.OS === 'android') {
      locale = NativeModules.I18nManager?.localeIdentifier || 'en-US';
    }
  } catch (e) {}
  return locale.replace('_', '-');
};

const getDeviceLanguage = () => {
  const locale = getDeviceLocale();
  const lang = locale.split('-')[0].toLowerCase();
  return CONTEXT_STRINGS[lang] ? lang : 'en';
};

const getTranslation = (lang) => {
  return CONTEXT_STRINGS[lang] || CONTEXT_STRINGS['en'];
};

const getWeatherDesc = (lang, code) => {
  const cats = WEATHER_CATEGORIES[lang] || WEATHER_CATEGORIES['en'];
  const catIdx = getWeatherCategory(code);
  return cats[catIdx];
};

// Request Location Permissions
export async function requestLocationPermissions() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

// Fetch physical location coordinates
export async function getDeviceCoordinates() {
  try {
    const permitted = await requestLocationPermissions();
    if (!permitted) return null;

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    
    // Resolve city name via reverse geocoding
    let city = "Position mobile";
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&count=1`;
      const res = await fetch(geoUrl);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        city = data.results[0].name;
      }
    } catch (e) {
      console.log("Reverse geocoding failed, using placeholder:", e.message);
    }

    return {
      latitude: parseFloat(loc.coords.latitude.toFixed(4)),
      longitude: parseFloat(loc.coords.longitude.toFixed(4)),
      city: city
    };
  } catch (err) {
    console.error("Error getting location:", err);
    return null;
  }
}

// Fetch weather from Open-Meteo
async function getWeatherString(lat, lon, city) {
  const lang = getDeviceLanguage();
  const strings = getTranslation(lang);
  
  if (!lat || !lon) return `${strings.weatherPrefix}${strings.posUnavailable}`;
  
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
    const desc = getWeatherDesc(lang, code);
    
    const sunsetISO = data.daily.sunset[0];
    const sunset = sunsetISO ? sunsetISO.split('T')[1].slice(0, 5) : '—';

    const cityStr = city ? `${city} : ` : '';
    const windLabel = lang === 'fr' ? 'Vent' : 'Wind';
    const windUnit = lang === 'en' ? 'mph' : 'km/h';
    const humidityLabel = lang === 'fr' ? 'Humidité' : 'Humidity';
    const sunsetLabel = lang === 'fr' ? 'Coucher soleil' : 'Sunset';

    return [
      `${strings.weatherPrefix}${cityStr}${temp}°C, ${desc}`,
      `${windLabel}          : ${wind} ${windUnit} | ${humidityLabel} : ${humidity}%`,
      `${sunsetLabel}: ${sunset}`
    ].join('\n');
  } catch (err) {
    return `${strings.weatherPrefix}${strings.weatherError} (${err.message})`;
  }
}

// Format Date & Time
function getDatetimeString(tz) {
  const locale = getDeviceLocale();
  const lang = getDeviceLanguage();
  const strings = getTranslation(lang);
  const now = new Date();
  const opts = { timeZone: tz, hour12: false };
  const time = now.toLocaleTimeString(locale, { ...opts, hour: '2-digit', minute: '2-digit' });
  const day = now.toLocaleDateString(locale, { ...opts, weekday: 'long' });
  const date = now.toLocaleDateString(locale, { ...opts, day: 'numeric', month: 'long', year: 'numeric' });
  
  const offset = -now.getTimezoneOffset() / 60;
  const utcStr = `UTC${offset >= 0 ? '+' : ''}${offset}`;
  
  const month = now.getMonth() + 1;
  let season = lang === 'fr' ? 'Hiver' : 'Winter';
  if (month >= 3 && month <= 5) season = lang === 'fr' ? 'Printemps' : 'Spring';
  else if (month >= 6 && month <= 8) season = lang === 'fr' ? 'Été' : 'Summer';
  else if (month >= 9 && month <= 11) season = lang === 'fr' ? 'Automne' : 'Autumn';
  
  const hour = parseInt(time.split(':')[0]);
  let period = lang === 'fr' ? 'Nuit' : 'Night';
  if (hour >= 6 && hour < 12) period = lang === 'fr' ? 'Matin' : 'Morning';
  else if (hour >= 12 && hour < 18) period = lang === 'fr' ? 'Après-midi' : 'Afternoon';
  else if (hour >= 18 && hour < 22) period = lang === 'fr' ? 'Soirée' : 'Evening';
  
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
export async function buildFullContextString(settings) {
  if (settings.enabled === false) return '';

  const locale = getDeviceLocale();
  const lang = getDeviceLanguage();
  const strings = getTranslation(lang);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const now = new Date();
  const opts = { timeZone: tz, hour12: false };
  const time = now.toLocaleTimeString(locale, { ...opts, hour: '2-digit', minute: '2-digit' });
  const day = now.toLocaleDateString(locale, { ...opts, weekday: 'long' });
  const date = now.toLocaleDateString(locale, { ...opts, day: 'numeric', month: 'long', year: 'numeric' });
  const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);
  
  let contextLine = `[${strings.timestamp}${formattedDay} ${date}, ${time}`;

  // 2. Weather (if enabled)
  if (settings.includeWeather !== false) {
    let lat = null, lon = null, city = "";
    if (settings.locationMode === 'auto') {
      const coords = await getDeviceCoordinates();
      if (coords) {
        lat = coords.latitude;
        lon = coords.longitude;
        city = coords.city;
      } else if (settings.manualLocation) {
        lat = settings.manualLocation.latitude;
        lon = settings.manualLocation.longitude;
        city = settings.manualLocation.city;
      }
    } else if (settings.manualLocation) {
      lat = settings.manualLocation.latitude;
      lon = settings.manualLocation.longitude;
      city = settings.manualLocation.city;
    }
    
    if (lat && lon) {
      try {
        const weatherStr = await getWeatherString(lat, lon, city);
        if (weatherStr) {
          const cleanWeather = weatherStr.split('\n')[0].replace(/^[a-zA-Zà-üÀ-Ü\s]+:\s*/, '');
          contextLine += ` | ${strings.weather}${cleanWeather}`;
        }
      } catch (err) {
        console.error("Error fetching weather for single line:", err);
      }
    }
  }

  // 4. Calendar events (PRO only)
  const isPremium = await isPremiumUser();
  if (isPremium) {
    try {
      const calendarStr = await getUpcomingEventsString();
      if (calendarStr) {
        const cleanCalendar = calendarStr.replace(/\n/g, ' | ');
        contextLine += ` | ${strings.calendar}${cleanCalendar}`;
      }
    } catch (err) {
      console.error("Error fetching calendar:", err);
    }
  }

  contextLine += ']';
  return contextLine;
}
