import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Storage} from 'aws-amplify';
import {GetObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {fromCognitoIdentityPool} from '@aws-sdk/credential-providers';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import keys from '../keys';
import {Icon, Button, Dialog, Input} from '@rneui/themed';
import CameraScanner from './CameraScanner';
import AppCamera from './AppCamera';

const createPresignedUrlWithClient = ({region, bucket, key}) => {
  const client = new S3Client({
    region: region,
    credentials: fromCognitoIdentityPool({
      clientConfig: {region: 'us-east-2'},
      identityPoolId: keys.identityPoolId,
    }),
  });
  const command = new GetObjectCommand({Bucket: bucket, Key: key});
  return getSignedUrl(client, command, {expiresIn: 3600});
};

const Folders = ({navigation}) => {
  const [path, setPath] = useState([]);
  const [pathString, setPathString] = useState('');
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [displayAddFolder, setDisplayAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [addError, setAddError] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const getCurFolderName = () => {
    const names = pathString.split('/');
    return names.length <= 1 ? 'root' : names[names.length - 2];
  };

  const updateCurrentFoldersAndImages = async nextFolder => {
    const newFolders = [];
    const newImages = [];
    for (const key in nextFolder) {
      if (key.search('/') !== -1) {
        newFolders.push(key);
      } else {
        const image = await createPresignedUrlWithClient({
          region: 'us-east-2',
          bucket: keys.bucket,
          key: 'public/' + nextFolder[key],
        });
        newImages.push({uri: image, height: 200});
      }
    }
    setImages(newImages);
    setFolders(newFolders);
  };

  const createNewFolder = async () => {
    await Storage.put(pathString + newFolderName + '/');
    let newFolder = {};
    if (path.length === 1) {
      await Storage.put(pathString + newFolderName + '/' + 'in/');
      await Storage.put(pathString + newFolderName + '/' + 'out/');
      await Storage.put(pathString + newFolderName + '/' + 'supplement/');
      await Storage.put(pathString + newFolderName + '/' + 'default/');
      newFolder = {
        'in/': {},
        'out/': {},
        'supplement/': {},
        'default/': {},
      };
    }
    setFolders(oldFolders => {
      const newFolders = [...oldFolders];
      newFolders.push(newFolderName + '/');
      return newFolders;
    });
    setPath(oldPath => {
      const newPath = [...oldPath];
      newPath[newPath.length - 1][newFolderName + '/'] = newFolder;
      return newPath;
    });
    setDisplayAddFolder(false);
  };

  const addFolder = () => {
    if (newFolderName.search('/') !== -1) {
      setAddError('Folder name cannot contain "/"');
    } else if (newFolderName + '/' in path[path.length - 1]) {
      setAddError('Folder name already exists');
    } else {
      createNewFolder();
      setNewFolderName('');
    }
  };

  const createFolderObject = async () => {
    try {
      const response = await Storage.list('', {pageSize: 'ALL'});
      const main = {};
      for (const result of response.results) {
        const split = result.key.split('/');
        let cur = main;
        for (let i = 0; i < split.length - 1; i++) {
          split[i] = split[i] + '/';
          const newKey = split[i];
          if (!(newKey in cur)) {
            cur[newKey] = {};
          }
          cur = cur[newKey];
        }
        if (split[split.length - 1] !== '') {
          cur[split[split.length - 1]] = result.key;
        }
      }
      setPath([main]);
      updateCurrentFoldersAndImages(main);
    } catch (err) {
      console.log(err);
    }
  };

  const goBack = () => {
    if (path.length <= 1) {
      navigation.navigate('Home');
    } else {
      updateCurrentFoldersAndImages(path[path.length - 2]);
      setPath(oldPath => {
        const newPath = [...oldPath];
        newPath.pop();
        return newPath;
      });
      let cur = 0;
      for (let i = 0; i < pathString.length - 1; i++) {
        if (pathString.at(i) === '/') {
          cur = i;
        }
      }
      setPathString(cur === 0 ? '' : pathString.substring(0, cur + 1));
    }
  };

  const folderClicked = folderName => {
    const nextFolder = path[path.length - 1][folderName];
    setPathString(pathString + folderName);
    updateCurrentFoldersAndImages(nextFolder);
    setPath(oldPath => {
      const newPath = [...oldPath, nextFolder];
      return newPath;
    });
  };

  const updateCurrentFolder = () => {};

  useEffect(() => {
    createFolderObject();
  }, []);

  return (
    <SafeAreaView style={styles.topContainer}>
      <SafeAreaProvider>
        {scannerOpen ? (
          <CameraScanner
            setCode={setNewFolderName}
            close={() => setScannerOpen(false)}
          />
        ) : cameraOpen ? (
          <AppCamera pathString={pathString} displayCamera={setCameraOpen} />
        ) : (
          <View style={styles.topContainer}>
            <View style={styles.headerContainer}>
              <Button
                icon={{
                  name: 'arrowleft',
                  type: 'ant-design',
                  size: 25,
                  color: '#517fa4',
                }}
                buttonStyle={styles.plainButton}
                onPress={goBack}
              />
              <Text style={styles.folderName}>{getCurFolderName()}</Text>
              <View style={styles.headerRightButtons}>
                <Button
                  icon={{
                    name: 'camera',
                    type: 'entypo',
                    size: 25,
                    color: '#517fa4',
                  }}
                  containerStyle={styles.headerButtonContainer}
                  buttonStyle={styles.plainButton}
                  iconContainerStyle={styles.headerButtonContainer}
                  onPress={() => setCameraOpen(true)}
                />
                <Button
                  icon={{
                    name: 'addfolder',
                    type: 'ant-design',
                    size: 25,
                    color: '#517fa4',
                  }}
                  containerStyle={styles.headerButtonContainer}
                  buttonStyle={styles.plainButton}
                  iconContainerStyle={styles.headerButtonContainer}
                  onPress={() => setDisplayAddFolder(true)}
                />
              </View>
            </View>
            <Dialog
              isVisible={displayAddFolder}
              onBackdropPress={() => {
                setDisplayAddFolder(false);
                setNewFolderName('');
                setAddError('');
              }}>
              <Dialog.Title title="Add Folder" />
              <Input
                placeholder="Enter Folder Name"
                onChangeText={val => setNewFolderName(val)}
                value={newFolderName}
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
                  title="Add"
                  buttonStyle={styles.plainButton}
                  titleStyle={styles.dialogueButtonTitleStyle}
                  onPress={() => addFolder()}
                />
              </View>
            </Dialog>
            <View style={styles.mainContainer}>
              <View style={styles.container}>
                <FlatList
                  data={[...folders, ...images]}
                  renderItem={({item, index}) =>
                    index < folders.length ? (
                      <TouchableOpacity onPress={() => folderClicked(item)}>
                        <View style={styles.iconContainer}>
                          <Icon
                            name="folder"
                            type="entypo"
                            color="#517fa4"
                            size={100}
                          />
                          <Text>{item}</Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <Image
                        source={{uri: item.uri}}
                        style={styles.image}
                        height={item.height}
                        width={105}
                        onLoad={({
                          nativeEvent: {
                            source: {width, height},
                          },
                        }) =>
                          setImages(oldImages => {
                            const newImages = [...oldImages];
                            newImages[index - folders.length].height =
                              (height / width) * 105;
                            return newImages;
                          })
                        }
                      />
                    )
                  }
                  keyExtractor={item => (item.uri ? item.uri : item)}
                  numColumns={3}
                />
              </View>
            </View>
          </View>
        )}
      </SafeAreaProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: 375,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButtonContainer: {
    width: 35,
    paddingEnd: 5,
  },
  headerRightButtons: {
    flexDirection: 'row',
  },
  plainButton: {
    backgroundColor: null,
  },
  dialogueButtonTitleStyle: {
    color: 'black',
  },
  error: {
    color: 'red',
  },
  image: {
    margin: 10,
  },
  iconContainer: {
    alignItems: 'center',
    padding: 5,
    width: 125,
  },
  folderName: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  sendButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 1,
  },
  dialogueButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
});

export default Folders;
