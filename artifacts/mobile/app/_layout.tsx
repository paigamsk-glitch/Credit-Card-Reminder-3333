import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CardsProvider } from "@/context/CardsContext";
import { useNotifications } from "@/hooks/useNotifications";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const queryClient = new QueryClient();

function NotificationRouter() {
  useNotifications();
  return null;
}

function RootGuard() {
  const { user, token, isLoading, isLocked, pin } = useAuth();
  const segments = useSegments();

  if (isLoading) return null;

  const inAuthGroup = segments[0] === "(auth)";
  const onLock = segments[0] === "lock";
  const onSetupPin = segments[0] === "setup-pin";

  if (!token || !user) {
    if (!inAuthGroup) return <Redirect href="/(auth)/login" />;
    return null;
  }

  if (isLocked && pin) {
    if (!onLock) return <Redirect href="/lock" />;
    return null;
  }

  // Redirect away from auth screens and lock screen when fully authenticated and unlocked.
  // setup-pin is intentionally excluded — authenticated users can reach it from Settings.
  if (inAuthGroup || onLock) {
    return <Redirect href="/(tabs)" />;
  }

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <NotificationRouter />
      <RootGuard />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lock" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen
          name="setup-pin"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="card/[id]"
          options={{
            title: "Card Details",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#F0F4FB" },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="card/add"
          options={{
            title: "Add Card",
            presentation: "modal",
            headerStyle: { backgroundColor: "#F0F4FB" },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="card/edit/[id]"
          options={{
            title: "Edit Card",
            presentation: "modal",
            headerStyle: { backgroundColor: "#F0F4FB" },
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CardsProvider>
              <GestureHandlerRootView>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </CardsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
