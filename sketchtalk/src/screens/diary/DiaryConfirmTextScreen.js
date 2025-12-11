import {
  Text,
  View,
  Dimensions,
  ImageBackground,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import ConfirmText from '../../components/confirmtext';
import ConfirmButton from '../../components/confirmbutton';
import colors from '../../constants/colors';

import Modal from 'react-native-modal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {DiaryLoadingScreen} from './component/DiaryLoadingScreen';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {synthesizeSpeech} from './api/DiaryTTS';
import axios from 'axios';

const {width, height} = Dimensions.get('window');

const dummyData = {
  title: '축구하다가 넘어졌지만 재밌었어!',
  content:
    '오늘 학교에서 친구들이랑 운동장에서 축구를 했다. 나는 열심히 뛰다가 그만 넘어져서 무릎이 좀 아팠다. 그래도 친구들이 걱정해줘서 기분이 좋았고, 계속 같이 놀았다. 골은 못 넣었지만 친구들이랑 뛰어다니는 게 너무 재미있었다. 내일도 또 축구하고 싶다!',
};

export default function DiaryConfirmTextScreen() {
  const [textConfirmModalVisible, setTextConfirmModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  //일기 승인
  const navigation = useNavigation();
  const ls = require('local-storage');
  //글 받아오기
  const useDiaryGetTextFetch = useMutation({
    mutationFn: newTodo => {
      const token = ls('token');
      return axios.post('https://sketch-talk.com/chat/diary', newTodo, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onError: error => {
      console.warn('diaryGetText ' + error);
    },

    onSuccess: () => {
      synthesizeSpeech('다시 써볼까?');
    },
  });

  useEffect(() => {
    useDiaryGetTextFetch.mutate({userId: 'userId'});
  }, []);

  //글 승인하기
  const useDiaryConfirmTextFetch = useMutation({
    mutationFn: newTodo => {
      const token = ls('token');
      return axios.post('https://sketch-talk.com/diary/save', newTodo, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onMutate: () => {
      setTextConfirmModalVisible(true);
    },

    onError: error => {
      console.warn('diaryConfirm ' + error);
    },

    onSuccess: data => {
      setTextConfirmModalVisible(false);
      navigation.navigate('DiaryChooseArtstyleScreen', {
        diaryId: data.data.data.diaryId,
        content: useDiaryGetTextFetch.data.data.data.content,
      });
    },
  });

  function ConfirmDiary() {
    useDiaryConfirmTextFetch.mutate({
      title: useDiaryGetTextFetch.data.data.data.title,
      content: useDiaryGetTextFetch.data.data.data.content,
      emotion: useDiaryGetTextFetch.data.data.data.emotion,
    });
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
      {/*{useDiaryGetTextFetch.isPending ? (*/}
      {useDiaryGetTextFetch.isIdle && (
        <DiaryLoadingScreen
          width={width}
          //onPress={() => setIsLoading(false)}
          loadingText={'또리가 일기를 작성하는 중...'}
        />
      )}
      {useDiaryGetTextFetch.isPending && (
        <DiaryLoadingScreen
          width={width}
          //onPress={() => setIsLoading(false)}
          loadingText={'또리가 일기를 작성하는 중...'}
        />
      )}
      {useDiaryGetTextFetch.isError && (
        <DiaryLoadingScreen
          width={width}
          //onPress={() => setIsLoading(false)}
          loadingText={'에러 발생'}
        />
      )}
      {useDiaryGetTextFetch.isSuccess && (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <CharacterImage />
          <DiaryDisplay
            item={useDiaryGetTextFetch.data.data.data}
            //item={dummyData}
          />
          <ConfirmText text={'다시 써볼까?'} width={width} flex={0.5} />
          <View style={{flex: 1.7}}>
            <ConfirmButton
              text={'응! 다시 써줘.'}
              color={colors.primary}
              marginBottom={0}
              onPress={() => useDiaryGetTextFetch.mutate({userId: 'userId'})}
            />
            <ConfirmButton
              text={'아니야! 마음에 들어.'}
              color={colors.blue}
              marginBottom={22}
              //onPress={TempNavigate}
              onPress={() => ConfirmDiary()}
            />
          </View>
        </View>
      )}
      {textConfirmModalVisible && (
        <ConfirmTextModal isVisible={textConfirmModalVisible} />
      )}
    </ImageBackground>
  );
}

const CharacterImage = () => (
  <View
    style={{
      flex: 2.5,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 19,
    }}>
    <Image source={require('../../assets/character/question_bear.png')} />
  </View>
);

const DiaryDisplay = props => (
  <View style={{flex: 3, justifyContent: 'flex-start', alignItems: 'center'}}>
    <View
      style={{
        height: 220,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: width * 0.9,
        backgroundColor: colors.creamWhite,
        marginVertical: 10,
        borderRadius: 10,
        borderColor: colors.black,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
      }}>
      <View style={{position: 'absolute'}}>
        <NotebookLine />
        <NotebookLine />
        <NotebookLine />
        <NotebookLine />
        <NotebookLine />
        <NotebookLine />
        <NotebookLine />
      </View>
      <Text
        style={{
          fontSize: 14,
          fontFamily: 'MangoDdobak-R',
          color: colors.redBrown,
          justifyContent: 'flex-start',
          width: width * 0.9 - 2,
          paddingHorizontal: 10,
          lineHeight: 30,
        }}>
        제목 : {props.item.title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          fontFamily: 'MangoDdobak-R',
          color: colors.redBrown,
          includeFontPadding: false,
          justifyContent: 'flex-start',
          paddingHorizontal: 10,
          width: width * 0.9 - 2,
          lineHeight: 30,
        }}>
        {props.item.content}
      </Text>
    </View>
  </View>
);

const NotebookLine = () => (
  <View
    style={{
      height: 30.4,
      width: width * 0.9 - 12,
      borderTopColor: '#0000',
      borderLeftColor: '#0000',
      borderRightColor: '#0000',
      borderBottomColor: colors.gray200,
      borderWidth: 1,
    }}
  />
);

const ConfirmTextModal = props => (
  <Modal
    isVisible={props.isVisible}
    animationIn="none"
    statusBarTranslucent={true}
    animationInTiming={1}
    animationOutTiming={1}
    onBackdropPress={props.onBackdropPress}>
    <View
      style={{
        height: height,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: width,
          height: height,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          position: 'absolute',
        }}
      />
      <View
        style={{
          backgroundColor: 'white',
          width: 327,
          height: 223,
          mixBlendMode: 'normal',
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            width: 300,
            height: 203,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View style={{flex: 1}} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'MangoDdobak-R',
              color: colors.redBrown,
              includeFontPadding: false,
              flex: 1,
              marginTop: 15,
            }}>
            잠시만 기다려 주세요...
          </Text>
          <View style={{flex: 1, flexDirection: 'row'}}>
            {/*put circle loading screen here*/}
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </View>
    </View>
  </Modal>
);
