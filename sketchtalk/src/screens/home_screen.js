import React from 'react';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import colors from '../constants/colors';
import BlinkView from 'react-native-blink-view';
import {
  ImageBackground,
  Pressable,
  Dimensions,
  Text,
  View,
  Image,
} from 'react-native';

const {width, height} = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <Background
      source={require('../assets/background/yellow_bg.png')}
      resizeMode="cover">
      <AppLogo />
      <CharacterImage
        onPress={() => navigation.navigate('DiaryStackNavigator')}
      />
    </Background>
  );
}

const AppLogo = () => (
  <Image
    source={require('../assets/logo.png')}
    style={{
      position: 'absolute',
      top: 10,
      left: 10,
      width: 80,
      height: 80,
    }}
  />
);

const CharacterImage = props => (
  <Pressable
    onPress={props.onPress}
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
    }}>
    <Image source={require('../assets/character/bear_home.png')} />
    <View
      style={{
        width: width,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Image
        style={{width: width * 0.9}}
        resizeMode="contain"
        source={require('../assets/character/home_comment.png')}
      />
    </View>
    <BlinkView style={{flex: 1, top: 30}} delay={1500}>
      <Text
        style={{
          flex: 1,
          color: colors.redBrown,
          fontFamily: 'MangoDdobak-R',
          fontSize: 14,
          textAlignVertical: 'center',
        }}>
        캐릭터를 누르면 일기를 쓰러 갈 수 있어요!
      </Text>
    </BlinkView>
  </Pressable>
);

const Background = styled(ImageBackground)`
  flex: 1;
  width: ${width};
  height: ${height};
  justify-content: center;
  align-items: center;
`;
