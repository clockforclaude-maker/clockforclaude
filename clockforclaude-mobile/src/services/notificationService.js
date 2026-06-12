// notificationService.js - Manage native device push notifications for ClockForClaude

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for local notifications!');
    return false;
  }

  // Set up Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8b5cf6',
    });
  }

  return true;
}

export async function sendLocalNotification(title, body) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true,
    },
    trigger: null, // send immediately
  });
}

// Schedules a smart notification combining upcoming event and weather
export async function scheduleSmartAlert(eventTitle, eventMinutesAway, cityName, temp, condition) {
  const title = `Prochain rendez-vous : ${eventTitle}`;
  const body = `Dans ${eventMinutesAway} minutes. Météo à ${cityName} : ${temp}°C, ${condition}. Prenez vos dispositions ! ☔`;
  await sendLocalNotification(title, body);
}

// Schedules an off-peak start alert
export async function scheduleOffPeakAlert(hoursLeft) {
  const title = `⚡ Heures Creuses Actives !`;
  const body = `Vos limites d'utilisation de Claude sont doublées pour les prochaines ${hoursLeft} heures. Profitez-en !`;
  await sendLocalNotification(title, body);
}
