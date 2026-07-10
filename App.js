import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Animated, View, Image, StyleSheet } from 'react-native';

// On web, allow navigating directly to /admin
const linking = {
  prefixes: [],
  config: {
    screens: {
      Home: '',
      Admin: 'admin',
      Map: 'map',
      Saved: 'saved',
      Alerts: 'alerts',
      EventDetail: 'event/:id',
    },
  },
};

import HomeScreen from './src/screens/HomeScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import MapScreen from './src/screens/MapScreen';
import SavedScreen from './src/screens/SavedScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import AdminScreen from './src/screens/AdminScreen';

const LOGO = require('./assets/logo-dark.png');

const Stack = createNativeStackNavigator();

// ── Splash screen ──────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  const fade  = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1.08)).current;

  useEffect(() => {
    Animated.sequence([
      // Gently settle the logo into place
      Animated.timing(scale, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      // Hold for a moment
      Animated.delay(600),
      // Fade out
      Animated.timing(fade, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(onDone);
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity: fade }]}>
      <Animated.Image
        source={LOGO}
        style={[styles.splashLogo, { transform: [{ scale }] }]}
        resizeMode="contain"
      />
      <Animated.Text style={styles.splashTagline}>
        ART GALLERIES · EXHIBITIONS · OPEN CALLS
      </Animated.Text>
    </Animated.View>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Saved" component={SavedScreen} />
          <Stack.Screen name="Alerts" component={AlertsScreen} />
          <Stack.Screen
            name="Admin"
            component={AdminScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Splash sits on top of everything, fades out on its own */}
      {showSplash && (
        <SplashScreen onDone={() => setShowSplash(false)} />
      )}
    </GestureHandlerRootView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  splashLogo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 24,
  },
  splashTagline: {
    fontSize: 10,
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '600',
  },
});
