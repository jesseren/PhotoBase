import React, {useState} from 'react';
import {StyleSheet, View, SafeAreaView} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const Folders = () => {
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
