//import liraries
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useAppContext} from '../../context';

// create a component
const Home = () => {
  const [todoList, setTodolist] = useState<Array<any>>([]);
  const {navigate} = useNavigation<any>();
  const {user} = useAppContext();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const response = await fetch('http://localhost:3000/task/', {
          method: 'GET',
          headers: {
            Authorization: user.token,
          },
        });
        const responseData = await response.json();
        console.log('responseData=>', responseData);

        setTodolist(responseData);
      })();
    }, []),
  );

  const _renderItem = ({item}: any) => {
    return (
      <TouchableOpacity onPress={() => navigate('TaskDetail', {item})}>
        <View style={styles.section}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.des}>{item.description}</Text>
          {item?.taskImage && (
            <Image
              resizeMode="contain"
              source={{uri: `http://localhost:3000/${item.taskImage}`}}
              style={{height: 50, width: 100}}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={todoList}
        renderItem={_renderItem}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.fabBtn}>
        <TouchableOpacity
          onPress={() => navigate('AddTask')}
          style={styles.btn}>
          <Text style={styles.icon}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  title: {
    fontSize: 18,
    color: '#3d3d3d',
  },
  des: {
    fontSize: 14,
    color: '#3d3d3d',
  },
  fabBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  btn: {
    height: 50,
    width: 50,
    borderRadius: 30,
    backgroundColor: '#3d3d3d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: '#ffffff',
    fontSize: 22,
  },
});

//make this component available to the Home
export default Home;
