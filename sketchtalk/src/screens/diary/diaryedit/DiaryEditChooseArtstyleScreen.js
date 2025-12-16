import {
  Text,
  View,
  Dimensions,
  ImageBackground,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import React, {useEffect} from 'react';
import colors from '../../../constants/colors';
import ConfirmText from '../../../components/confirmtext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import axios from 'axios';
import {synthesizeSpeech} from '../api/DiaryTTS';

const {width, height} = Dimensions.get('window');

const style_list = [
  {
    style_name: 'pastel',
    display_name: '파스텔',
    art_style_preview: require('../../../assets/artstyles/pastel.png'),
  },
  {
    style_name: 'childbook',
    display_name: '동화책',
    art_style_preview: require('../../../assets/artstyles/childbook.png'),
  },
  {
    style_name: 'coolkids',
    display_name: '쿨키즈',
    art_style_preview: require('../../../assets/artstyles/coolkids.png'),
  },
];

const ttsText = '어떤 스타일로 그려줄까?';

export default function DiaryEditChooseArtstyleScreen({route}) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  function TempNavigate(style_name) {
    navigation.navigate('DiaryArtRedrawScreen', {
      style_name: style_name,
      ...route.params,
    });
  }

  //목소리 받기
  const ls = require('local-storage');
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
        synthesizeSpeech(ttsText, 'ko-KR-SeoHyeonNeural');
      } else if (data.data.data.voiceType === 'KO_KR_GOOKMIN_NEURAL') {
        setVoice('ko-KR-GookMinNeural');
        synthesizeSpeech(ttsText, 'ko-KR-GookMinNeural');
      } else if (data.data.data.voiceType === 'KO_KR_SUNHI_NEURAL') {
        setVoice('ko-KR-SunHiNeural');
        synthesizeSpeech(ttsText, 'ko-KR-SunHiNeural');
      } else {
        setVoice('ko-KR-SeoHyeonNeural');
        synthesizeSpeech(ttsText, 'ko-KR-SeoHyeonNeural');
      }
    },
    onError: error => {
      console.warn('useGetVoiceFetch ' + error.message);
    },
  });

  useEffect(() => {
    useGetVoiceFetch.mutate();
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
      source={require('../../../assets/background/yellow_bg.png')}
      resizeMode="cover">
      <View
        style={{
          flex: 1.5,
          width: width * 0.9,
          marginTop: 150,
          marginBottom: 10,
        }}>
        <FlatList
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
          keyExtractor={item => item.style_name}
          fadingEdgeLength={100}
          data={style_list}
          renderItem={({item}) => (
            <MessageItem
              {...item}
              onPress={() => TempNavigate(item.style_name)}
            />
          )}
          numColumns={2}></FlatList>
      </View>
      <ConfirmText text={'어떤 스타일로 그려줄까?'} width={width} flex={0.55} />
    </ImageBackground>
  );
}

const MessageItem = item => (
  <Pressable
    style={{
      width: 150,
      height: 150,
      textAlign: 'center',
      marginHorizontal: 10,
      marginVertical: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
    }}
    onPress={item.onPress}>
    <Image
      style={{
        width: 150,
        height: 150,
        elevation: 1,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.gray400,
      }}
      resizeMode="contain"
      //source={require('../../assets/soccer_diary.png')}
      source={item.art_style_preview}
    />
    <Text
      style={{
        alignSelf: 'flex-end',
        fontSize: 14,
        lineHeight: 30,
        color: colors.redBrown,
        fontFamily: 'MangoDdobak-R',
      }}>
      {item.display_name}
    </Text>
  </Pressable>
);
