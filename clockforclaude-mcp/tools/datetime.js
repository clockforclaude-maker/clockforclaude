/**
 * Datetime tool — no external API needed
 */

function getCurrentDatetime(timezone) {
  const now = new Date();
  
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const opts = { timeZone: tz, hour12: false };
  const time = now.toLocaleTimeString('fr-FR', { ...opts, hour: '2-digit', minute: '2-digit' });
  const day = now.toLocaleDateString('fr-FR', { ...opts, weekday: 'long' });
  const date = now.toLocaleDateString('fr-FR', { ...opts, day: 'numeric', month: 'long', year: 'numeric' });
  
  // Timezone offset
  const offset = -now.getTimezoneOffset() / 60;
  const utcStr = `UTC${offset >= 0 ? '+' : ''}${offset}`;
  
  // Season (Northern Hemisphere)
  const month = now.getMonth() + 1;
  let season = 'Hiver';
  if (month >= 3 && month <= 5) season = 'Printemps';
  else if (month >= 6 && month <= 8) season = 'Été';
  else if (month >= 9 && month <= 11) season = 'Automne';
  
  const hour = parseInt(time.split(':')[0]);
  let period = 'Nuit';
  if (hour >= 6 && hour < 12) period = 'Matin';
  else if (hour >= 12 && hour < 18) period = 'Après-midi';
  else if (hour >= 18 && hour < 22) period = 'Soirée';
  
  return [
    `Heure locale  : ${time}`,
    `Date          : ${day.charAt(0).toUpperCase() + day.slice(1)} ${date}`,
    `Fuseau        : ${tz} (${utcStr})`,
    `Saison        : ${season} | Moment : ${period}`
  ].join('\n');
}

module.exports = { getCurrentDatetime };
