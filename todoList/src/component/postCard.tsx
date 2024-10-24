//import liraries
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  SafeAreaView,
  TextInput,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {CHAT, LIKED, UN_LIKED} from '../constant/images';
import {useAppContext} from '../../context';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {height} = Dimensions.get('screen');

type commentsheetType = {
  visible: boolean;
  setVisible: Function;
  postId: string;
};

function calculateTimeDifference(createdTime: string): string {
  const momentNow = moment();
  const momentCreatedTime = moment(createdTime);

  const diffYears = momentNow.diff(momentCreatedTime, 'years');
  const diffMonths = momentNow.diff(momentCreatedTime, 'months');
  const diffDays = momentNow.diff(momentCreatedTime, 'days');
  const diffHours = momentNow.diff(momentCreatedTime, 'hours');
  const diffMinutes = momentNow.diff(momentCreatedTime, 'minutes');

  if (diffYears > 0) {
    return `${diffYears} yr${diffYears > 1 ? 's' : ''}`;
  } else if (diffMonths > 0) {
    return `${Math.floor(diffMonths / 7)} week${diffMonths > 1 ? 's' : ''}`;
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hr${diffHours > 1 ? 's' : ''}`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''}`;
  } else {
    return 'Just now';
  }
}

const CommentSheet = ({visible, postId, setVisible}: commentsheetType) => {
  const [comment, setComment] = useState<string>();
  const [comments, setComments] = useState<any>([]);
  const {user} = useAppContext();
  const inputRef = useRef<any>();
  const insets = useSafeAreaInsets();
  const [replyId, setFocusReplyId] = useState<string>('');
  useEffect(() => {
    if (visible) {
      getComments();
    }
  }, [visible]);

  const getComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/post/comment/${postId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: user.token,
          },
        },
      );

      const responseData = await response.json();
      setComments(responseData);
    } catch (err) {
      console.log('err===>', err);
    }
  };

  const addComment = async () => {
    try {
      const response = await fetch('http://localhost:3000/post/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user.token,
        },
        body: JSON.stringify({
          postId,
          comment: comment,
          parentCommentId: replyId,
        }),
      });

      const responseData = await response.json();

      console.log('responseData====>', responseData);
    } catch (err) {
      console.log('err===>', err);
    }
  };

  console.log('comments====>', comments);

  const CommentContainer = ({item, style = {}, replyStyle = {}}: any) => {
    const [visible, setVisible] = useState<boolean>(false);
    console.log('item=>', item);

    return (
      <>
        <View style={[styles.commentContainer, style]}>
          <View style={styles.commentImage}>
            <Text style={styles.commentText2}>
              {item.user?.email?.substring(0, 2)}
            </Text>
          </View>
          <View>
            <View style={styles.textRow}>
              <Text style={styles.commentText2}>{item.user?.email}</Text>
              <Text style={styles.commentText2}>
                {item.createdAt ? calculateTimeDifference(item.createdAt) : ''}
              </Text>
            </View>
            <Text style={styles.commentText}>{item.text}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            setFocusReplyId(item._id);
            setComment(`@${item.user?.email} `);
            inputRef.current?.focus();
          }}>
          <Text style={[styles.replyTxt, replyStyle]}>{'Reply'}</Text>
        </TouchableOpacity>
        {item.replies.length > 0 && (
          <TouchableOpacity
            style={{marginLeft: 10, marginVertical: 10}}
            onPress={() => setVisible(!visible)}>
            <Text style={styles.replyTxt}>{`${
              visible ? 'Hide' : `View`
            } all replies`}</Text>
          </TouchableOpacity>
        )}
        {visible &&
          item.replies.map((item: any) => (
            <CommentContainer
              {...{item}}
              style={{marginTop: 0, marginHorizontal: 40}}
              replyStyle={{marginHorizontal: 90}}
            />
          ))}
      </>
    );
  };

  return (
    <Modal
      animationType="slide"
      onDismiss={() => setVisible(false)}
      visible={visible}>
      <SafeAreaView style={{flex: 1}}>
        <KeyboardAvoidingView
          style={StyleSheet.compose(styles.container2, {
            marginBottom: insets.bottom,
          })}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          enabled={true}
          set={insets.bottom}>
          <View style={styles.container}>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text>Close</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={{flex: 1}}>
              <View style={{flex: 1}}>
                {comments?.map?.((item: any, index: number) => {
                  console.log('item=>', item.replies);

                  return (
                    <>
                      <CommentContainer {...{item}} />
                    </>
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.inpuContainer}>
              <TextInput
                ref={inputRef}
                placeholder="Add comment"
                style={styles.input}
                value={comment}
                onChangeText={text => setComment(text)}
              />

              <TouchableOpacity onPress={addComment} disabled={!comment}>
                <Text style={{opacity: comment ? 1 : 0}}>{`Send`}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};
// create a component
const PostCard = ({item}: any) => {
  const [visible, setVisible] = useState<boolean>(false);
  const {user} = useAppContext();
  const [postLike, setPostLike] = useState(false);

  useEffect(() => {
    if (item.likedBy.includes(user.detail._id)) {
      setPostLike(true);
    }
  }, [item]);

  const likePost = async (id: string) => {
    const response = await fetch(`http://localhost:3000/post/${id}/like`, {
      method: 'PATCH',
      headers: {
        Authorization: user.token,
      },
    });
    const responseData = await response.json();
    if (response.status === 200) {
      setPostLike(!postLike);
    }
  };

  return (
    <>
      <View style={[styles.commentContainer, {paddingHorizontal: 10}]}>
        <View style={styles.commentImage}>
          <Text style={styles.commentText2}>
            {item.createdBy?.email?.substring(0, 2)}
          </Text>
        </View>
        <View>
          <View style={styles.textRow}>
            <Text style={styles.commentText2}>{item.createdBy?.email}</Text>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <View style={{flex: 1}}>
          <Image
            resizeMode="cover"
            source={{uri: `http://localhost:3000/${item.postImage}`}}
            style={StyleSheet.absoluteFill}
          />
        </View>
        <Text style={styles.title}>{item.postCaption}</Text>
        {item.likedBy.length > 0 && (
          <Text
            style={[
              styles.timeTxt,
              {marginHorizontal: 10, marginTop: 0, marginVertical: 5},
            ]}>
            {`${item.likedBy.length} ${
              item.likedBy.length > 1 ? 'likes' : 'like'
            }`}
          </Text>
        )}
        <View style={styles.bottom}>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => likePost(item._id)}>
              <Image style={styles.icon} source={postLike ? LIKED : UN_LIKED} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setVisible(true)}
              style={{marginLeft: 20}}>
              <Image style={styles.icon} source={CHAT} />
            </TouchableOpacity>
          </View>
          <Text
            style={[
              item.commentedBy.length ? styles.timeTxt : {height: 0},
            ]}>{`${
            item.commentedBy.length > 0 ? 'View all comments' : ''
          }`}</Text>
          <Text style={styles.timeTxt}>
            {`${calculateTimeDifference(item.createdAt)} ago`}
          </Text>
        </View>
      </View>
      {<CommentSheet postId={item._id} {...{visible}} {...{setVisible}} />}
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {flex: 1, padding: 10},
  container2: {flex: 1},
  section: {
    marginTop: 15,
    height: height * 0.6,
    paddingBottom: 10,
  },
  title: {
    marginHorizontal: 10,
    marginTop: 5,
    fontSize: 18,
    color: '#3d3d3d',
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
    marginTop: 5,
    marginHorizontal: 10,
  },
  timeTxt: {
    marginTop: 5,
    fontSize: 14,
    color: '#3d3d3d',
  },
  inpuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
    height: 40,
  },
  input: {
    flex: 1,
    height: 40,
  },
  commentContainer: {
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
  commentText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#3d3d3d',
  },
  replyTxt: {
    marginHorizontal: 50,
    fontSize: 12,
    color: '#3d3d3d',
    fontWeight: '500',
  },
  commentText2: {
    lineHeight: 20,
    marginHorizontal: 5,
    fontSize: 12,
    color: '#3d3d3d',
  },
});

//make this component available to the app
export default PostCard;
