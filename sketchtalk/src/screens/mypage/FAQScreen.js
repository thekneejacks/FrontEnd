import React, {useState} from 'react';
import { ImageBackground, Dimensions, StyleSheet, View, Text, Pressable, StatusBar, Platform, FlatList, LayoutAnimation } from 'react-native';
import colors from '../../constants/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import MypageField from '../../components/mypagefield';
import ConfirmButton from '../../components/confirmbutton';
import { useQuery } from '@tanstack/react-query';
import { getQuestionList } from '../../api/setting';

const { width, height } = Dimensions.get('window');
const TOP = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

const FAQList = [
    { id: '1', q: '문의가 없거나 불러올 수 없습니다.', a: '다시 시도해주세요:)' },
]

export default function FAQScreen({ navigation }) {
    const [openId, setOpenId] = useState(null);

    const toggle = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenId(prev => (prev === id ? null : id));
    };

    const renderItem = ({ item }) => {
        const isOpen = openId === item.id;
        return (
        <View>
            <MypageField
            highlight="Q. "
            text={item.q}
            onPress={() => toggle(item.id)}
            rightType="down"
            rightRotate={isOpen ? 180 : 0}
            divider="thin"
            />
            {isOpen && (
            <View style={styles.answerBox}>
                <Text style={styles.answerLabel}>A.</Text>
                <Text style={styles.answerText}>{item.a}</Text>
                <View style={styles.answerDivider}></View>
            </View>
            )}
        </View>
        );
    };

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['questionList'],
        queryFn: getQuestionList,

        onError: (err) => {
    console.log('FAQ API ERROR ======');
    console.log('status:', err.response?.status);
    console.log('data:', err.response?.data);
  },
  onSuccess: (d) => {
    console.log('FAQ 서버에서 받은 데이터:', d); 
  },
    });

    const serverList = data?.map((item, index) => ({
        id: String(index + 1),
        q: item.question,
        a: item.answer,
    })) || [];

    const listToRender = serverList.length > 0 ? serverList : FAQList;
    
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

            <Text style={styles.title}>자주 묻는 질문</Text>
        </View>

        <View style={styles.card}>
            {isLoading && (
                <Text style={styles.alramText}>문의 목록을 불러오는 중</Text>
            )}
            {isError && (
                <Text style={styles.alramText}>
                    문의 목록을 불러오지 못했어요:{'('}
                    {error?.message}
                </Text>
            )}
            <FlatList
                data = {listToRender}
                keyExtractor={(i) => i.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={true}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 16 }}
                initialNumToRender={6}
                windowSize={8}
                removeClippedSubviews
            />
            <View style={styles.saveBtnWrap}>
            <ConfirmButton
                text="질문하기"
                color={colors.primary}
                width={width * 0.8}
                marginBottom={10}
                onPress={() => navigation.navigate('Question')}
            />
            </View>
        </View>
    </ImageBackground>
  );
}

const CARD_MAX_H = height * 0.8;
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
    height: CARD_MAX_H,
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    paddingTop: 18,
    marginBottom: 16,
},
answerBox: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: colors.white,
},
answerLabel: {
    fontSize: 16,
    color: colors.redBrown,
    fontFamily: 'MangoDdobak-B',
    marginBottom: 6,
},
answerText: {
    fontSize: 14,
    fontFamily: 'MangoDdobak-R',
    color: colors.redBrown,
    lineHeight: 20,
},
answerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray200,
    widith: '100%',
    marginTop: 4,
  },
alramText: {
    fontFamily: 'MangoDdobak-R',
    fontSize: 14,
    color: colors.redBrown,
    textAlign: 'center',
    marginVertical: 8,
},
saveBtnWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
},
});