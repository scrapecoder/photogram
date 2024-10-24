//import liraries
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import {useAppContext} from '../../../context';

type tagType = {
  userId: string;
  userName: string;
};

type postType = {
  photoImage: string;
  caption: string;
  tag: Array<tagType>;
};
// create a component
const AddPhoto = () => {
  const [newPost, setnewPost] = useState<postType>({
    photoImage: '',
    caption: '',
    tag: [],
  });
  const {user} = useAppContext();
  const {item} = useRoute<any>().params || {item: null};

  const {goBack} = useNavigation();

  const [selectedImage, setSelectedImage] = useState<any>();

  const handleLaunchImageLibrary = () => {
    launchImageLibrary(
      {mediaType: 'photo', quality: 0.5},
      handleImagePickerResponse,
    );
  };

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    const {assets} = response;

    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
    } else if (assets?.[0].fileName) {
      // Convert selected image to FormData

      const data = {
        uri: assets?.[0]?.uri,
        type: assets?.[0]?.type || 'image/jpeg',
        name: assets?.[0]?.fileName || `image_${Date.now()}.jpg`,
      };

      setSelectedImage(data);
      // Now you can use formData for further processing, like uploading to a server
    }
  };

  console.log('', user);

  const addPhoto = async () => {
    const formData = new FormData();
    formData.append('postCaption', newPost.caption);
    formData.append('postImage', selectedImage);
    formData.append('createdBy', user.detail._id);
    const url = 'http://localhost:3000/post';
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: user.token,
      },
      body: formData,
    })
      .then(async data => {
        console.log('formData=>', formData);
        const responseData = await data.json();
        if (data.status === 200) {
          Alert.alert('', 'Post Added', [
            {
              text: 'ok',
              onPress: () => goBack(),
            },
          ]);
        } else {
          Alert.alert('', responseData?.error || 'Something went wrong');
        }
      })
      .catch(err => {
        console.log('err=>', err);
      });
  };

  console.log('selectedImage=>', selectedImage);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.frameContainer]}
        onPress={handleLaunchImageLibrary}>
        <View style={styles.center}>
          {selectedImage ? (
            <View>
              <Image
                resizeMode="cover"
                source={{uri: selectedImage.uri}}
                style={{height: 198, width: 200}}
              />
            </View>
          ) : (
            <>
              <Text style={styles.text}>{`+`}</Text>
              <Text style={styles.text}>{`Upload Image`}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      <TextInput
        placeholder="Caption"
        multiline
        value={newPost.caption}
        textAlignVertical="top"
        onChangeText={text =>
          setnewPost({
            ...newPost,
            caption: text,
          })
        }
        style={[styles.input, {height: 80}]}
      />

      <TouchableOpacity onPress={addPhoto} style={styles.btn}>
        <Text style={[styles.text, {color: '#ffffff'}]}>Upload</Text>
      </TouchableOpacity>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    marginTop: 20,
    borderBottomWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  btn: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'blue',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  text: {
    color: '#3d3d3d',
    fontSize: 18,
  },
  frameContainer: {
    height: 200,
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

//make this component available to the app
export default AddPhoto;
