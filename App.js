import 'react-native-gesture-handler';
import * as React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Screens
import MapScreen from './screens/MapScreen';
import SettingsScreen from './screens/SettingsScreen';

const Drawer = createDrawerNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="Map"
          screenOptions={{
            headerShown: true,
          }}
        >
          <Drawer.Screen name="Settings" component={SettingsScreen} />
          <Drawer.Screen name="Map" component={MapScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
