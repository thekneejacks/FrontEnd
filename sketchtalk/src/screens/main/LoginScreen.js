import React, {useRef, useState} from 'react';
import {
  SafeAreaView,
  View,
  Dimensions,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import {useMutation} from '@tanstack/react-query';
import {loginUser} from '../../api/auth';
import InputField from '../../components/inputfield';
import colors from '../../constants/colors';
import ConfirmButton from '../../components/confirmbutton';
import Popup from '../../components/popup';

const {width, height} = Dimensions.get('window');

const DUMMY_DEVICE_TOKEN = 'dummy-device-token';
const DUMMY_DEVICE_ID = 'dummy-device-id';

export default function AuthScreen({navigation}) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loginCheckOpen, setLoginCheckOpen] = useState(false);
  const [loginErrorOpen, setLoginErrorOpen] = useState(false);

  const flatRef = useRef(null);
  const focusScrollTo = index => {
    flatRef.current?.scrollToIndex?.({index, animated: true});
  };

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: data => {
      console.log('login success:', data);
      navigation.replace('TabNavigator');
    },
    onError: error => {
      console.log('login error:', error);
      setLoginErrorOpen(true);
    },
  });

  const handleLogin = () => {
    if (!id || !password) {
      setLoginCheckOpen(true);
      return;
    }

    const body = {
      loginId: id.trim(),
      password,
      deviceToken: DUMMY_DEVICE_TOKEN,
      deviceType: 'ANDROID',
      deviceIdentifier: DUMMY_DEVICE_ID,
    };

    loginMutation.mutate(body);
  };

  const loading = loginMutation.isPending;

  return (
    <SafeAreaView style={{flex: 1}}>
      <ImageBackground
        source={require('../../assets/background/yellow_bg.png')}
        style={{width, height, flex: 1}}
        resizeMode="cover">
        <View style={styles.container}>
          <Image
            source={require('../../assets/main_logo.png')}
            style={styles.logo}
          />

          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>로그인</Text>

            <InputField
              label="아이디"
              placeholder="아이디"
              value={id}
              onChangeText={setId}
              onFocus={() => focusScrollTo(0)}
            />

            <InputField
              label="비밀번호"
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => focusScrollTo(1)}
            />
          </View>
        </View>
        <View style={styles.button}>
          <ConfirmButton
            text={loading ? '로그인 중' : '로그인'}
            color={colors.primary}
            width={width * 0.8}
            onPress={loading ? undefined : handleLogin}
            disabled={loading}
          />
        </View>
        <Popup
          visible={loginCheckOpen}
          message="아이디와 비밀번호를 입력해주세요."
          onClose={() => setLoginCheckOpen(false)}
          primary={{
            text: '확인',
            variant: 'primary',
            onPress: () => setLoginCheckOpen(false),
          }}
        />
        <Popup
          visible={loginErrorOpen}
          message="로그인 중 오류가 발생했습니다. 다시 시도하여주세요."
          onClose={() => setLoginErrorOpen(false)}
          primary={{
            text: '확인',
            variant: 'primary',
            onPress: () => setLoginErrorOpen(false),
          }}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logo: {
    width: 177,
    height: 177,
    marginTop: 72,
  },
  loginCard: {
    width: width * 0.85,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 16,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  loginTitle: {
    fontSize: 30,
    fontFamily: 'MangoDdobak-B',
    textAlign: 'center',
    marginBottom: 20,
    color: colors.redBrown,
  },
  button: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
});
