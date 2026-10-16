import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationBar } from 'expo-navigation-bar';
import { AuthProvider } from '@/src/context/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);

    if (Platform.OS === 'android') {
      // 1. Full-screen Edge-to-Edge Status Bar (removes top black bar)
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setBarStyle('dark-content');

      // 2. Full-screen Edge-to-Edge Navigation Bar (removes bottom white bar)
      try {
        NavigationBar.setStyle('light');
      } catch {
        // Safe fallback
      }
    }
  }, []);

  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <NavigationBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(ai)" />
        <Stack.Screen name="admin/index" />
        <Stack.Screen name="admin/dashboard" />
        <Stack.Screen name="word/[id]" />
        <Stack.Screen name="grammar/index" />
        <Stack.Screen name="grammar/[id]" />
        <Stack.Screen name="communication/index" />
        <Stack.Screen name="communication/[situation]" />
        <Stack.Screen name="practice/test-setup" />
        <Stack.Screen name="practice/run" />
        <Stack.Screen name="practice/result" />
        <Stack.Screen name="notebook/index" />
        <Stack.Screen name="profile/index" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}
