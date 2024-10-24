//import liraries
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useAppContext} from '../../../context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// create a component
const Login = () => {
  const {params} = useRoute();

  const StateContext = useAppContext();
  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const {navigate, goBack} = useNavigation<any>();

  const login = async () => {
    const response = await fetch('http://localhost:3000/users/login', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(user),
    });
    const responseData = await response.json();
    console.log('responseData=>', responseData.data);

    if (response.status === 200) {
      StateContext?.updateUser(responseData.data);
      storeData(responseData.data);
    } else if (response.status === 409) Alert.alert('', responseData.error);
    else Alert.alert('', 'Something went wrong');
  };

  const storeData = async (value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      console.log('jsonValue=>', jsonValue);

      await AsyncStorage.setItem('userData', jsonValue);
    } catch (e) {
      console.error(e);

      // saving error
    }
  };

  const register = async () => {
    try {
      const response: any = await fetch('http://localhost:3000/users/signup', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(user),
      });

      const responseData = await response.json();

      if (response.status === 200) {
        navigate('Verify', {data: responseData?.data});
      } else if (response.status === 409) Alert.alert('', responseData.error);
      else Alert.alert('', responseData.error || 'Something went wrong');
    } catch (err: any) {
      Alert.alert('', err.message || 'Something went wrong');
    }
  };

  const submitRequest = () => {
    if (!user.email || !user.password) {
      Alert.alert('', 'All fileds are required.');
      return;
    }

    params ? register() : login();
  };
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter Email"
        style={styles.input}
        onChangeText={text =>
          setUser({
            ...user,
            email: text,
          })
        }
      />
      <TextInput
        placeholder="Enter Password"
        style={styles.input}
        onChangeText={text =>
          setUser({
            ...user,
            password: text,
          })
        }
      />

      <View>
        {!params && (
          <TouchableOpacity onPress={() => navigate('Register', {type: 1})}>
            <Text style={[styles.text2]}>{'Register'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={submitRequest} style={styles.btn}>
        <Text style={styles.text}>{params ? 'Register' : `Login`}</Text>
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
  text2: {
    alignSelf: 'flex-end',
    margin: 5,
    color: '#3d3d3d',
    fontSize: 12,
  },
});

//make this component available to the app
export default Login;
