//import liraries
import React, {useEffect} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {AppStoreProvider, useAppContext} from './context';
import {BeforeLogin, AppTabs} from './nav/photogram';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppAuthState = () => {
  const StoreContext = useAppContext();
  useEffect(() => {
    getData();
  }, []);

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

  const getFreshProfile = async (data: any) => {
    try {
      const response = await fetch(
        `http://localhost:3000/users/${data.detail._id}`,
        {
          method: 'GET',
          headers: {
            Authorization: data.token,
          },
        },
      );
      const responseData = await response.json();
      console.log('fresh responseData=>', responseData);
      if (responseData.error) {
        StoreContext?.updateUser({});
        storeData(null);
        return;
      }
      const completeData = {token: data.token, detail: responseData};

      StoreContext?.updateUser(completeData);
      storeData(completeData);
    } catch (e) {
      StoreContext?.updateUser({});
      storeData(null);
    }
  };
  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('userData');

      console.log('value=>', value);

      if (value !== null) {
        getFreshProfile(JSON.parse(value));
      }
    } catch (e) {
      // error reading value
    }
  };

  return (
    <NavigationContainer>
      {Object.keys(StoreContext?.user || {}).length ? (
        <AppTabs />
      ) : (
        <BeforeLogin />
      )}
    </NavigationContainer>
  );
};

// create a component
const App = () => {
  return (
    <AppStoreProvider>
      <SafeAreaView style={styles.container}>
        <AppAuthState />
      </SafeAreaView>
    </AppStoreProvider>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

//make this component available to the app
export default App;
