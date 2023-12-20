import React, {useEffect, useRef} from 'react';
import {StyleSheet, View, SafeAreaView} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Camera, useCameraPermission} from 'react-native-vision-camera';

import {Icon} from '@rneui/themed';

import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

const CameraScanner = ({setCode, close}) => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const devices = Camera.getAvailableCameraDevices();
  const device = devices.find(d => d.position === 'back');
  const camera = useRef(null);
  const codeScanner = {
    codeTypes: [
      'code-128',
      'code-39',
      'code-93',
      'codabar',
      'ean-13',
      'ean-8',
      'itf',
      'upc-e',
      'pdf-417',
    ],
    onCodeScanned: codes => {
      setCode(codes[0].value);
      close();
    },
  };
  useEffect(() => {
    const checkCameraPermissions = async () => {
      if (!hasPermission) {
        await requestPermission();
      }
    };
    checkCameraPermissions();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaProvider>
        <View style={styles.container}>
          {hasPermission && device && (
            <View style={styles.cameraContainer}>
              <Icon
                name="close"
                type="fontawesome"
                color="white"
                size={30}
                containerStyle={styles.closePhotoIconContainer}
                onPress={() => close()}
              />
              <Camera
                style={styles.camera}
                device={device}
                isActive={true}
                codeScanner={codeScanner}
                ref={camera}
              />
            </View>
          )}
        </View>
      </SafeAreaProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    height: '100%',
  },
  camera: {
    height: '100%',
    width: '100%',
  },
  closePhotoIconContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 50,
    height: 50,
    zIndex: 1,
    shadowColor: 'black',
    shadowRadius: 5,
    shadowOpacity: 1,
  },
});
export default CameraScanner;
