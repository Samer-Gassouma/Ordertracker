//import * as Application from 'expo-application';
import * as Notifications from 'expo-notifications';
import i18n from './i18n';

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return null;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } catch (error) {
    Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notificationError'),
        body: i18n.t('notificationErrorMessage'),
      },
      trigger: null,
    });
  }
  return token;
}
export async function requestTrackingPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

interface ApiVersionResponse {
  version: string;
}


export async function checkApiVersion(): Promise<boolean> {
  try {
    const response = await fetch('https://apidev.vanilla.digital/public/version');
    const data = await response.json() as ApiVersionResponse;
    const apiVersion = data.version;
    const API_VERSION = "22.0.0";
    //if (apiVersion !== Application.nativeApplicationVersion) {
    if (apiVersion !== API_VERSION) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.t('updateRequired'),
          body: i18n.t('updateRequiredMessage'),
        },
        trigger: null, 
      });
      return false;
    }
    return true;
  } catch (error) {
    Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.t('networkError'),
          body: i18n.t('networkErrorMessage'),
        },
        trigger: null, 
      });
    return false;
  }
}
