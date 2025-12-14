import React from 'react';
import { ImageBackground, Dimensions, StyleSheet, View, Text, Pressable, StatusBar, Platform, FlatList } from 'react-native';
import colors from '../../constants/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import MypageField from '../../components/mypagefield';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getUserInfo,
    updateBaseNotificationSetting,
    getPastNotificationSetting,
    updatePastNotificationSetting,
    getWriteNotificationSetting,
    updateWriteNotificationSetting,
} from '../../api/setting';

const { width, height } = Dimensions.get('window');
const TOP = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

const ALARM_ITEMS = [
    {id: 'all', text : '전체 알림'},
    {id: 'past', text : '과거 알림'},
    {id: 'write', text : '작성 알림'},
]

export default function AlarmSettingScreen({ navigation }) {
    const queryClient = useQueryClient();

    const {
        data: baseData,
        isLoading : baseLoading,
        isError : baseError,
    } = useQuery({
        queryKey: ['notification', 'base'],
        queryFn: getUserInfo,
    });

    const {
        data: pastData,
        isLoading : pastLoading,
        isError : pastError,
    } = useQuery({
        queryKey: ['notification', 'past'],
        queryFn: getPastNotificationSetting,
    });

    const {
        data: writeData,
        isLoading: writeLoading,
        isError: writeError,
    } = useQuery({
        queryKey: ['notification', 'write'],
        queryFn: getWriteNotificationSetting,
    });

    const loading = baseLoading || pastLoading || writeLoading;
    const error = baseError || pastError || writeError;

    const baseMutation = useMutation({
        mutationFn: updateBaseNotificationSetting,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification', 'base'] });
        },
    });

    const pastMutation = useMutation({
        mutationFn: updatePastNotificationSetting,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification', 'past'] });
        },
    });

    const writeMutation = useMutation({
        mutationFn: updateWriteNotificationSetting,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification', 'write'] });
        },
    });

    const isMutating = baseMutation.isPending ||pastMutation.isPending || writeMutation.isPending;

    const allOn = baseData?.canAlarm ?? false;
    const pastOn = pastData?.canNotify ?? false;
    const writeOn = writeData?.canNotify ?? false;

    const handleToggle = (id, value) => {
        if (loading || isMutating) return;

        if (id === 'all') {
        if (!pastData || !writeData){
            baseMutation.mutate({ canAlarm: value });
            return;
        }
        baseMutation.mutate(
            { canAlarm: value },
            {
                onSuccess: () => {
                    pastMutation.mutate({
                        canNotify: value,
                        notificationTime: "23:00",
                        notificationValue: 1,
                        notificationUnit: "DAY",
                    });
                    writeMutation.mutate({
                            canNotify: value,
                            notificationTime: "20:00",
                            notificationUnit: "DAY",
                    });
                },
            },
        );
        return;
        }

        if (id === 'past') {
        if (!pastData) return;

        pastMutation.mutate({
            canNotify: value,
            notificationTime: "23:00",
            notificationValue: 1,
            notificationUnit:  "DAY",
        });
        return;
        }

        if (id === 'write') {
        if (!writeData) return;

        writeMutation.mutate({
            canNotify: value,
            notificationTime: "20:00",
            notificationUnit: "DAY",
        });
        return;
        }
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

            <Text style={styles.title}>알람 설정</Text>
        </View>

        <View style={styles.card}>    
            {loading && (
                <View>
                    <Text style={styles.infoText}> 알람 설정 불러오는 중</Text>
                </View>
            )}      
            {error && !loading && (
                <View>
                    <Text style={styles.infoText}> 알람 설정을 불러오지 못했습니다.</Text>
                </View>
            )}
            {!loading && !error && (
            <FlatList
                data = {ALARM_ITEMS}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => {
                    let value = false;

                    if(item.id === 'all') value = allOn;
                    if(item.id === 'past') value = pastOn;
                    if(item.id === 'write') value = writeOn;

                    return(
                        <MypageField
                            text={item.text}
                            pressable={false}
                            rightType="switch"
                            switchValue={value}
                            onPress={(v) => handleToggle(item.id, v)}
                            disabled={isMutating}
                        />)
                }} 
            />)}
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
infoText:{
    fontSize: 16,
    fontFamily: 'MangoDdobak-R',
    color: colors.redBrown,
},
});