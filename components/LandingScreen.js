import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Button, Dialog, Icon, Input} from '@rneui/themed';
import {Storage} from 'aws-amplify';
import {useImmer} from 'use-immer';
import CameraScanner from './CameraScanner';
import AppCamera from './AppCamera';
import {createFolderObject} from '../functions/createFolderObject';

const LandingScreen = ({navigation}) => {
  const [folderObject, setFolderObject] = useImmer({});
  const [displayDialog, setDisplayDialog] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [addError, setAddError] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const folderExists = folderName + '/' in folderObject;

  const addFolder = () => {
    const trimmedFolderName = folderName.trim();
    if (trimmedFolderName.search('/') !== -1) {
      setAddError('Folder name cannot contain "/"');
    } else if (trimmedFolderName === '') {
      setAddError('Folder name is invalid');
    } else {
      createNewFolder();
      setCameraOpen(true);
      setDisplayDialog(false);
    }
  };

  const enterFolder = folder => {
    navigation.navigate('Folders', {
      initialFolderName: folder,
    });
    setFolderName('');
  };

  const createNewFolder = async () => {
    const addFolderName = folderName.trim() + '/';
    try {
      await Storage.put(addFolderName);
      await Storage.put(addFolderName + 'in/');
      await Storage.put(addFolderName + 'out/');
      await Storage.put(addFolderName + 'supplement/');
      await Storage.put(addFolderName + 'default/');
    } catch (err) {
      console.log(err);
    }
    setDisplayDialog(false);
  };

  useEffect(() => {
    const getExistingFolderNames = async () => {
      const folders = await createFolderObject('');
      setFolderObject(folders);
    };
    getExistingFolderNames();
  }, [setFolderObject]);

  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaProvider>
        {scannerOpen ? (
          <CameraScanner
            setCode={setFolderName}
            close={() => setScannerOpen(false)}
          />
        ) : cameraOpen ? (
          <AppCamera
            pathString={folderName + '/default/'}
            displayCamera={setCameraOpen}
            updateFolder={() => {
              enterFolder(folderName + '/default/');
            }}
          />
        ) : (
          <View style={styles.mainContainer}>
            <Dialog
              isVisible={displayDialog}
              onBackdropPress={() => {
                setDisplayDialog(false);
                setFolderName('');
                setAddError('');
              }}>
              <Dialog.Title title="Add/Enter Folder" />
              <Input
                placeholder="Type Folder Name"
                onChangeText={val => setFolderName(val)}
                value={folderName}
              />
              {addError !== '' && <Text style={styles.error}>{addError}</Text>}
              <View style={styles.dialogueButtonsContainer}>
                <Button
                  title="Scan"
                  buttonStyle={styles.plainButton}
                  titleStyle={styles.dialogueButtonTitleStyle}
                  onPress={() => setScannerOpen(true)}
                />
                <Button
                  title="Enter"
                  disabled={!folderExists}
                  disabledStyle={styles.disabledStyle}
                  buttonStyle={styles.plainButton}
                  titleStyle={styles.dialogueButtonTitleStyle}
                  onPress={() => {
                    setDisplayDialog(false);
                    setCameraOpen(true);
                  }}
                />
                <Button
                  title="Add"
                  disabled={folderExists}
                  disabledStyle={styles.disabledStyle}
                  buttonStyle={styles.plainButton}
                  titleStyle={styles.dialogueButtonTitleStyle}
                  onPress={() => {
                    addFolder();
                  }}
                />
              </View>
            </Dialog>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Folders', {
                  initialFolderName: '',
                })
              }>
              <View style={styles.iconContainer}>
                <Icon name="folder" type="entypo" color="#517fa4" size={100} />
                <Text>Browse Folders</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setDisplayDialog(true);
              }}>
              <View style={styles.iconContainer}>
                <Icon name="camera" type="entypo" color="#517fa4" size={100} />
                <Text>Take Picture</Text>
              </View>
            </TouchableOpacity>
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
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconContainer: {
    alignItems: 'center',
    padding: 25,
  },
  dialogueButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  plainButton: {
    backgroundColor: null,
  },
  disabledStyle: {
    backgroundColor: null,
    color: 'gray',
  },
  dialogueButtonTitleStyle: {
    color: 'black',
  },
  error: {
    color: 'red',
  },
});

export default LandingScreen;
