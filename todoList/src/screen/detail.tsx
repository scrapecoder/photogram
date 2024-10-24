//import liraries
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {Component} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useAppContext} from '../../context';

// create a component
const TaskDetail = () => {
  const {item} = useRoute<any>().params;
  const {user} = useAppContext();
  const {goBack, navigate} = useNavigation<any>();

  const deleteAction = async () => {
    const response = await fetch(`http://localhost:3000/task/${item._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: user.token,
      },
    });
    const responseData = await response.json();
    if (response.status === 200) {
      goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{item.title}</Text>
      <Text style={styles.text}>{item.description}</Text>
      {item.taskImage && (
        <Image
          resizeMode="contain"
          source={{uri: `http://localhost:3000/${item.taskImage}`}}
          style={{height: 50, marginTop: 20, width: 100}}
        />
      )}

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => navigate('AddTask', {item})}
          style={styles.btn}>
          <Text style={{color: '#FFFFFF'}}>EDIT</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={deleteAction} style={styles.btn}>
          <Text style={{color: '#FFFFFF'}}>DELETE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  text: {
    lineHeight: 25,
    fontSize: 18,
    color: '#3d3d3d',
  },
  row: {
    marginVertical: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  btn: {
    backgroundColor: '#3d3d3d',
    width: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
});

//make this component available to the app
export default TaskDetail;
