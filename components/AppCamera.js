import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, SafeAreaView, Image} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Camera, useCameraPermission} from 'react-native-vision-camera';
import PhotoEditor from '@baronha/react-native-photo-editor';
import {Button, Icon} from '@rneui/themed';

import {Storage} from 'aws-amplify';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

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
      photo.path = 'file://' + photo.path;
      setTakenPhoto(photo);
    };
    takePhoto();
  };

  const onEdit = async () => {
    try {
      const result = await PhotoEditor.open({
        path: takenPhoto.path,
      });
      console.log('resultEdit: ', result);
      setTakenPhoto({...takenPhoto, path: result});
    } catch (e) {
      console.log('error', e);
    }
  };

  const sendPhoto = async () => {
    try {
      const response = await fetch(takenPhoto.path);
      const blob = await response.blob();
      await Storage.put(
        `test-images/${takenPhoto.path.substring(takenPhoto.path.length - 14)}`,
        blob,
        {
          contentType: 'image/jpeg', // contentType is optional
        },
      );
    } catch (err) {
      console.log('Error uploading file:', err);
    }
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
        {takenPhoto ? (
          <View>
            <Icon
              name="close"
              type="fontawesome"
              color="white"
              size={30}
              containerStyle={styles.closePhotoIconContainer}
              onPress={() => setTakenPhoto(null)}
            />
            <Icon
              name="edit"
              type="entypo"
              color="white"
              size={30}
              containerStyle={styles.editPhotoIconContainer}
              onPress={onEdit}
            />
            <Image source={{uri: takenPhoto.path}} style={styles.photo} />
            <Button
              title={'Send'}
              buttonStyle={styles.sendPhotoButton}
              containerStyle={styles.sendPhotoButtonContainer}
              onPress={sendPhoto}
            />
          </View>
        ) : (
          <View style={styles.photoContainer}>
            {hasPermission && device ? (
              <View style={styles.cameraContainer}>
                <Icon
                  name="close"
                  type="fontawesome"
                  color="white"
                  size={30}
                  containerStyle={styles.closePhotoIconContainer}
                  onPress={() => navigation.navigate('Home')}
                />
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
    shadowColor: 'black',
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  editPhotoIconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    zIndex: 1,
    shadowRadius: 5,
    shadowOpacity: 1,
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
    zIndex: 1,
  },
  standardText: {
    color: 'white',
  },
});

export default AppCamera;
