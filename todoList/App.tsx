//import liraries
import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
// import {RealmContext, Task} from './models/Task';

// const {useQuery, useRealm} = RealmContext;
// create a component
const App = () => {
  // const realm = useRealm();
  // const task = useQuery(Task);

  // useEffect(() => {
  //   realm.subscriptions.update(mutablesubs =>
  //     mutablesubs.add(realm.objects(Task)),
  //   );
  // }, [realm]);

  // console.log('app callig');

  return (
    <View style={styles.container}>
      <Text>App</Text>
    </View>
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
export default App;
