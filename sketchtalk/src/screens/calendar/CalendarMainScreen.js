import {React, useState, useCallback} from 'react';
import {
  ImageBackground,
  Dimensions,
  Text,
  View,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styled from 'styled-components/native';
import colors from '../../constants/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import moment from 'moment';
import MonthPicker from 'react-native-month-year-picker';
import Modal from 'react-native-modal';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import 'moment/locale/ko';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {useCalendarViewQueryFetch} from './api/CalendarFetch';
import {useListViewQueryFetch} from './api/CalendarFetch';
import {useMutation} from '@tanstack/react-query';

import axios from 'axios';

/*function getEmoticon(emotion) {
  if (emotion.localeCompare('happy') === 1) {
    console.log('got ' + emotion);
    return require('../../assets/emotions/emotion_happy.png');
  }
  if (emotion.localeCompare('amazed') === 1) {
    return require('../../assets/emotions/emotion_amazed.png');
  }
  if (emotion.localeCompare('sad') === 1) {
    return require('../../assets/emotions/emotion_sad.png');
  }
  if (emotion.localeCompare('angry') === 1) {
    return require('../../assets/emotions/emotion_angry.png');
  }
  if (emotion.localeCompare('anxiety') === 1) {
    return require('../../assets/emotions/emotion_anxiety.png');
  }
}*/

function getEmoticon(emotion) {
  if (emotion === 'HAPPY') {
    return require('../../assets/emotions/emotion_happy.png');
  }
  if (emotion === 'AMAZED') {
    return require('../../assets/emotions/emotion_amazed.png');
  }
  if (emotion === 'SAD') {
    return require('../../assets/emotions/emotion_sad.png');
  }
  if (emotion === 'ANGRY') {
    return require('../../assets/emotions/emotion_angry.png');
  }
  if (emotion === 'ANXIETY') {
    return require('../../assets/emotions/emotion_anxiety.png');
  }
}

LocaleConfig.locales['kr'] = {
  monthNames: ['', '', '', '', '', '', '', '', '', '', '', ''],
  monthNamesShort: ['', '', '', '', '', '', '', '', '', '', '', ''],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: "Aujourd'hui",
};
LocaleConfig.defaultLocale = 'kr';

const {width, height} = Dimensions.get('window');

const dummyEmptyData = [
  {
    diaryId: 1,
  },
  {
    diaryId: 2,
  },
  {
    diaryId: 3,
  },
  {
    diaryId: 4,
  },
  {
    diaryId: 5,
  },
  {
    diaryId: 6,
  },
];

export default function CalenderMainScreen({route}) {
  const {calendarDate, calendarListView} = route.params;
  const [date, setDate] = useState(calendarDate);
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const [listView, setListView] = useState(calendarListView);
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const [isDiaryLoading, setIsDiaryLoading] = useState(false);
  const ls = require('local-storage');

  const showPicker = useCallback(value => setShowYearMonthPicker(value), []);

  const onValueChange = useCallback(
    (event, newDate) => {
      const selectedDate = newDate || date;

      showPicker(false);
      setDate(selectedDate);
    },
    [date, showPicker],
  );

  const navigation = useNavigation();
  /*function TempNavigate(diaryDate) {
    navigation.navigate('DiaryResultStackNavigator', {
      screen: 'DiaryResultScreen',
      params: {
        diaryId: '',
        isCalendar: true,
        calendarDate: date,
        calendarListView: listView,
      },
    });
  }*/

  function naviagteToDiary(diaryId) {
    navigation.navigate('DiaryResultStackNavigator', {
      screen: 'DiaryResultScreen',
      params: {
        diaryId: diaryId,
        isCalendar: true,
        calendarDate: date,
        calendarListView: listView,
      },
    });
  }

  const calendarViewQuery = useCalendarViewQueryFetch(date);
  if (calendarViewQuery.isSuccess) {
    console.log(calendarViewQuery.data.data);
  }
  if (calendarViewQuery.isError) {
    console.log(calendarViewQuery.error.message);
  }
  const listViewQuery = useListViewQueryFetch(date);

  //토큰 받기
  const useLoginFetch = useMutation({
    mutationFn: newTodo => {
      return axios.post('https://sketch-talk.com/user/login', newTodo);
    },

    onError: error => {
      console.warn('login' + error);
    },

    onSuccess: data => {
      console.log(data.data.data.accessToken);
      ls('token', data.data.data.accessToken);
    },
  });

  const TempLogin = () => {
    useLoginFetch.mutate({loginId: 'testappleuser3', password: '1234apple'});
  };

  //일기 미리보기
  const useDiaryPreviewFetch = useMutation({
    mutationFn: newTodo => {
      console.log(newTodo);
      const token = ls('token');

      return axios.get(`https://sketch-talk.com/diary/${newTodo}/preview`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    },

    onMutate: () => {
      setIsDiaryLoading(true);
    },
    onError: error => {
      console.warn('preview' + error);
    },

    onSuccess: data => {
      setIsDiaryLoading(false);
      console.log(data.data.data);
      setPreviewVisible(true);
    },
  });

  const PreviewDiary = diaryId => {
    useDiaryPreviewFetch.mutate(diaryId);
  };

  return (
    <Background
      source={require('../../assets/background/blue_bg.png')}
      resizeMode="cover">
      {isDiaryLoading && <LoadDiaryModal isVisible={isDiaryLoading} />}
      <AppLogo />
      <Text
        style={{
          fontSize: 25,
          fontFamily: 'MangoDdobak-B',
          color: colors.redBrown,
          flex: 1,
          textAlignVertical: 'bottom',
        }}>
        달력
      </Text>
      <CalendarNavigator
        date={date}
        //onDatePress={() => showPicker(true)}
        onDatePress={() => TempLogin()}
        onLeftPress={() =>
          setDate(new Date(moment(date).subtract(1, 'months')))
        }
        onRightPress={() => setDate(new Date(moment(date).add(1, 'months')))}
      />
      {showYearMonthPicker && (
        <MonthPicker
          onChange={onValueChange}
          value={new Date(date)}
          locale="ko"
        />
      )}

      {/*       리스트       */}

      {listView && (
        <View style={{flex: 7, width: width}}>
          <FlatList
            contentContainerStyle={{
              alignItems: 'flex-start',
              justifyContent: 'center',
              marginLeft: Math.floor((width - 172 * 2) / 2),
            }}
            keyExtractor={item => item.diaryId}
            fadingEdgeLength={100}
            data={
              listViewQuery.isLoading || listViewQuery.isError
                ? dummyEmptyData
                : listViewQuery.data.data.data
              //dummyData
            }
            renderItem={
              listViewQuery.isLoading || listViewQuery.isError
                ? () => <CalendarListViewEmptyItem />
                : ({item}) => (
                    <CalendarListViewItem
                      {...item}
                      onPress={() => naviagteToDiary(item.diaryId)}
                    />
                  )
            }
            numColumns={2}></FlatList>
          {!listViewQuery.isSuccess && (
            <View
              style={{
                position: 'absolute',
                marginTop: 10,
                width: width,
                height: 1080,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ImageBackground
                source={require('../../assets/character/ellipse.png')}
                style={{
                  width: 280,
                  height: 280,
                  marginBottom: 700,
                  resizeMode: 'contain',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  style={{
                    width: 150,
                    height: 150,
                    resizeMode: 'contain',
                  }}
                  source={
                    listViewQuery.isError
                      ? require('../../assets/character/question_bear.png')
                      : require('../../assets/character/writing_bear.png')
                  }
                />
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: 'MangoDdobak-B',
                    color: colors.redBrown,
                    lineHeight: 31,
                    fontSize: 24,
                  }}>
                  {listViewQuery.isError
                    ? '불러오는 데 실패했어요!'
                    : '로딩중...'}
                </Text>
              </ImageBackground>
            </View>
          )}
          {listViewQuery.isSuccess &&
            listViewQuery.data.data.data.length == 0 && (
              <View
                style={{
                  position: 'absolute',
                  marginTop: 10,
                  width: width,
                  height: 1080,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    width: 280,
                    height: 280,
                    marginBottom: 700,
                    resizeMode: 'contain',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    style={{
                      width: 150,
                      height: 150,
                      resizeMode: 'contain',
                    }}
                    source={require('../../assets/character/bear.png')}
                  />
                  <Text
                    style={{
                      textAlign: 'center',
                      fontFamily: 'MangoDdobak-B',
                      color: colors.redBrown,
                      lineHeight: 31,
                      fontSize: 24,
                    }}>
                    작성한 일기가 없어요!
                  </Text>
                </View>
              </View>
            )}
        </View>
      )}
      {/*       달력        */}
      {!listView && (
        <View style={{flex: 7}}>
          <Calendar
            initialDate={date}
            hideArrows={true}
            disableMonthChange={true}
            customHeaderTitle={<></>} /* 월 숨기기 */
            disableAllTouchEventsForInactiveDays
            hideExtraDays
            style={{
              marginTop: 10,
              width: width * 0.9,
              height: 380,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.18,
              shadowRadius: 1.0,
              elevation: 1,
            }}
            theme={{
              'stylesheet.calendar.header': {
                dayHeader: {
                  fontFamily: 'MangoDdobak-R',
                  fontSize: 14,
                  color: colors.gray300,
                  fontHeight: 31,
                  marginBottom: 20,
                },
              },
            }}
            dayComponent={({date, state}) => {
              function hasDiary() {
                const array = calendarViewQuery.isSuccess
                  ? calendarViewQuery.data.data.data.some(val =>
                      val.date.includes(date.dateString),
                    )
                  : [];
                return array;
              }
              function getDiaryID() {
                const id = calendarViewQuery.data.data.data.find(val =>
                  val.date.includes(date.dateString),
                ).diaryId;
                return id;
              }
              function getDiaryEmoticon() {
                const diary = calendarViewQuery.data.data.data.find(val =>
                  val.date.includes(date.dateString),
                );

                if (diary === undefined) return;
                console.log(diary.emotion);
                return getEmoticon(diary.emotion);
              }
              /*function hasDiary() {
                const array = dummyMarkedDates.some(val =>
                  val.date.includes(date.dateString),
                );
                return array;
              }
              function getDiaryID() {
                const id = dummyMarkedDates.find(val =>
                  val.date.includes(date.dateString),
                ).diaryId;
                return id;
              }*/
              return (
                <CustomDayComponent
                  hasDiary={hasDiary()}
                  date={date}
                  state={state}
                  emoticon={calendarViewQuery.isSuccess && getDiaryEmoticon()}
                  isWaiting={!calendarViewQuery.isSuccess}
                  onPress={() => {
                    PreviewDiary(getDiaryID());
                  }}
                />
              );
            }}
          />
          {!calendarViewQuery.isSuccess && (
            <View
              style={{
                position: 'absolute',
                marginTop: 10,
                width: width * 0.9,
                height: 380,

                backgroundColor: 'rgba(255, 255,255, 0.6)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ImageBackground
                source={require('../../assets/character/ellipse.png')}
                style={{
                  width: 280,
                  height: 280,
                  resizeMode: 'contain',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  style={{
                    width: 150,
                    height: 150,
                    resizeMode: 'contain',
                  }}
                  source={
                    listViewQuery.isError
                      ? require('../../assets/character/question_bear.png')
                      : require('../../assets/character/writing_bear.png')
                  }
                />
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: 'MangoDdobak-B',
                    lineHeight: 31,
                    color: colors.redBrown,
                    fontSize: 24,
                  }}>
                  {listViewQuery.isError
                    ? '불러오는 데 실패했어요!'
                    : '로딩중...'}
                </Text>
              </ImageBackground>
            </View>
          )}
        </View>
      )}
      <SwitchViewButton onPress={() => setListView(!listView)} />
      {!listView && useDiaryPreviewFetch.isSuccess && (
        <CalendarPreviewModal
          //date={moment(new Date()).format('YYYY[년] M[월] D[일]').toString()}
          date={moment(useDiaryPreviewFetch.data.data.data.date)
            .format('YYYY[년] M[월] D[일]')
            .toString()}
          title={useDiaryPreviewFetch.data.data.data.title}
          emoticon={getEmoticon(useDiaryPreviewFetch.data.data.data.emotion)}
          imageUrl={{uri: useDiaryPreviewFetch.data.data.data.imageUrl}}
          isVisible={isPreviewVisible}
          onBackdropPress={() => setPreviewVisible(false)}
          onSwipeComplete={() => {
            setPreviewVisible(false);
            naviagteToDiary(useDiaryPreviewFetch.data.data.data.diaryId);
          }}
        />
      )}
    </Background>
  );
}

const CalendarPreviewModal = props => (
  <Modal
    isVisible={props.isVisible}
    coverScreen={false}
    animationInTiming={200}
    animationOutTiming={1}
    backdropTransitionOutTiming={1}
    backdropTransitionInTiming={1}
    hideModalContentWhileAnimating={true}
    onBackdropPress={props.onBackdropPress}
    onBackButtonPress={props.onBackdropPress}
    swipeDirection="up"
    swipeThreshold={100}
    onSwipeComplete={props.onSwipeComplete}>
    <View
      style={{
        position: 'absolute',
        width: width,
        height: 1770,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: colors.white,
        alignSelf: 'center',
        alignItems: 'center',
        bottom: -1440,
      }}>
      <View
        style={{
          width: width,
          height: 370,
          alignSelf: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            position: 'absolute',
            width: width * 0.4,
            height: 7,
            top: 10,
            backgroundColor: colors.gray200,
            borderRadius: 20,
          }}
        />
        <View
          style={{
            flex: 4,
            top: 40,
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: width * 0.9,
          }}>
          <Image
            style={{
              width: width * 0.9,
              height: 200,
              resizeMode: 'cover',
              borderWidth: 1,
              borderColor: colors.gray400,

              alignSelf: 'center',
            }}
            resizeMode="scale"
            source={props.imageUrl}
          />
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            width: width * 0.9,
            bottom: 30,
          }}>
          <View style={{flex: 3}}>
            <Text
              style={{
                flex: 1,
                fontFamily: 'MangoDdobak-R',
                fontSize: 14,
                color: colors.gray300,
              }}>
              {props.date}
            </Text>
            <Text
              style={{
                flex: 1.5,
                fontFamily: 'MangoDdobak-B',
                color: colors.redBrown,
                fontSize: 20,
              }}
              numberOfLines={1}>
              {props.title}
            </Text>
          </View>
          <Image
            style={{
              flex: 1,
              width: 80,
              height: 80,
              bottom: 6,
              alignSelf: 'center',
            }}
            resizeMode="contain"
            source={
              props.emoticon !== undefined
                ? props.emoticon
                : require('../../assets/emotions/emotion_happy.png')
            }
          />
        </View>
      </View>
    </View>
  </Modal>
);

const CustomDayComponent = props => (
  <View style={{alignItems: 'center', justifyContent: 'center', height: 40}}>
    {props.hasDiary && props.state !== 'disabled' && !props.isWaiting && (
      <Pressable onPress={props.onPress}>
        <Image
          style={{
            width: 50,
            height: 50,
            alignSelf: 'flex-start',
            justifyContent: 'flex-start',
            marginTop: 5,
          }}
          resizeMode="contain"
          source={
            props.emoticon !== undefined
              ? props.emoticon
              : require('../../assets/emotions/emotion_happy.png')
          }></Image>
      </Pressable>
    )}
    {!props.hasDiary && !props.isWaiting && (
      <Text
        style={{
          textAlign: 'center',
          fontFamily: 'MangoDdobak-R',
          lineHeight: 31,
          color: props.state === 'disabled' ? '#FFFFFF00' : colors.black,
          fontSize: 16,
        }}>
        {props.date.day}
      </Text>
    )}
    {props.isWaiting && (
      <Text
        style={{
          textAlign: 'center',
          fontFamily: 'MangoDdobak-R',
          lineHeight: 31,
          color: props.state === 'disabled' ? '#FFFFFF00' : colors.gray300,
          fontSize: 16,
        }}>
        {props.date.day}
      </Text>
    )}
  </View>
);

const SwitchViewButton = props => (
  <View
    style={{
      position: 'absolute',
      right: 20,
      bottom: 20,
      alignSelf: 'flex-end',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
    }}>
    <Pressable
      style={{
        borderRadius: Math.round(158) / 2,
        width: 65,
        height: 65,
        backgroundColor: '#F6BC65',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
      }}
      onPress={props.onPress}>
      <SimpleLineIcons name="menu" size={27} color={colors.white} />
    </Pressable>
  </View>
);

const CalendarListViewItem = item => (
  <Pressable
    style={{
      width: 162,
      height: 182,
      textAlign: 'center',
      marginHorizontal: 5,
      marginVertical: 10,
      backgroundColor: colors.creamWhite,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }}
    onPress={item.onPress}>
    <ImageBackground
      style={{width: 150, height: 129}}
      resizeMode="contain"
      source={require('../../assets/soccer_diary.png')}>
      <Image
        style={{
          width: 50,
          height: 50,
          position: 'absolute',
          alignSelf: 'flex-end',
        }}
        resizeMode="contain"
        source={getEmoticon(item.emotion)}
      />
    </ImageBackground>
    <View style={{width: 162, height: 60}}>
      <Text
        style={{
          height: 25,
          marginLeft: 10,
          alignSelf: 'flex-start',
          fontSize: 12,
          fontFamily: 'MangoDdobak-R',
          includeFontPadding: false,
          color: '#d9d9d9',
        }}>
        {moment(item.date).format('LL').toString()}
      </Text>
      <Text
        style={{
          height: 20,
          marginHorizontal: 10,
          fontFamily: 'MangoDdobak-R',
          color: colors.redBrown,
          includeFontPadding: false,
          alignSelf: 'flex-start',
          fontSize: 15,
        }}
        numberOfLines={1}>
        {item.title}
      </Text>
    </View>
  </Pressable>
);

const CalendarListViewEmptyItem = item => (
  <View
    style={{
      width: 162,
      height: 182,
      textAlign: 'center',
      marginHorizontal: 5,
      marginVertical: 10,
      backgroundColor: colors.creamWhite,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  />
);

const CalendarNavigator = props => (
  <View
    style={{
      flex: 1,
      flexDirection: 'row',

      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Pressable
      style={{flex: 1, alignItems: 'flex-end'}}
      onPress={props.onLeftPress}>
      <Entypo name="triangle-left" size={40} color={'#8B8FDE'} />
    </Pressable>
    <Pressable
      style={{
        flex: 1.5,
      }}
      onPress={props.onDatePress}>
      <Text
        style={{
          fontSize: 25,
          fontFamily: 'MangoDdobak-R',
          color: colors.redBrown,
          includeFontPadding: false,
          textAlign: 'center',
          textAlignVertical: 'top',
        }}>
        {moment(props.date).format('YYYY[년] M[월]').toString()}
      </Text>
    </Pressable>
    <Pressable
      style={{flex: 1, alignItems: 'flex-start'}}
      onPress={props.onRightPress}>
      <Entypo name="triangle-right" size={40} color={'#8B8FDE'} />
    </Pressable>
  </View>
);

const LoadDiaryModal = props => (
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
              color: colors.redBrown,
              includeFontPadding: false,
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

const Background = styled(ImageBackground)`
  flex: 1;
  width: ${width};
  height: ${height};
  justify-content: center;
  align-items: center;
`;

const AppLogo = () => (
  <Image
    source={require('../../assets/logo.png')}
    style={{
      position: 'absolute',
      top: 10,
      left: 10,
      width: 80,
      height: 80,
    }}
  />
);
