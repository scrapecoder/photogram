//import liraries
import {AppProvider, UserProvider} from '@realm/react';
import React from 'react';
import {StyleSheet} from 'react-native';
import RealmeWrapper from './RealmeWrapper';

// create a component
const AppRoot = () => {
  return (
    <AppProvider id="application-0-vegcz">
      <UserProvider fallback={<RealmeWrapper />}>
        <RealmeWrapper />
      </UserProvider>
    </AppProvider>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

//make this component available to the app
export default AppRoot;
