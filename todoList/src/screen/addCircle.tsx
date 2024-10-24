//import liraries
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useAppContext} from '../../context';
import {useRoute} from '@react-navigation/native';

// create a component
const AddCircle = () => {
  const {user} = useAppContext();
  const {item} = useRoute<any>().params;
  const [users, setUsers] = useState<any>([]);
  const [circleList, setCircleList] = useState<any>([]);

  useEffect(() => {
    if (item.length) {
      setCircleList(item.map((user: any) => user._id));
    }
  }, [item]);

  useEffect(() => {
    getAllMembers();
  }, []);
  const getAllMembers = async () => {
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'GET',
        headers: {
          Authorization: user.token,
        },
      });
      const responseData = await response.json();

      setUsers(responseData);
    } catch (err: any) {
      Alert.alert('', err.message || 'Something went wrong');
    }
  };

  const requestAction = async (followerId: string, status: number) => {
    const response = await fetch('http://localhost:3000/users/requestAction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: user.token,
      },
      body: JSON.stringify({
        userId: user.detail?._id,
        followerId: followerId,
        status,
      }),
    });

    const responseData = await response.json();
    console.log('responseData=>', responseData);
  };

  const addMyCircle = async (item: any) => {
    try {
      const response = await fetch('http://localhost:3000/users/addCircle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user.token,
        },
        body: JSON.stringify({
          userId: user.detail._id,
          circleId: item._id,
        }),
      });
      const responseData = await response.json();
      if (responseData.message == 'Unfollowed successfully') {
        const filterData = circleList.filter((user: any) => user !== item._id);

        setCircleList(filterData);
      } else if (responseData.message == 'Followed successfully') {
        const arr: any = [...circleList];
        arr.push(item._id);

        setCircleList(arr);
      }
    } catch (err) {
      console.log('err=====>', err);
    }
  };

  const _renderUserCard = ({item}: any) => {
    const isFollowed = circleList?.includes(item._id);
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
            {marginTop: 0, flex: 1, justifyContent: 'space-between'},
          ]}>
          <View style={styles.rightChild}>
            <Text style={styles.commentText2}>{item.email}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              isFollowed ? requestAction(item._id, -1) : addMyCircle(item)
            }>
            <View
              style={[
                styles.followBtn,
                isFollowed && {backgroundColor: '#f54755'},
              ]}>
              <Text style={styles.followText}>
                {isFollowed ? 'Remove' : 'Follow'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={_renderUserCard}
        keyExtractor={item => item._id}
      />
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    marginHorizontal: 10,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
  rightChild: {
    marginHorizontal: 10,
  },
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
export default AddCircle;
