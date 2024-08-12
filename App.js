import 'react-native-gesture-handler';
import * as React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Screens
import CanvasScreen from './screens/CanvasScreen';
import MemoScreen from './screens/MemoScreen';
import PlayScreen from './screens/PlayScreen'

const Drawer = createDrawerNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: true,
          }}
        >
          <Drawer.Screen name="Play" component={PlayScreen} />
          <Drawer.Screen name="Canvas" component={CanvasScreen} />
          <Drawer.Screen name="Memo" component={MemoScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
