//import liraries
import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useAppContext} from '../../context';

// create a component
const CircleRequest = () => {
  const {item, allUser} = useRoute<any>().params || [];
  const {user} = useAppContext();
  const [userData, setUserData] = useState<any>([]);

  const {
    user: {token},
  } = useAppContext();

  console.log('allUser===>', allUser, item);

  const getProfile = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'GET',
        headers: {
          Authorization: token,
        },
      });
      const responseData = await response.json();

      return responseData;
    } catch (err: any) {
      Alert.alert('', err.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    (async () => {
      const detail = await Promise.all(
        item.map((user: any) => getProfile(user.user)),
      );
      setUserData(detail);
    })();
  }, []);

  const ListHeader = () => {
    return (
      <View style={{marginVertical: 10, marginHorizontal: 10}}>
        <Text style={styles.commentText2}>{`Total Request - ${
          item?.length || 0
        }`}</Text>
      </View>
    );
  };

  console.log('item===>', item, user);

  const requestAction = async (followerId: string, status: number) => {
    const response = await fetch('http://localhost:3000/users/requestAction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: user.token,
      },
      body: JSON.stringify({
        userId: user?.detail?._id,
        followerId: followerId,
        status,
      }),
    });

    const responseData = await response.json();
    console.log('responseData=>', responseData);
  };

  const _renderUserCard = ({item}: any) => {
    return (
      <View style={styles.row}>
        <View style={styles.commentImage}>
          <Text style={styles.commentText2}>
            {item?.email?.substring(0, 2)}
          </Text>
        </View>
        <View
          style={[
            styles.row,
            {
              marginTop: 0,
              flex: 1,
              justifyContent: 'space-between',
            },
          ]}>
          <View style={styles.rightChild}>
            <Text style={styles.commentText2}>{item?.email}</Text>
          </View>
          <TouchableOpacity onPress={() => requestAction(item._id, -1)}>
            <View style={[styles.followBtn, {backgroundColor: '#f54755'}]}>
              <Text style={[styles.followText]}>Decline</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => requestAction(item._id, 1)}>
            <View style={styles.followBtn}>
              <Text style={styles.followText}>Accept</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={userData}
        renderItem={_renderUserCard}
        ListHeaderComponent={<ListHeader />}
        keyExtractor={item => item?._id}
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
  textRow: {
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentImage: {
    height: 40,
    width: 40,
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentText2: {
    lineHeight: 20,
    marginHorizontal: 5,
    fontSize: 14,
    color: '#3d3d3d',
  },
  row: {
    marginHorizontal: 10,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  rightChild: {},
  followBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#20aafa',
  },
  followText: {
    color: '#ffffff',
  },
});

//make this component available to the app
export default CircleRequest;
