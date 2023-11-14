import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Camera} from 'react-native-vision-camera';
import {Icon} from '@rneui/themed';

const LandingScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaProvider>
        <View style={styles.mainContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Folders')}>
            <View style={styles.iconContainer}>
              <Icon name="folder" type="entypo" color="#517fa4" size={100} />
              <Text>Browse Folders</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Camera')}>
            <View style={styles.iconContainer}>
              <Icon name="camera" type="entypo" color="#517fa4" size={100} />
              <Text>Camera</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: '10%',
  },
  iconContainer: {
    alignItems: 'center',
    padding: 25,
  },
});

export default LandingScreen;
