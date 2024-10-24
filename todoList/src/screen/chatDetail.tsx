import {useRoute} from '@react-navigation/native';
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {Socket} from 'socket.io-client'; // Import Socket type from socket.io-client
import io from 'socket.io-client';
import {useAppContext} from '../../context';
import moment from 'moment';

const SERVER_IP = 'localhost'; // Replace with your server's IP address

type MessageType = {
  msg: string;
  from: string;
  to: string;
  _id?: string;
  timestamp?: Date;
};
const ChatDetail: React.FC = () => {
  const {item, chatId} = useRoute<any>().params;
  const [socket, setSocket] = useState<Socket | null>(null);
  const {user} = useAppContext();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const socketConnection = io(`http://${SERVER_IP}:3000`);
    setSocket(socketConnection);

    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (chatId) {
        try {
          const response = await fetch(
            `http://localhost:3000/chat/getUserChat/${chatId}`,
            {
              method: 'GET',
              headers: {
                Authorization: user.token,
              },
            },
          );

          const responseData = await response.json();
          setMessages(responseData.data.messages);
        } catch (err) {}
      }
    })();
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        console.log('scrolbottom');

        scrollRef.current.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (socket) {
      // client-side
      socket.on('connect', () => {
        console.log(socket.id); // x8WIv7-mJelg7on_ALbx
      });

      socket.emit('add-user', item._id);

      socket.on('disconnect', () => {
        console.log(socket.id); // undefined
      });

      socket.on('msg-recieve', (msg: any) => {
        const obj = {
          msg: msg.msg,
          to: msg.to,
          from: msg.from,
        };

        setMessages((prev: MessageType[]) => [...prev, obj]);
      });
    }
  }, [socket]);

  const sendMessage = () => {
    if (socket && messageInput.trim() !== '') {
      const obj = {
        msg: messageInput.trim(),
        to: item._id,
        from: user.detail._id,
      };
      socket.emit('chat_message', obj);

      setMessages((prev: MessageType[]) => [...prev, obj]);
      setMessageInput('');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={{
          flex: 1,
          width: '100%',
          paddingHorizontal: 10,
        }}
        contentContainerStyle={{paddingBottom: 20}}>
        {messages.map((msg: MessageType, index) => {
          console.log('msg=>', msg);

          return (
            <View
              key={msg._id}
              style={[
                {
                  width: '48%',
                  marginTop: index === 0 ? 5 : 10,
                },
                msg.from === user.detail._id
                  ? styles.rightBubble
                  : styles.leftBubble,
              ]}>
              <View>
                <Text style={styles.text}>{msg.msg}</Text>
                <Text style={styles.time}>
                  {msg?.timestamp && moment(msg.timestamp).format('hh:mm a')}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          margin: 20,
          alignItems: 'center',
        }}>
        <TextInput
          style={styles.textInput}
          onChangeText={setMessageInput}
          value={messageInput}
          placeholder="Type your message"
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  leftBubble: {
    backgroundColor: '#8905f5',
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 20,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  rightBubble: {
    backgroundColor: '#8905f5',
    borderBottomEndRadius: 20,
    borderTopStartRadius: 10,
    borderBottomStartRadius: 10,
    alignSelf: 'flex-end',
    padding: 10,
  },
  text: {
    color: '#ffffff',
    fontSize: 18,
  },
  time: {
    color: '#c2c0c0',
    fontSize: 14,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
  },
});

export default ChatDetail;
