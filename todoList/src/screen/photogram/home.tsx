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
  Dimensions,
} from 'react-native';
import {useAppContext} from '../../../context';
import PostCard from '../../component/postCard';

const {height} = Dimensions.get('screen');

// create a component
const Home = () => {
  const [todoList, setTodolist] = useState<Array<any>>([]);
  const {navigate} = useNavigation<any>();
  const {user} = useAppContext();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const response = await fetch('http://localhost:3000/post/circlePost', {
          method: 'GET',
          headers: {
            Authorization: user.token,
          },
        });
        const responseData = await response.json();
        console.log('responseData=>', responseData?.posts);

        setTodolist(responseData?.posts);
      })();
    }, []),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={todoList}
        renderItem={({item}) => <PostCard {...{item}} />}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.fabBtn}>
        <TouchableOpacity
          onPress={() => navigate('AddPhoto')}
          style={styles.btn}>
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  section: {
    marginTop: 15,
    // backgroundColor: '#ffffff',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.2,
    // shadowRadius: 1.41,

    // elevation: 2,
    height: height * 0.5,
    paddingBottom: 10,
  },
  title: {
    margin: 10,
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

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusIcon: {
    color: '#ffffff',
    fontSize: 20,
  },
  icon: {
    height: 22,
    width: 22,
  },
  bottom: {
    marginHorizontal: 10,
  },
  timeTxt: {
    marginTop: 10,
    fontSize: 16,
    color: '#3d3d3d',
  },
});

//make this component available to the Home
export default Home;
