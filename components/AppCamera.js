import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, SafeAreaView} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
} from 'react-native-vision-camera';
import {Button, Icon, Image} from '@rneui/themed';

const AppCamera = ({navigation}) => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const devices = Camera.getAvailableCameraDevices();
  const device = devices.find(d => d.position === 'back');
  const camera = useRef(null);
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
  useEffect(() => {
    const checkCameraPermissions = async () => {
      if (!hasPermission) {
        await requestPermission();
      }
    };
    checkCameraPermissions();
  }, [navigation, hasPermission, requestPermission]);

  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaProvider>
        {takenPhoto ? (
          <View>
            <Icon
              name="close"
              type="antdesign"
              color="white"
              containerStyle={styles.closePhotoIconContainer}
              onPress={() => setTakenPhoto(null)}
            />
            <Image
              source={{uri: 'file://' + takenPhoto.path}}
              containerStyle={styles.photo}
            />
          </View>
        ) : (
          <View style={styles.photoContainer}>
            {hasPermission && device ? (
              <View style={styles.cameraContainer}>
                <Camera
                  style={styles.camera}
                  device={device}
                  isActive={true}
                  photo={true}
                  ref={camera}
                />
              </View>
            ) : null}
            <Button
              buttonStyle={styles.takePhotoButton}
              containerStyle={styles.takePhotoButtonContainer}
              onPress={takePhotoClicked}
            />
          </View>
        )}
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
    backgroundColor: 'black',
  },
  cameraContainer: {
    height: '85%',
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
  photo: {
    height: '100%',
    width: '100%',
  },
  sendPhotoButton: {
    borderRadius: 5,
  },
  sendPhotoButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  standardText: {
    color: 'white',
  },
});

export default AppCamera;
