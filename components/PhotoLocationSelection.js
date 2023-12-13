import React, {useState} from 'react';
import {StyleSheet, View, SafeAreaView} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {Amplify, Storage} from 'aws-amplify';
import keys from '../keys';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

const PhotoLocationSelection = ({navigation, route}) => {
  const {photo} = route.params;
  const sendPhoto = async () => {
    try {
      const response = await fetch(photo.path);
      const blob = await response.blob();
      await Storage.put(
        `test-images/${photo.path.substring(photo.path.length - 14)}`,
        blob,
        {
          contentType: 'image/jpeg', // contentType is optional
        },
      );
    } catch (err) {
      console.log('Error uploading file:', err);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaProvider>
        <View />
      </SafeAreaProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PhotoLocationSelection;
