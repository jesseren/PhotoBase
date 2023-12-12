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

  const getCurFolderName = () => {
    const names = pathString.split('/');
    return names.length <= 1 ? 'root' : names[names.length - 2];
  };

  const changeFolder = async nextFolder => {
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
        newImages.push(image);
      }
    }
    setImages(newImages);
    setFolders(newFolders);
  };

  const createNewFolder = async () => {
    await Storage.put(pathString + newFolderName + '/');
    setFolders(oldFolders => {
      const newFolders = [...oldFolders];
      newFolders.push(newFolderName + '/');
      return newFolders;
    });
    setPath(oldPath => {
      const newPath = [...oldPath];
      newPath[newPath.length - 1][newFolderName + '/'] = {};
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
      changeFolder(main);
    } catch (err) {
      console.log(err);
    }
  };

  const goBack = () => {
    if (path.length <= 1) {
      navigation.navigate('Home');
    } else {
      changeFolder(path[path.length - 2]);
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
      if (cur === 0) {
        setPathString('');
      } else {
        setPathString(pathString.substring(0, cur + 1));
      }
    }
  };

  useEffect(() => {
    createFolderObject();
  }, []);

  return (
    <SafeAreaView style={styles.topContainer}>
      <SafeAreaProvider>
        <View style={styles.topButtonsContainer}>
          <Button
            containerStyle={styles.addContainer}
            buttonStyle={styles.addStyle}
            onPress={goBack}>
            <Icon name="arrow-back" type="ionicon" size={25} />
          </Button>
          <Text style={styles.folderName}>{getCurFolderName()}</Text>
          <Button
            title="Add"
            icon={{
              name: 'addfolder',
              type: 'ant-design',
              size: 15,
              color: '#517fa4',
            }}
            containerStyle={styles.addContainer}
            buttonStyle={styles.addStyle}
            titleStyle={styles.addTitleStyle}
            onPress={() => {
              setDisplayAddFolder(true);
            }}
          />
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
          <Button
            title="Add"
            containerStyle={styles.addContainer}
            buttonStyle={styles.addStyle}
            titleStyle={styles.addTitleStyle}
            onPress={() => addFolder()}
          />
        </Dialog>
        <View style={styles.mainContainer}>
          <View style={styles.container}>
            <FlatList
              data={[...folders, ...images]}
              renderItem={({item, index}) =>
                index < folders.length ? (
                  <TouchableOpacity
                    onPress={() => {
                      const nextFolder = path[path.length - 1][item];
                      setPathString(pathString + item);
                      changeFolder(nextFolder);
                      setPath(oldPath => {
                        const newPath = [...oldPath];
                        newPath.push(nextFolder);
                        return newPath;
                      });
                    }}>
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
                  <Image source={{uri: item}} style={styles.image} />
                )
              }
              keyExtractor={item => item}
              numColumns={3}
            />
          </View>
        </View>
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
  topButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addContainer: {
    width: 100,
  },
  addStyle: {
    backgroundColor: null,
  },
  addTitleStyle: {
    color: '#517fa4',
  },
  error: {
    color: 'red',
  },
  image: {
    height: 200,
    width: 105,
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
});

export default Folders;
