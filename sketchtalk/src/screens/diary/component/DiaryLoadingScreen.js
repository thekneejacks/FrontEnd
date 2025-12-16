import {Text, View, ImageBackground, Image, Pressable} from 'react-native';
import React from 'react';
import colors from '../../../constants/colors';

export const DiaryLoadingScreen = props => (
  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
    <Text
      style={{
        flex: 1,
        marginTop: 100,
        fontFamily: 'MangoDdobak-B',
        fontSize: 27,
        color: colors.primary,
      }}>
      {/*또리가 일기를 작성 중...*/}
      {/*!isPending ? error.message : '로딩중'*/}
      {props.loadingText}
    </Text>
    <LoadingCharacterImage />
    <View
      style={{
        flex: 3,
        justifyContent: 'flex-start',
        width: props.width * 0.9,
        marginBottom: 50,
      }}>
      <Pressable
        style={{alignSelf: 'flex-start', fontSize: 25, marginTop: 20}}
        onPress={props.onPress}>
        <Text
          style={{
            alignSelf: 'flex-start',
            fontFamily: 'MangoDdobak-B',
            color: colors.redBrown,
            fontSize: 25,
            marginTop: 0,
          }}>
          오늘의 추천💡
        </Text>
      </Pressable>
      <Text
        style={{
          alignSelf: 'flex-start',
          fontSize: 20,
          fontFamily: 'MangoDdobak-R',
          color: colors.redBrown,
          lineHeight: 29,
          marginTop: 20,
        }}>
        일기를 쓸 때 너무 많은 걸 쓰려고 하지 말고, 가장 기억에 남는 한 가지를
        고르면 좋아!
      </Text>
    </View>
  </View>
);

const LoadingCharacterImage = () => (
  <View
    style={{
      flex: 3,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <ImageBackground
      source={require('../../../assets/character/ellipse.png')}
      style={{
        width: 360,
        height: 360,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Image
        style={{
          shadowColor: colors.primary,
          borderRadius: 120,
        }}
        source={require('../../../assets/character/writing_bear.png')}
      />
    </ImageBackground>
  </View>
);
