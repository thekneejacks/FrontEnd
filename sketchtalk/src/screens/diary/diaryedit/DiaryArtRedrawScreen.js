import {
  Text,
  View,
  Dimensions,
  ImageBackground,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Modal from 'react-native-modal';
import ConfirmText from '../../../components/confirmtext';
import ConfirmButton from '../../../components/confirmbutton';
import colors from '../../../constants/colors';
import styled from 'styled-components';
import {DiaryLoadingScreen} from '../component/DiaryLoadingScreen';
import {useNavigation} from '@react-navigation/native';
import {useDiaryRedrawImageFetch} from '../api/DiaryFetch';
import {useMutation} from '@tanstack/react-query';
import axios from 'axios';

const {width, height} = Dimensions.get('window');

export default function DiaryArtRedrawScreen({route}) {
  const [artConfirmModalVisible, setArtConfirmModalVisible] = useState(false);

  const navigation = useNavigation();

  const {diaryId, content, style_name, image_url} = route.params;
  useEffect(() => {
    console.log(style_name);
    console.log(image_url);
    useDiaryRedrawImageFetch.mutate({
      diaryId: diaryId,
      content: content,
      style: style_name,
      prevImageUrl: image_url,
    });
  }, []);

  //그림 재생성
  const useDiaryRedrawImageFetch = useMutation({
    mutationFn: newTodo => {
      const token = ls('token');
      return axios.post('https://sketch-talk.com/chat/image/retry', newTodo, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: data => {
      console.log(data.data.data);
    },
    onError: error => {
      console.warn('diaryRedraw ' + error);
    },
  });

  //그림 승인

  const ls = require('local-storage');
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

    onSuccess: () => {
      setArtConfirmModalVisible(false);
      navigation.navigate('DiaryResultStackNavigator', {
        screen: 'DiaryResultScreen',
        params: {
          ...route.params,
        },
      });
    },
  });

  const confirmOldArt = () => {
    navigation.navigate('DiaryResultStackNavigator', {
      screen: 'DiaryResultScreen',
      params: {
        ...route.params,
      },
    });
  };

  const confirmNewArt = () => {
    useDiaryConfirmArtFetch.mutate({
      diaryId: useDiaryRedrawImageFetch.data.data.data.diaryId,
      style: useDiaryRedrawImageFetch.data.data.data.style,
      imageUrl: useDiaryRedrawImageFetch.data.data.data.imageURL,
    });
  };

  return (
    <Background
      source={require('../../../assets/background/yellow_bg.png')}
      resizeMode="cover">
      {artConfirmModalVisible && (
        <ConfirmArtModal isVisible={artConfirmModalVisible} />
      )}
      {useDiaryRedrawImageFetch.isPending && (
        <DiaryLoadingScreen
          width={width}
          //onPress={() => setIsLoading(false)}
          loadingText={'또리가 그림을 그리는 중...'}
        />
      )}
      {useDiaryRedrawImageFetch.isError && (
        <DiaryLoadingScreen
          width={width}
          //onPress={() => setIsLoading(false)}
          loadingText={'에러 발생'}
        />
      )}
      {useDiaryRedrawImageFetch.isSuccess && (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text
            style={{
              flex: 1,
              fontSize: 30,
              fontFamily: 'MangoDdobak-B',
              includeFontPadding: false,
              color: colors.primary,
              textAlign: 'center',
              textAlignVertical: 'center',
              marginTop: 20,
            }}>
            그림을 선택해주세요.
          </Text>
          <DiaryRedrawArtDisplay
            image_url={image_url}
            text={'이전 그림'}
            onPress={() => confirmOldArt()}
          />
          <DiaryRedrawArtDisplay
            image_url={useDiaryRedrawImageFetch.data.data.data.imageURL}
            text={'새로 그린 그림'}
            onPress={() => confirmNewArt()}
          />
        </View>
      )}
    </Background>
  );
}

const DiaryRedrawArtDisplay = props => (
  <View
    style={{
      flex: 2.5,
      alignItems: 'center',
      width: width * 0.9,
      marginVertical: 10,
    }}>
    <View
      style={{
        height: 100,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: width * 0.9,
      }}>
      <Text
        style={{
          fontSize: 25,
          fontFamily: 'MangoDdobak-B',
          includeFontPadding: false,
          textAlign: 'left',
          color: colors.redBrown,
          width: width * 0.9,
          marginBottom: 15,
        }}>
        {props.text}
      </Text>
      <Pressable onPress={props.onPress}>
        <Image
          style={{
            width: width * 0.9,
            height: 230,
            resizeMode: 'cover',
            borderWidth: 1,
            borderColor: colors.gray400,
          }}
          resizeMethod="scale"
          source={{uri: props.image_url}}
        />
      </Pressable>
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
              flex: 1,
              color: colors.redBrown,
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

const Background = styled(ImageBackground)`
  flex: 1;
  width: ${width};
  height: ${height};
  justify-content: center;
  align-items: center;
`;
