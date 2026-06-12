// calendarService.js - Fetch local device calendar events for Claude context

import * as Calendar from 'expo-calendar';

export async function requestCalendarPermissions() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

export async function getUpcomingEventsString() {
  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    if (status !== 'granted') {
      const permitted = await requestCalendarPermissions();
      if (!permitted) {
        return "Calendrier    : permission non accordée";
      }
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const calendarIds = calendars.map(cal => cal.id);

    if (calendarIds.length === 0) {
      return "Calendrier    : aucun calendrier trouvé";
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setHours(startDate.getHours() + 12); // Next 12 hours

    const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);

    if (events.length === 0) {
      return "Calendrier    : aucun événement prévu dans les prochaines 12 heures";
    }

    // Sort events by start date
    events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    const formattedEvents = events.map(evt => {
      const startTime = new Date(evt.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const endTime = new Date(evt.endDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const locationStr = evt.location ? ` [Lieu: ${evt.location}]` : '';
      return `  - ${startTime} à ${endTime} : ${evt.title}${locationStr}`;
    });

    return [
      "Agenda (Prochaines 12h) :",
      ...formattedEvents
    ].join('\n');

  } catch (err) {
    console.error("Error fetching calendar events:", err);
    return `Calendrier    : erreur de récupération (${err.message})`;
  }
}
