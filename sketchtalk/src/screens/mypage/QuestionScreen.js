import React, { useState, useMemo } from 'react';
import { ImageBackground, Dimensions, StyleSheet, View, Text, Pressable, StatusBar, Platform, FlatList } from 'react-native';
import colors from '../../constants/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import InputField from '../../components/inputfield';
import ConfirmButton from '../../components/confirmbutton';
import Popup from '../../components/popup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postInquiry } from '../../api/setting';

const { width, height } = Dimensions.get('window');
const TOP = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

const ITEM_HEIGHT = 100;    // 각 아이템(라벨+인풋)의 고정 높이 추정치
const GAP = 15;

export default function QuestionScreen({ navigation }) {
    const queryClient = useQueryClient();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const [warningOpen, setWarningOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const formItems = useMemo(
        () => [
            { key: 'title', label: '제목' },
            { key: 'content', label: '내용' },
        ],
        []
    )

    const inquiryMutation = useMutation({
        mutationFn: postInquiry,

        onSucces: async () => {
            setConfirmOpen(true);
            setTitle('');
            setContent('');
        },

        onError: (err) => {
            setErrorOpen(true);
        }
    })

    const onSubmit = () => {
        if (!title || !content) {
            setWarningOpen(true);
            return;
        }

        if (inquiryMutation.isPending) return;

        inquiryMutation.mutate({ title, content });
        setConfirmOpen(true);
    }

    const renderItem = ({ item }) => {
        const { key } = item;

        if (key === 'title') {
            return (
                <View style={styles.itemWrap}>
                    <InputField
                        label="제목"
                        value={title}
                        onChangeText={setTitle}
                        placeholder="제목을 입력해주세요"
                    />
                </View>
            );
        }

        if (key === 'content') {
            return (
                <View style={styles.itemWrap}>
                    <Text></Text>
                    <InputField
                        label="문의내용"
                        value={content}
                        onChangeText={setContent}
                        placeholder="문의내용을 입력해주세요"
                        line={5}
                    />
                </View>
            );
        }

        return null;
    };

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

                <Text style={styles.title}>문의하기</Text>
            </View>

            <View style={styles.card}>
                <View style={{height: GAP}}/>
                <FlatList
                    data={formItems}
                    keyExtractor={(item) => item.key}
                    renderItem={renderItem}
                    contentContainerStyle={styles.cardContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                />
                <View style={styles.saveBtnWrap}>
                    <ConfirmButton
                        text={inquiryMutation.isPending ? '전송 중' : '문의 전송하기'}
                        color={colors.primary}
                        width={width * 0.8}
                        marginBottom={10}
                        disabled={inquiryMutation.isPending}
                        onPress={onSubmit}
                    />
                </View>
            <Popup
                visible={warningOpen}
                message="문의 제목과 내용을 작성해주세요."
                onClose={() => setWarningOpen(false)}
                primary={{
                    text: '확인',
                    variant: 'primary',
                    onPress: () => setWarningOpen(false),
                }}
            />
            <Popup
                visible={errorOpen}
                message="문의전송에 실패하였습니다. 다시 시도해주세요."
                onClose={() => setErrorOpen(false)}
                primary={{
                    text: '확인',
                    variant: 'primary',
                    onPress: () => setErrorOpen(false),
                }}
            />
            <Popup
                visible={confirmOpen}
                message="문의가 전송되었습니다. 곧 답변해드릴게요!"
                onClose={() => {
                    setConfirmOpen(false);
                    navigation.goBack();
                }}
                primary={{
                    text: '확인',
                    variant: 'primary',
                    onPress: () => {
                        setConfirmOpen(false);
                        navigation.goBack();
                    }
                }}
            />
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
    cardContent: {
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 16,
    },
    itemWrap: {
        height: ITEM_HEIGHT,
        justifyContent: 'flex-start',
    },
    saveBtnWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
    },
    infoText:{
        fontSize: 16,
        fontFamily: 'MangoDdobak-R',
        color: colors.redBrown,
    },
});