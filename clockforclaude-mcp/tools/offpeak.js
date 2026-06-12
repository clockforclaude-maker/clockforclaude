/**
 * Off-peak detector for Claude
 * Peak hours (ET): 8am–2pm weekdays
 * France (Paris): 14h–20h weekdays = peak
 * Weekends: always off-peak (2x limits)
 */

function getOffpeakStatus(timezone) {
  const tz = timezone || 'Europe/Paris';
  const now = new Date();
  
  const localHour = parseInt(now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', hour12: false }));
  const dayOfWeek = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short' });
  
  const isWeekend = dayOfWeek === 'Sat' || dayOfWeek === 'Sun';
  
  // Peak window ET: 8:00–14:00 → Paris: 14:00–20:00 (winter UTC+1) or 15:00–21:00 (summer UTC+2)
  // Simplified: peak = 14h–20h Paris weekdays
  const isPeakHour = localHour >= 14 && localHour < 20;
  const isOffPeak = isWeekend || !isPeakHour;
  
  if (isWeekend) {
    return `Heures creuses : ⚡ ACTIF — Weekend boost (usage Claude x2 toute la journée)`;
  }
  
  if (!isPeakHour) {
    const nextPeak = localHour < 14 ? 14 : 'demain 14h';
    return `Heures creuses : ⚡ ACTIF — Limites Claude doublées (jusqu'à ${typeof nextPeak === 'number' ? nextPeak + 'h00' : nextPeak})`;
  }
  
  return `Heures creuses : 🔋 Heures pleines — Limites normales (boost actif après 20h00)`;
}

module.exports = { getOffpeakStatus };
