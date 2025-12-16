import {
  Text,
  View,
  Dimensions,
  ImageBackground,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {React, useEffect, useState} from 'react';
import colors from '../../../constants/colors';
import {useNavigation, CommonActions} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ConfirmButton from '../../../components/confirmbutton';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import moment from 'moment';
import {useMutation} from '@tanstack/react-query';
import axios from 'axios';

const {width, height} = Dimensions.get('window');

export default function DiaryEditScreen({route}) {
  const [contentText, onChangeContentText] = useState('');
  const [titleText, onChangeTitleText] = useState('');
  const [confirmRedrawModalVisible, setConfirmRedrawModalVisible] =
    useState(false);
  const [editInProgressModalVisible, setEditInProgressModalVisible] =
    useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  function TempNavigateToResultScreen() {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {
            name: 'DiaryResultScreen',
            params: {
              diaryId: route.params.diaryId,
              isCalendar: route.params.isCalendar,
            },
          },
        ],
      }),
    );
  }
  function TempNavigateToRedrawScreen() {
    navigation.navigate('DiaryEditChooseArtstyleScreen', {
      confirmArt: true,
      newContent: useDiaryEditFetch.data.data.data.content,
      ...route.params,
    });
  }
  const {diaryId, date, title, content, emotion} = route.params;
  useEffect(() => {
    onChangeContentText(content);
    onChangeTitleText(title);
  }, []);

  //일기 수정하기
  const ls = require('local-storage');
  const useDiaryEditFetch = useMutation({
    mutationFn: newTodo => {
      const token = ls('token');
      return axios.put('https://sketch-talk.com/diary/', newTodo, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    },

    onMutate: () => {
      setEditInProgressModalVisible(true);
    },

    onError: error => {
      console.warn('diaryEdit ' + error);
    },

    onSuccess: () => {
      setEditInProgressModalVisible(false);
      setConfirmRedrawModalVisible(true);
    },
  });

  const editDiary = () => {
    //console.log(diaryId);
    console.log(diaryId + ' ' + typeof diaryId);
    console.log(date + ' ' + typeof date);
    console.log(title + ' ' + typeof title);
    console.log(emotion + ' ' + typeof emotion);
    console.log(contentText + ' ' + typeof contentText);
    useDiaryEditFetch.mutate({
      diaryId: diaryId,
      title: titleText,
      content: contentText,
      date: date,
      emotion: emotion,
    });
  };

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
      <DiaryDisplay
        title={title}
        content={contentText}
        onChangeTitleText={text => onChangeTitleText(text)}
        onChangeContentText={text => onChangeContentText(text)}
        date={date}
      />
      <ConfirmButton
        text={'저장'}
        color={colors.primary}
        onPress={() => editDiary()}
      />
      <EditInProgressModal isVisible={editInProgressModalVisible} />
      <ConfirmRedrawPopup
        modalVisible={confirmRedrawModalVisible}
        closeOnPress={() => setConfirmRedrawModalVisible(false)}
        yesOnPress={() => {
          setConfirmRedrawModalVisible(false);
          TempNavigateToRedrawScreen();
        }}
        noOnPress={() => {
          setConfirmRedrawModalVisible(false);
          TempNavigateToResultScreen();
        }}
      />
    </ImageBackground>
  );
}

