import {
  Text,
  View,
  Dimensions,
  ImageBackground,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Modal from 'react-native-modal';
import ConfirmText from '../../components/confirmtext';
import ConfirmButton from '../../components/confirmbutton';
import colors from '../../constants/colors';
import {DiaryLoadingScreen} from './component/DiaryLoadingScreen';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import axios from 'axios';
import {synthesizeSpeech} from './api/DiaryTTS';

const {width, height} = Dimensions.get('window');

export default function DiaryConfirmArtScreen({route}) {
  const [artConfirmModalVisible, setArtConfirmModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const ls = require('local-storage');

  //그림 받아오기
  const useDiaryGetArtFetch = useMutation({
    mutationFn: newTodo => {
      const token = ls('token');
      return axios.post('https://sketch-talk.com/chat/image', newTodo, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onError: error => {
      console.warn('diaryGetArt ' + error);
    },

    onSuccess: () => {
      synthesizeSpeech('다시 그려줄까?', voice);
    },
  });

  //그림 승인

  const useDiaryConfirmArtFetch = useMutation({
    mutationFn: newTodo => {
      const token = ls('token');
      return axios.post(`https://sketch-talk.com/chat/image/save`, newTodo, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onMutate: () => {
      setArtConfirmModalVisible(true);
    },
    onError: error => {
      console.warn('confirmart' + error);
    },

    onSuccess: data => {
      setArtConfirmModalVisible(false);
      navigation.navigate('DiaryResultStackNavigator', {
        screen: 'DiaryResultScreen',
        params: {
          isCalendar: false,
          diaryId: data.data.data.diaryId,
          achieved: data.data.data.achieved,
          achievedResult: data.data.data.achievedResult,
          ...route.params,
        },
      });
    },
  });

  const confirmArt = () => {
    useDiaryConfirmArtFetch.mutate({
      diaryId: useDiaryGetArtFetch.data.data.data.diaryId,
      style: useDiaryGetArtFetch.data.data.data.style,
      imageUrl: useDiaryGetArtFetch.data.data.data.imageUrl,
    });
  };

  const {diaryId, content, style_name, voice} = route.params;
  useEffect(() => {
    if (typeof diaryId === 'number') {
      console.log('yes');
      console.log(diaryId);
    }
    console.log(width);
    console.log(content);
    console.log(style_name);
    useDiaryGetArtFetch.mutate({
      diaryId: diaryId,
      content: content,
      style: style_name,
    });
  }, []);

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
      {artConfirmModalVisible && (
        <ConfirmArtModal isVisible={artConfirmModalVisible} />
      )}
      {useDiaryGetArtFetch.isPending && (
        <DiaryLoadingScreen
          width={width}
          //onPress={() => setIsLoading(false)}
          loadingText={'또리가 그림을 그리는 중...'}
        />
      )}
      {useDiaryGetArtFetch.isError && (
        <DiaryLoadingScreen
          width={width}
          //onPress={() => setIsLoading(false)}
          loadingText={'에러 발생'}
        />
      )}
      {useDiaryGetArtFetch.isSuccess && (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <CharacterImage />
          <DiaryArtDisplay
            imageUrl={useDiaryGetArtFetch.data.data.data.imageUrl}
          />
          <ConfirmText text={'다시 그려줄까?'} width={width} flex={0.5} />
          <View style={{flex: 1.7}}>
            <ConfirmButton
              text={'응! 다시 그려줘.'}
              color={colors.primary}
              marginBottom={0}
              onPress={() =>
                useDiaryGetArtFetch.mutate({
                  diaryId: diaryId,
                  content: content,
                  style: style_name,
                })
              }
            />
            <ConfirmButton
              text={'아니야! 마음에 들어.'}
              color={colors.blue}
              marginBottom={22}
              onPress={() => confirmArt()}
            />
          </View>
        </View>
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

const DiaryArtDisplay = props => (
  <View
    style={{
      flex: 2.6,
      alignItems: 'center',
      width: width * 0.9,
      marginVertical: 10,
    }}>
    <View
      style={{
        height: 150,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: width * 0.9,
      }}>
      <Image
        //width: 360
        style={{
          width: width * 0.9,
          height: 230,
          resizeMode: 'cover',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.gray400,
        }}
        resizeMethod="scale"
        source={{uri: props.imageUrl}}
      />
    </View>
  </View>
);

const ConfirmArtModal = props => (
  <Modal
    isVisible={props.isVisible}
    animationIn="none"
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
              includeFontPadding: false,
              color: colors.redBrown,
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
