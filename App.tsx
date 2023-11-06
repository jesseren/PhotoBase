import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, SafeAreaView} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {Button, Icon} from '@rneui/themed';

import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {Amplify} from 'aws-amplify';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LandingScreen from './components/LandingScreen';
import AppCamera from './components/AppCamera';
import Folders from './components/Folders';
import PhotoEditScreen from './components/PhotoEditScreen';
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
  const device = useCameraDevices('back');

  const camera = useRef(null);
  return (
    /* <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={LandingScreen} />
        <Stack.Screen name="Camera" component={AppCamera} />
        <Stack.Screen name="Folders" component={Folders} />
        <Stack.Screen name="PhotoEditScreen" component={PhotoEditScreen} />
        <Stack.Screen
          name="PhotoLocationSelection"
          component={PhotoLocationSelection}
        />
      </Stack.Navigator>
    </NavigationContainer> */
    <SafeAreaView style={styles.container}>
      <SafeAreaProvider>
        {true ? (
          <View style={styles.photoContainer}>
            <Camera
              style={styles.camera}
              device={device}
              isActive={true}
              ref={camera}
              photo={true}
            />
            <Button
              buttonStyle={styles.takePhotoButton}
              containerStyle={styles.takePhotoButtonContainer}
              //onPress={takePhotoClicked}
            />
          </View>
        ) : null}
      </SafeAreaProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  photoContainer: {
    flex: 1,
  },
  camera: {
    height: '85%',
  },
  closePhotoIconContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 50,
    height: 50,
    zIndex: 1,
  },
  takePhotoButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  takePhotoButtonContainer: {
    alignSelf: 'center',
    marginTop: 30,
    padding: 5,
    borderColor: 'white',
    borderWidth: 7.5,
    borderRadius: 37.5,
  },
  sendPhotoButton: {
    borderRadius: 5,
  },
  sendPhotoButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  photo: {
    height: '100%',
  },
  standardText: {
    color: 'white',
  },
});

export default App;
