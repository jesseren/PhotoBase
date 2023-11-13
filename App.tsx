import React from 'react';

import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {Amplify} from 'aws-amplify';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LandingScreen from './components/LandingScreen';
import AppCamera from './components/AppCamera';
import Folders from './components/Folders';
import PhotoLocationSelection from './components/PhotoLocationSelection';
import keys from './keys';

Amplify.configure({
  Auth: {
    identityPoolId: keys.identityPoolId, //REQUIRED - Amazon Cognito Identity Pool ID
    region: 'us-east-2', // REQUIRED - Amazon Cognito Region
  },
});

const App = () => {
  const Stack = createNativeStackNavigator();
  const defaultOptions = {headerShown: false};

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={LandingScreen}
          options={defaultOptions}
        />
        <Stack.Screen
          name="Camera"
          component={AppCamera}
          options={defaultOptions}
        />
        <Stack.Screen
          name="Folders"
          component={Folders}
          options={defaultOptions}
        />
        <Stack.Screen
          name="PhotoLocationSelection"
          component={PhotoLocationSelection}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
