import React from 'react';
import { ImageBackground, Dimensions, StyleSheet, View, Text, Pressable, StatusBar, Platform } from 'react-native';
import colors from '../../constants/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import { useQuery } from '@tanstack/react-query';
import { getAppInfo } from '../../api/setting';

const { width, height } = Dimensions.get('window');
const TOP = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

export default function AppInfoScreen({ navigation }) {

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['appInfo'],
        queryFn: getAppInfo,
    });

  return (
    <ImageBackground
        source={require('../../assets/background/yellow_bg.png')}
        resizeMode="cover"
        style={styles.background}
    >
        <View style={[styles.header, { top: TOP + 45 }]}>
            <Pressable
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
            >
                <Entypo name="chevron-thin-left" size={30} color={colors.redBrown} />
            </Pressable>

            <Text style={styles.title}>애플리케이션 정보</Text>
        </View>

        <View style={styles.card}>
            {isLoading && (
                <Text style={styles.infoText}> 앱 정보를 불러오는 중</Text>
            )}
            {isError && (
                <Text style={styles.infoText}>
                     앱 정보를 불러오지 못했어요.{'\n '}
                     {error?.message}
                </Text>
            )}
            {data && !isLoading && !isError && (
                <Text style={styles.infoText}>
                    {'\n '}
                    플랫폼 : {data.platform}{'\n '}
                    현재 버전 : {data.currentVersion}{'\n '}
                    업데이트 날짜 : {data.date}
                </Text>
            )}
        </View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: width,
        height: height,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        position: 'absolute',
        left: 16,
        right: 16,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtn: {
        position: 'absolute',
        left: 0,
        height: 48,
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
    },
    title: {
        fontSize: 24,
        fontFamily: 'MangoDdobak-B',
        color: colors.redBrown,
        letterSpacing: 0.3,
    },
    card: {
        position: 'absolute',
        top: 129,
        alignSelf: 'center',
        width: width - 32,
        height: height * 0.8,
        backgroundColor: colors.white,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        paddingTop: 18,
        marginBottom: 16,
      },
      infoText:{
        fontSize: 16,
        fontFamily: 'MangoDdobak-R',
        color: colors.redBrown,
      },
});