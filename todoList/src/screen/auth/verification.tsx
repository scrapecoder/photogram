//import liraries
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';

// create a component
const Verification = () => {
  const {data}: any = useRoute().params;
  const [otp, setOtp] = useState<string>();
  const {replace, popToTop} = useNavigation<any>();

  const submitRequest = async () => {
    const response: any = await fetch('http://localhost:3000/users/verifyOtp', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        userId: data.userId,
        otp,
      }),
    });

    console.log(data, {
      userId: data.userId,
      otp,
    });

    if (response.status === 200) {
      popToTop();
    } else Alert.alert('', 'Something went wrong');
  };
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter OTP"
        style={styles.input}
        onChangeText={text => setOtp(text)}
      />
      <TouchableOpacity onPress={submitRequest} style={styles.btn}>
        <Text style={styles.text}>{'Submit'}</Text>
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
export default Verification;
