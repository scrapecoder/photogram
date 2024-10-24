//import liraries
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {useAppContext} from '../../context';
import {useNavigation} from '@react-navigation/native';

// create a component
const ChatScreen = () => {
  const {
    user: {detail, token},
  } = useAppContext();
  const {navigate} = useNavigation<any>();

  const [chats, setChats] = useState<any>([]);

  const getProfile = async (id: string) => {
    console.log('id=>', id);

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
      try {
        const response = await fetch(
          `http://localhost:3000/chat/${detail._id}`,
          {
            method: 'GET',
            headers: {
              Authorization: token,
            },
          },
        );

        const responseData = await response.json();

        setChats(responseData.data);
      } catch (err) {}
    })();
  }, []);

  const ChatCard = ({item}: any) => {
    const [profile, setProfile] = useState<any>(null);
    useEffect(() => {
      (async () => {
        const unmatchedElementId = item.participants.filter(
          (id: any) => ![detail._id].includes(id),
        )?.[0];

        const profile = await getProfile(unmatchedElementId);
        setProfile(profile);
      })();
    }, [item]);

    return (
      <TouchableOpacity
        onPress={() =>
          navigate('ChatDetail', {item: profile, chatId: item._id})
        }>
        <View style={styles.row}>
          <View style={styles.commentImage}>
            <Text style={styles.commentText2}>
              {profile?.email?.substring(0, 2)}
            </Text>
          </View>
          <View>
            <Text style={styles.name}>{profile?.email}</Text>
            <Text style={styles.msg}>
              {item?.messages?.msg || 'Tap to chat'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={({item}: any) => <ChatCard {...{item}} />}
        keyExtractor={item => item._id}
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
    marginTop: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  msg: {
    marginHorizontal: 10,
    fontSize: 14,
  },
});

//make this component available to the app
export default ChatScreen;
