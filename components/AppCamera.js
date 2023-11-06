import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, SafeAreaView} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {Button, Icon} from '@rneui/themed';

const AppCamera = ({navigation}) => {
  ///const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevices('back');

  const camera = useRef < Camera > null;
  const [takenPhoto, setTakenPhoto] = useState(null);
  const takePhotoClicked = () => {
    const takePhoto = async () => {
      const photo = await camera.current.takePhoto({
        flash: 'off',
      });
      setTakenPhoto(photo);
    };
    takePhoto();
  };
  //   useEffect(() => {
  //     const checkCameraPermissions = async () => {
  //       if (!hasPermission) {
  //         await requestPermission();
  //       }
  //     };
  //     checkCameraPermissions();
  //   }, [navigation, hasPermission, requestPermission]);

  return (
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
              onPress={takePhotoClicked}
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

export default AppCamera;
