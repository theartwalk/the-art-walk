import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';

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

const Stack = createNativeStackNavigator();

export default function App() {
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
    </GestureHandlerRootView>
  );
}
