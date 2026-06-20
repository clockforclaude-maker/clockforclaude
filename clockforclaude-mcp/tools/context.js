/**
 * Full context block — combines all tools.
 */

const { getCurrentDatetime } = require('./datetime');
const { getWeather } = require('./weather');

async function getFullContext(lat, lon, city) {
  const datetime = getCurrentDatetime();
  const weather = lat && lon ? await getWeather(lat, lon, city) : 'Weather    : location not configured';

  return [
    '[System timestamp]',
    datetime,
    weather,
    '→ Adapt your tone and answers to this real-world context.',
    "→ Don't greet with 'good night' before 21:00 local time.",
    '→ Mention the weather only when relevant to the conversation.'
  ].join('\n');
}

module.exports = { getFullContext };
