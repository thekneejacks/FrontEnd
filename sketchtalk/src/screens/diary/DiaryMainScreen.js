import React, {useEffect, useState} from 'react';
import {
  ImageBackground,
  Dimensions,
  Text,
  Pressable,
  View,
  TextInput,
  FlatList,
} from 'react-native';
import colors from '../../constants/colors';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Loader from 'react-native-three-dots-loader';
import ConfirmButton from '../../components/confirmbutton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
//stt tts
import {initializeAudio, stopAudio} from './api/DiarySTT';
import {synthesizeSpeech} from './api/DiaryTTS';
//api
import axios from 'axios';
import {useMutation} from '@tanstack/react-query';

const {width, height} = Dimensions.get('window');
const dummyData = []; //list of messages
const initText = '안녕! 오늘은 어떤 일이 있었는지 이야기 해볼까?';

export default function DiaryMainScreen() {
  const navigation = useNavigation();

  function TempNavigate() {
    navigation.navigate('DiaryConfirmTextScreen', {
      voice: useDiaryChatFetch.data.data.data.voice,
    });
  }

  const [userDialog, setUserDialog] = useState('');
  const [voice, setVoice] = useState('');
  const [isWaitingReply, setIsWaitingReply] = useState(false);
  const [isSufficient, setIsSufficient] = useState(false);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    //AddMessage(initdata.data.reply, true);
    dummyData.length = 0; //clear array
    setIsWaitingReply(false);
    useGetVoiceFetch.mutate();
  }, []);

  function AddFetchedMessage(dialog, voice) {
    dummyData.shift();
    const messageArraySize = dummyData.length;
    dummyData.unshift({
      id: messageArraySize,
      isAI: true,
      isWaitingReply: false,
      text: dialog,
    });
    if (voice !== undefined) synthesizeSpeech(dialog, voice);
  }

  function AddWaitingMessage() {
    const messageArraySize = dummyData.length;
    dummyData.unshift({
      id: messageArraySize,
      isAI: true,
      isWaitingReply: true,
      text: 'waiting...',
    });
  }

  function AddUserMessage(dialog) {
    const messageArraySize = dummyData.length;
    dummyData.unshift({
      id: messageArraySize,
      isAI: false,
      isWaitingReply: false,
      text: dialog,
    });
  }

  //채팅
  const ls = require('local-storage');
  const useDiaryChatFetch = useMutation({
    mutationFn: newTodo => {
      const token = ls('token');
      return axios.post('https://sketch-talk.com/chat', newTodo, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onMutate: () => {
      setIsWaitingReply(true);
      setUserDialog('');
      AddWaitingMessage();
    },
    onSuccess: data => {
      console.log(data.data.data);
      AddFetchedMessage(data.data.data.reply, voice);
      if (data.data.data.isSufficient) {
        setIsSufficient(true);
      }
      setIsWaitingReply(false);
    },
    onError: error => {
      console.warn('useDiaryChatFetch ' + error.message);
      AddFetchedMessage(error.message);
      setIsWaitingReply(false);
    },
  });

  //목소리 받기
  const useGetVoiceFetch = useMutation({
    mutationFn: () => {
      const token = ls('token');
      return axios.get('https://sketch-talk.com/setting/tts', {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: data => {
      if (data.data.data.voiceType === 'KO_KR_SEOHYEON_NEURAL') {
        setVoice('ko-KR-SeoHyeonNeural');
        AddFetchedMessage(initText, 'ko-KR-SeoHyeonNeural');
      } else if (data.data.data.voiceType === 'KO_KR_GOOKMIN_NEURAL') {
        setVoice('ko-KR-GookMinNeural');
        AddFetchedMessage(initText, 'ko-KR-GookMinNeural');
      } else if (data.data.data.voiceType === 'KO_KR_SUNHI_NEURAL') {
        setVoice('ko-KR-SunHiNeural');
        AddFetchedMessage(initText, 'ko-KR-SunHiNeural');
      } else {
        setVoice('ko-KR-SeoHyeonNeural');
        AddFetchedMessage(initText, 'ko-KR-SeoHyeonNeural');
      }
    },
    onError: error => {
      console.warn('useGetVoiceFetch ' + error.message);
    },
  });

  function FetchMessage(userDialog) {
    if (userDialog === undefined || userDialog === '' || isWaitingReply) return;
    useDiaryChatFetch.mutate({dialog: userDialog});
    AddUserMessage(userDialog, false);
    //the rest is handled by useDiaryChatFetch
  }

  async function STT(resultText) {
    console.log('got this: ' + resultText);
    resultText = resultText.replace('?', '.');
    FetchMessage(resultText);
  }

  return (
    <ImageBackground
      style={{
        flex: 1,
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      source={require('../../assets/background/yellow_bg.png')}
      resizeMode="cover">
      <CharacterImage />

      <MessageList
        data={dummyData}
        renderItem={({item}) => MessageItem({item})}
        keyExtractor={item => item.id}
      />
      {!isSufficient ? (
        <MicButton
          onPressIn={() => initializeAudio(STT)}
          onPress={() => stopAudio()}
          //onPress={TempNavigate}
          isWaitingReply={isWaitingReply}
          isSufficient={isSufficient}
          useDiaryChatFetch_isPending={useDiaryChatFetch.isPending}
          //onPress={() => synthesizeSpeech('안녕?', 'ko-KR-SeoHyeonNeural')}
        />
      ) : (
        <View style={{flex: 1.5}}>
          <ConfirmButton
            color={colors.primary}
            text="일기 생성"
            width={200}
            onPress={TempNavigate}
          />
        </View>
      )}
      <TextBar
        onPress={() => FetchMessage(userDialog)}
        value={isWaitingReply || isSufficient ? '' : userDialog}
        onChangeText={!isWaitingReply && !isSufficient && setUserDialog}
        isWaitingReply={isWaitingReply}
        isSufficient={isSufficient}
      />
    </ImageBackground>
  );
}

const CharacterImage = () => (
  <View
    style={{
      flex: 5,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Image source={require('../../assets/character/bear.png')} />
  </View>
);

const MessageList = props => (
  <View
    style={{
      flex: 5,
      width: width,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <FlatList
      style={{flex: 1, width: width}}
      data={props.data}
      contentContainerStyle={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
      renderItem={props.renderItem}
      keyExtractor={props.keyExtractor}
      inverted={true}
      fadingEdgeLength={100}
    />
  </View>
);

const MicButton = props => (
  <View
    style={{
      flex: 1.5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
    }}>
    <Pressable
      onPress={props.onPress}
      onPressIn={props.onPressIn}
      disabled={props.isWaitingReply || props.isSufficient}
      //disabled={props.useDiaryChatFetch_isPending}
      style={{
        borderRadius: Math.round(158) / 2,
        width: 79,
        height: 79,
        backgroundColor: '#F6BC65',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
      }}>
      {({pressed}) => (
        <SimpleLineIcons
          name="microphone"
          size={33}
          color={pressed ? '#FF6947' : colors.white}
        />
      )}
    </Pressable>
  </View>
);

const TextBar = props => (
  <View
    style={{
      flex: 1,
      width: width * 0.9,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
    }}>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.creamWhite,
        borderRadius: 32,
        height: 46,
        elevation: 1,
      }}>
      {/*{!props.useDiaryChatFetch_isPending ? (*/}
      {!props.isWaitingReply && !props.isSufficient ? (
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          style={{
            flex: 6,
            textAlign: 'left',
            color: colors.black,
            paddingLeft: 12,
            fontSize: 16,
            height: 46,
            paddingBottom: 12,
          }}
        />
      ) : (
        <View
          style={{
            flex: 6,
            color: colors.black,
            paddingLeft: 12,
            height: 46,
            paddingBottom: 12,
          }}
        />
      )}
      <Pressable
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        disabled={props.isWaitingReply || props.isSufficient}
        onPress={props.onPress}>
        <SimpleLineIcons name="arrow-up-circle" size={25} color="red" />
      </Pressable>
    </View>
  </View>
);

function MessageItem({item}) {
  return item.isAI ? (
    <View
      style={{
        alignItems: 'flex-start',
        width: width * 0.9,
        marginBottom: 10,
        paddingRight: 65,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
      }}>
      <View
        style={{
          backgroundColor: colors.creamWhite,
          paddingVertical: 7,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderBottomRightRadius: 18,
          elevation: 1,
        }}>
        {item.isWaitingReply ? (
          <View
            style={{
              height: 25,
              justifyContent: 'center',
              paddingHorizontal: 10,
            }}>
            <Loader
              style={{
                justifyContent: 'center',
              }}
            />
          </View>
        ) : (
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'MangoDdobak-R',
              lineHeight: 25,
              textAlign: 'left',
              paddingHorizontal: 10,
              marginBottom: 2,
              color: colors.redBrown,
            }}>
            {item.text}
          </Text>
        )}
      </View>
    </View>
  ) : (
    <View
      style={{
        alignItems: 'flex-end',
        width: width * 0.9,
        marginBottom: 10,
        paddingLeft: 65,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
      }}>
      <View
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 7,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderBottomLeftRadius: 18,
          elevation: 1,
        }}>
        <Text
          style={{
            fontSize: 16,
            textAlign: 'left',
            fontFamily: 'MangoDdobak-R',
            lineHeight: 25,
            paddingHorizontal: 10,
            marginBottom: 2,
            color: colors.white,
          }}>
          {item.text}
        </Text>
      </View>
    </View>
  );
}
