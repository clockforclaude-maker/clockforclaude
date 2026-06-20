/**
 * Datetime tool — no external API needed.
 */

function getCurrentDatetime(timezone) {
  const now = new Date();
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const opts = { timeZone: tz, hour12: false };
  const time = now.toLocaleTimeString('en-US', { ...opts, hour: '2-digit', minute: '2-digit' });
  const day = now.toLocaleDateString('en-US', { ...opts, weekday: 'long' });
  const date = now.toLocaleDateString('en-US', { ...opts, day: 'numeric', month: 'long', year: 'numeric' });

  // Timezone offset
  const offset = -now.getTimezoneOffset() / 60;
  const utcStr = `UTC${offset >= 0 ? '+' : ''}${offset}`;

  // Season (Northern Hemisphere)
  const month = now.getMonth() + 1;
  let season = 'Winter';
  if (month >= 3 && month <= 5) season = 'Spring';
  else if (month >= 6 && month <= 8) season = 'Summer';
  else if (month >= 9 && month <= 11) season = 'Autumn';

  const hour = parseInt(time.split(':')[0]);
  let period = 'Night';
  if (hour >= 6 && hour < 12) period = 'Morning';
  else if (hour >= 12 && hour < 18) period = 'Afternoon';
  else if (hour >= 18 && hour < 22) period = 'Evening';

  return [
    `Local time : ${time}`,
    `Date       : ${day} ${date}`,
    `Timezone   : ${tz} (${utcStr})`,
    `Season     : ${season} | Part of day: ${period}`
  ].join('\n');
}

module.exports = { getCurrentDatetime };
