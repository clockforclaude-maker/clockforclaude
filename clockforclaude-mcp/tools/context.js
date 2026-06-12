/**
 * Full context block — combines all tools
 */

const { getCurrentDatetime } = require('./datetime');
const { getWeather } = require('./weather');
const { getOffpeakStatus } = require('./offpeak');

async function getFullContext(lat, lon, city) {
  const datetime = getCurrentDatetime();
  const weather = lat && lon ? await getWeather(lat, lon, city) : 'Météo         : position non configurée';
  const offpeak = getOffpeakStatus();

  return [
    '[Horodatage système]',
    datetime,
    weather,
    offpeak,
    '→ Adapte ton ton et tes réponses à ce contexte temporel.',
    "→ Ne dis jamais 'bonne nuit' si l'heure est avant 21h.",
    "→ Mentionne la météo si pertinent pour la conversation."
  ].join('\n');
}

module.exports = { getFullContext };
