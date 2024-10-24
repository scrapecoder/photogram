//import liraries
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import {useAppContext} from '../../context';
import {CHAT} from '../constant/images';

// create a component
const CircleList = () => {
  const {navigate} = useNavigation<any>();
  const [circleList, setCircleList] = useState<any>([]);
  const [userData, setUserData] = useState<any>();

  const {
    user: {detail, token},
  } = useAppContext();

  const getProfile = async (id: string, mainReq = false) => {
    try {
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'GET',
        headers: {
          Authorization: token,
        },
      });
      const responseData = await response.json();

      if (mainReq) {
        setUserData(responseData);
      } else return responseData;
    } catch (err: any) {
      Alert.alert('', err.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    if (!userData) return;

    const {circle} = userData;

    if (circle?.length >= 0) {
      (async () => {
        const circleList = circle.filter((circle: any) => circle.status === 1);
        await Promise.all(
          circleList.map((user: any) => getProfile(user.user, false)),
        )
          .then(list => {
            if (list) {
              setCircleList(list.filter(item => item));
            }
          })
          .catch((err: any) => {
            console.log('err====>', err);
          });
      })();
    }
  }, [userData]);

  useFocusEffect(
    React.useCallback(() => {
      getProfile(detail._id, true);
    }, [detail]),
  );

  const removeCircle = async (user: any) => {
    try {
      const response = await fetch(
        'http://localhost:3000/users/requestAction',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({
            userId: detail._id,
            circleId: user._id,
            status: 0,
          }),
        },
      );
      const responseData = await response.json();

      setCircleList((list: any) =>
        list.filter((item: any) => {
          return item?._id !== user?._id;
        }),
      );
    } catch (err) {
      console.log('err=====>', err);
    }
  };

  const requestAction = async (followerId: string, status: number) => {
    const response = await fetch('http://localhost:3000/users/requestAction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({
        userId: detail?._id,
        followerId: followerId,
        status,
      }),
    });

    const responseData = await response.json();
    console.log('responseData=>', responseData);
  };

  const _renderUserCard = ({item, index}: any) => {
    return (
      <View
        style={[
          styles.row,
          {paddingHorizontal: 10, marginTop: index == 0 ? 10 : 20},
        ]}>
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
            <Text style={styles.commentText2}>{item?.email}</Text>
          </View>
          <View style={[styles.row, {marginTop: 0}]}>
            <TouchableOpacity
              onPress={() =>
                navigate('ChatStack', {
                  screen: 'ChatDetail',
                  params: {item},
                })
              }
              style={{marginHorizontal: 10}}>
              <Image source={CHAT} style={{width: 20, height: 20}} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => requestAction(item._id, -1)}>
              <View style={styles.followBtn}>
                <Text style={styles.followText}>Remove</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const ListHeader = () => {
    return (
      <View style={{marginVertical: 10, marginHorizontal: 10}}>
        <Text style={styles.commentText2}>{`Total Circle members - ${
          circleList?.length || 0
        }`}</Text>
      </View>
    );
  };

  const newRequest = userData?.circle?.filter(
    (circle: any) => circle.status == 0,
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.row,
          {
            marginTop: 0,
            backgroundColor: '#ffffff',
            padding: 5,
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        ]}>
        <View style={[styles.iconContainer, {opacity: 0}]}>
          <Text style={styles.iconSize}>+</Text>
        </View>
        <Text style={styles.headerText}>My Circle</Text>

        <TouchableOpacity
          onPress={() =>
            navigate('AddCircle', {
              item: circleList.filter((user: any) => user.status !== 1),
            })
          }>
          <View style={styles.iconContainer}>
            <Text style={styles.iconSize}>+</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.row,
          {
            justifyContent: 'space-between',
            marginTop: 10,
            marginHorizontal: 10,
          },
        ]}>
        <Text
          style={[
            styles.commentText2,
          ]}>{`New circle request - ${newRequest?.length}`}</Text>
        <TouchableOpacity
          onPress={() =>
            navigate('CircleRequest', {item: newRequest, allUser: userData})
          }>
          <Text>View all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={circleList}
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
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {fontSize: 20, color: '#3d3d3d'},
  iconContainer: {
    borderRadius: 20,
    borderWidth: 1,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSize: {
    fontSize: 18,
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
    backgroundColor: '#f54755',
  },
  followText: {
    color: '#ffffff',
  },
});

//make this component available to the app
export default CircleList;
