// Web वर font variables देतो; native वर हा import निरुपद्रवी आहे.
import '@/global.css';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import {
  Mukta_400Regular,
  Mukta_500Medium,
  Mukta_600SemiBold,
  Mukta_700Bold,
  Mukta_800ExtraBold,
} from '@expo-google-fonts/mukta';
import { Stack, ThemeProvider, DefaultTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SessionProvider } from '@/lib/session';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

/**
 * डिझाइन फक्त light mode मध्ये आहे, म्हणून dark theme अजून बांधलेला नाही —
 * `DefaultTheme` वरच ठेवला आहे. Dark करायचा असेल तर आधी tokens ला दुसरा संच लागेल.
 */
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function RootLayout() {
  // Design system Poppins वर आहे, आणि **मराठीसाठी Mukta** — Poppins मध्ये
  // देवनागरी अक्षरं नाहीत, त्यामुळे मराठी ओळी त्यात दिल्या तर प्रत्येक फोन
  // स्वतःचा पर्यायी font घालतो आणि दिसणं बदलत राहतं.
  // Font येण्याआधी screens दाखवले तर मजकूर आधी
  // system font मध्ये दिसतो आणि मग उडी मारून बदलतो — म्हणून तोपर्यंत splash तसाच.
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Mukta_400Regular,
    Mukta_500Medium,
    Mukta_600SemiBold,
    Mukta_700Bold,
    Mukta_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <SessionProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
