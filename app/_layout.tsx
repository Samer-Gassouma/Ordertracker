import { useFonts } from 'expo-font';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect,useState } from 'react';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';

import { ActivityIndicator, Button, PaperProvider, Text } from 'react-native-paper';
import { checkApiVersion, requestTrackingPermission } from './appUtils';
import { View } from 'react-native';
import SplashScreen101 from './splash'; 


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

//SplashScreen.preventAutoHideAsync();



export default function RootLayout() {

  const [apiVersion, setApiVersion] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  
  const fetchData = async (): Promise<void> => {
    try {
      const res = await checkApiVersion();
      setApiVersion(res);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const res = requestTrackingPermission();
    if (!res) {
      setLoading(true);
    }
    //SendNotif();
    fetchData();
  }, [loading]);




  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
    
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (loading) {
    return <ActivityIndicator />;
  }
  if (loading || !loaded) { 
    return <SplashScreen101  />; 
  }
  if(!apiVersion) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Update required</Text>
        <Button onPress={fetchData}>Retry</Button>
      </View>
    );
  }

  return (
    <PaperProvider>

      {/*<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>*/}
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="TrackingView" options={{ headerShown: false }} />
          <Stack.Screen name="CarriersView" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      {/*</ThemeProvider>*/}
    </PaperProvider>

  );
}

