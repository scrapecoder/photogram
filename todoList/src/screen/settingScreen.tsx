//import liraries
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useAppContext} from '../../context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Section = ({title, Left, onPress}: any) => {
  return (
    <TouchableOpacity {...{onPress}}>
      <View style={styles.section}>
        <Text style={styles.title}>{title}</Text>
        {Left && Left}
      </View>
    </TouchableOpacity>
  );
};
// create a component
const SettingScreen = () => {
  const StateContext = useAppContext();

  const logout = async (value: any) => {
    try {
      AsyncStorage.removeItem('userData').then(() => {
        StateContext?.updateUser({});
      });
    } catch (e) {
      console.error(e);

      // saving error
    }
  };
  return (
    <View style={styles.container}>
      <Section
        title="Logout"
        Left={<Text style={styles.title}>{`>`}</Text>}
        onPress={logout}
      />
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
    padding: 15,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 18,
  },
});

//make this component available to the app
export default SettingScreen;
