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

const Folders = ({route}) => {
  const [folder, setFolder] = useState(route.params.folder);
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const getItems = async () => {
    try {
      const response = await Storage.list(folder);
      const newFolders = {};
      const newImages = [];
      for (const result of response.results) {
        const key = result.key.substring(folder.length);
        if (key.search('/') === -1) {
          const signedURL = await createPresignedUrlWithClient({
            region: 'us-east-2',
            bucket: keys.bucket,
            key: 'public/' + folder + key,
          });
          newImages.push(signedURL);
        } else {
          newFolders[key.substring(0, key.search('/') + 1)] = true;
        }
      }
      setImages(newImages);
      setFolders(Object.keys(newFolders));
    } catch (err) {
      console.log('error: ' + err);
    }
  };

  useEffect(() => {
    getItems();
  }, [folder]);

  return (
    <SafeAreaView style={styles.topContainer}>
      <SafeAreaProvider>
        <View style={styles.container}>
          {folders.map(newFolder => (
            <TouchableOpacity
              onPress={() => {
                setFolder(folder + newFolder);
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