const EditInProgressModal = props => (
  <Modal
    visible={props.isVisible}
    transparent={true}
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

const ConfirmRedrawPopup = props => (
  <Modal
    transparent={true}
    animationIn="none"
    animationInTiming={1}
    animationOutTiming={1}
    visible={props.modalVisible}>
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
          <Pressable
            style={{flex: 1, alignSelf: 'flex-end'}}
            onPress={props.closeOnPress}>
            <EvilIcons name="close" size={37} color={colors.black} />
          </Pressable>
          <Text
            style={{
              fontSize: 16,
              color: colors.redBrown,
              fontFamily: 'MangoDdobak-R',
              includeFontPadding: false,
              flex: 1,
              marginTop: 15,
            }}>
            수정된 일기로 그림을 다시 만들까요?
          </Text>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <ConfirmButton
              color={colors.primary}
              width={138}
              height={37}
              fontSize={14}
              text={'네, 만들어주세요!'}
              onPress={props.yesOnPress}
            />
            <ConfirmButton
              color={'#C6C6C6'}
              width={138}
              height={37}
              fontSize={14}
              text={'괜찮아요!'}
              onPress={props.noOnPress}
            />
          </View>
        </View>
      </View>
    </View>
  </Modal>
);

const DiaryDisplay = props => (
  <View
    style={{
      flex: 3,
      alignItems: 'center',
      justifyContent: 'center',
      width: width * 0.9,
      marginTop: 100,
    }}>
    <View
      style={{
        height: 370,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.creamWhite,
        borderRadius: 10,
        borderColor: colors.black,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
      }}>
      <DiaryDisplayHeader date={props.date} />
      <DiaryTextDisplay
        title={props.title}
        content={props.content}
        onChangeTitleText={props.onChangeTitleText}
        onChangeContentText={props.onChangeContentText}
      />
    </View>
  </View>
);

const DiaryDisplayHeader = props => (
  <View
    style={{
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: width * 0.9,
      borderColor: colors.black,
      borderBottomWidth: 1,
    }}>
    <Text
      style={{
        flex: 8,
        marginLeft: 10,
        fontSize: 20,
        color: colors.redBrown,
        fontFamily: 'MangoDdobak-B',
        includeFontPadding: false,
      }}>
      {moment(props.date).format('YYYY[년] M[월] D[일]').toString()}
    </Text>
  </View>
);

const DiaryTextDisplay = props => (
  <View
    style={{
      flex: 8.5,
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: width * 0.9,
      marginTop: 5,
    }}>
    <View style={{position: 'absolute'}}>
      <NotebookLine />
      <NotebookLine />
      <NotebookLine />
      <NotebookLine />
      <NotebookLine />
      <NotebookLine />
      <NotebookLine />
      <NotebookLine />
      <NotebookLine />
      <NotebookLine />
    </View>
    <View
      style={{
        flexDirection: 'row',
        alignSelf: 'flex-end',
        width: width * 0.9 - 2,
      }}>
      <Text
        style={{
          fontSize: 14,
          fontFamily: 'MangoDdobak-B',
          color: colors.redBrown,
          includeFontPadding: false,
          justifyContent: 'flex-end',
          paddingLeft: 9,
          marginBottom: 1,
          lineHeight: 30,
        }}>
        제목 :
      </Text>
      <TextInput
        multiline={false}
        editable
        textAlignVertical="top"
        onChangeText={props.onChangeTitleText}
        maxLength={20}
        style={{
          fontSize: 14,
          fontFamily: 'MangoDdobak-B',
          color: colors.redBrown,
          includeFontPadding: false,
          justifyContent: 'flex-start',
          paddingRight: 9,
          lineHeight: 30,
          marginVertical: -10,
        }}>
        {props.title}
      </TextInput>
    </View>
    <TextInput
      multiline
      editable
      textAlignVertical="top"
      maxLength={200}
      onChangeText={props.onChangeContentText}
      style={{
        fontSize: 14,
        fontFamily: 'MangoDdobak-R',
        color: colors.redBrown,
        includeFontPadding: false,
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
        width: width * 0.9 - 2,
        lineHeight: 30,
        marginTop: -10,
      }}>
      {props.content}
    </TextInput>
  </View>
);

const NotebookLine = () => (
  <View
    style={{
      height: 30.4,
      width: width * 0.9 - 12,
      borderTopColor: '#0000',
      borderLeftColor: '#0000',
      borderRightColor: '#0000',
      borderBottomColor: colors.gray200,
      borderWidth: 1,
    }}
  />
);
