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
} from 'react-native';
import {
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import {useAppContext} from '../../context';

// create a component
const AddTask = () => {
  const [newTask, setNewTask] = useState<any>({
    title: '',
    des: '',
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

  useEffect(() => {
    if (item) {
      setNewTask({
        title: item.title,
        des: item.description,
      });
      console.log('item=>', item);
    }
  }, [item]);

  console.log('task===>', newTask);

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

  const addTask = async () => {
    const formData = new FormData();

    selectedImage && formData.append('taskImage', selectedImage);
    formData.append('title', newTask.title);
    formData.append('description', newTask.des);
    const url = item
      ? `http://localhost:3000/task/${item._id}`
      : 'http://localhost:3000/task';
    await fetch(url, {
      method: item ? 'PATCH' : 'POST',
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
          Alert.alert('', 'Task Added', [
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
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.btn,
          {
            borderWidth: 1,
            borderStyle: 'dashed',
            backgroundColor: 'transparent',
          },
        ]}
        onPress={handleLaunchImageLibrary}>
        <Text>Upload Image</Text>
      </TouchableOpacity>
      <TextInput
        placeholder="Title"
        style={styles.input}
        value={newTask.title}
        onChangeText={text =>
          setNewTask({
            ...newTask,
            title: text,
          })
        }
      />
      <TextInput
        placeholder="Description"
        multiline
        value={newTask.des}
        textAlignVertical="top"
        onChangeText={text =>
          setNewTask({
            ...newTask,
            des: text,
          })
        }
        style={[styles.input, {height: 100}]}
      />

      <Text
        style={[styles.text, {lineHeight: 30, fontSize: 12, color: '#3d3d3d'}]}>
        {selectedImage?.name}
      </Text>
      <TouchableOpacity onPress={addTask} style={styles.btn}>
        <Text style={styles.text}>Add Task</Text>
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
    borderWidth: 1,
    borderRadius: 5,
    height: 40,
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
    color: '#ffffff',
    fontSize: 20,
  },
});

//make this component available to the app
export default AddTask;
