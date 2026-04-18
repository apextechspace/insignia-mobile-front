import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from '../services/api';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Learn more about projectId here: https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Expo Push Token:', token);
        
    // Save token to backend if user is logged in
    if (token) {
        await saveTokenToBackend(token);
    }
  } catch (e) {
      console.error('Error getting push token:', e);
  }
} else {
  console.log('Must use physical device for Push Notifications');
}

return token;
}

async function saveTokenToBackend(token: string) {
  try {
      await api.post('/user/push-token', { token: token });
      console.log('Push token synced with backend');
  } catch (error) {
      // Silent fail if not logged in or endpoint doesn't exist yet
      console.log('Push token sync skipped (likely not authenticated)');
  }
}

export async function sendLocalNotification(title: string, body: string, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // send immediately
  });
}
