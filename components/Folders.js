import React, {useState, useEffect} from 'react';
import {StyleSheet, View, SafeAreaView} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Amplify, Storage} from 'aws-amplify';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import keys from '../keys';

Amplify.configure({
  Auth: {
    identityPoolId: keys.identityPoolId, //REQUIRED - Amazon Cognito Identity Pool ID
    region: 'us-east-2', // REQUIRED - Amazon Cognito Region
  },
});

const Folders = () => {
  useEffect(() => {
    const getItems = async () => {
      try {
        const response = await Storage.list('test-images/');
        console.log(response);
      } catch (err) {
        console.log(err);
      }
    };
    getItems();
  }, []);
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

export default Folders;
