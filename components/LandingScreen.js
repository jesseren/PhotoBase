import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Icon} from '@rneui/themed';

const LandingScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaProvider>
        <View style={styles.mainContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Folders', {
                blob: null,
                name: null,
                metadata: null,
              })
            }>
            <View style={styles.iconContainer}>
              <Icon name="folder" type="entypo" color="#517fa4" size={100} />
              <Text>Browse Folders</Text>
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
