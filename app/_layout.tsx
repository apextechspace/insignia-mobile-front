import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

import { Cinzel_400Regular, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { PlayfairDisplay_700Bold, PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';

import Colors from '@/constants/Colors';
import * as Notifications from 'expo-notifications';
import { authService } from '@/services/auth';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import { WishlistProvider } from '@/hooks/useWishlist';
import { sessionService } from '@/services/session';

// Root notifications handler is already set in utils/notifications.ts

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Cinzel_400Regular,
    Cinzel_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Senior Dev: Adding a slight delay to the splash screen to allow the user 
      // to experience the brand before entering the app.
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 1000); 
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    sessionService.setUnauthorizedHandler(() => {
      router.replace('/login');
    });

    return () => {
      sessionService.setUnauthorizedHandler(null);
    };
  }, [router]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        syncTokenWithBackend(token);
      }
    });

    // Listener for when a notification is received while the app is foregrounded
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Foreground notification:', notification);
    });

    // Listener for when a user interacts with a notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification interaction:', response);
      // Senior Dev Note: Here we could navigate to a specific screen based on notification data
      // e.g. if (response.notification.request.content.data.type === 'order') router.push('/orders');
    });

    return () => {
      foregroundSubscription?.remove();
      responseSubscription?.remove();
    };
  }, []);

  const syncTokenWithBackend = async (token: string) => {
    try {
      const authToken = await sessionService.getToken();
      if (authToken) {
        await authService.updatePushToken(token);
      }
    } catch (e) {
      console.error('Failed to sync push token:', e);
    }
  };

  const CustomLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.background,
      text: Colors.light.text,
      primary: Colors.light.tint,
      card: Colors.light.card,
      border: Colors.light.border,
    },
  };

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.background,
      text: Colors.dark.text,
      primary: Colors.dark.tint,
      card: Colors.dark.card,
      border: Colors.dark.border,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
      <WishlistProvider>
        <Stack screenOptions={{
          headerTitleStyle: {
            fontFamily: 'Cinzel_700Bold',
            fontSize: 18,
          },
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? Colors.dark.card : Colors.light.card,
          },
          headerTintColor: colorScheme === 'dark' ? Colors.dark.text : Colors.light.text,
          headerShadowVisible: false,
        }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="branch-selection" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="suites/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="suites/book" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="suites/payment" options={{ headerShown: false }} />
          <Stack.Screen name="shop/index" options={{ headerShown: false }} />
          <Stack.Screen name="shop/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="shop/checkout" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="shop/payment" options={{ headerShown: false }} />
          <Stack.Screen name="management/apartment" options={{ headerShown: false }} />
          <Stack.Screen name="management/stock" options={{ headerShown: false }} />
          <Stack.Screen name="management/activities" options={{ headerShown: false }} />
          <Stack.Screen name="management/bookings" options={{ headerShown: false }} />
          <Stack.Screen name="management/notifications" options={{ headerShown: false }} />
          <Stack.Screen name="management/edit-profile" options={{ headerShown: false }} />
          <Stack.Screen name="management/security-check" options={{ headerShown: false }} />
          <Stack.Screen name="management/create-pin" options={{ headerShown: false }} />
          <Stack.Screen name="management/service-orders" options={{ headerShown: false }} />
          <Stack.Screen name="management/wishlist" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </WishlistProvider>
    </ThemeProvider>
  );
}

// registerForPushNotificationsAsync moved to @/utils/notifications.ts
