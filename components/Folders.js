import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Amplify, Storage} from 'aws-amplify';
import {GetObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {fromCognitoIdentityPool} from '@aws-sdk/credential-providers';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import keys from '../keys';
import {Icon} from '@rneui/themed';

Amplify.configure({
  Auth: {
    identityPoolId: keys.identityPoolId, //REQUIRED - Amazon Cognito Identity Pool ID
    region: 'us-east-2', // REQUIRED - Amazon Cognito Region
  },
});

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

const Folders = () => {
  const [path, setPath] = useState([]);
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);

  const changeFolder = nextFolder => {
    const newFolders = [];
    const newImages = [];
    for (const key in nextFolder) {
      if (key.search('/') !== -1) {
        newFolders.push(key);
      } else {
        newImages.push(nextFolder[key]);
      }
    }
    setImages(newImages);
    setFolders(newFolders);
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
          cur[split[split.length - 1]] = await createPresignedUrlWithClient({
            region: 'us-east-2',
            bucket: keys.bucket,
            key: 'public/' + result.key,
          });
        }
      }
      setPath([main]);
      changeFolder(main);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    createFolderObject();
  }, []);

  return (
    <SafeAreaView style={styles.topContainer}>
      <SafeAreaProvider>
        <View style={styles.container}>
          {folders.map(newFolder => (
            <TouchableOpacity
              onPress={() => {
                setPath(oldPath => {
                  const newPath = [...oldPath];
                  const nextFolder = newPath[newPath.length - 1][newFolder];
                  newPath.push(nextFolder);
                  changeFolder(nextFolder);
                  return newPath;
                });
              }}
              key={newFolder}>
              <View style={styles.iconContainer}>
                <Icon name="folder" type="entypo" color="#517fa4" size={100} />
                <Text>{newFolder}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={styles.container}>
            {images.map(image => (
              <Image source={{uri: image}} style={styles.image} key={image} />
            ))}
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
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  image: {
    height: 200,
    width: 100,
    margin: 10,
  },
  iconContainer: {
    alignItems: 'center',
    padding: 25,
  },
});

export default Folders;
