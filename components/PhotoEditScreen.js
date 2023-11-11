import React, {useState} from 'react';
import {StyleSheet, View, SafeAreaView} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Image} from '@rneui/base';

const PhotoEditScreen = ({route, navigation}) => {
  const {photo} = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaProvider>
        <Image source={photo.path} style={styles.image} />
      </SafeAreaProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: '100%',
    width: '100%',
  },
});

export default PhotoEditScreen;
