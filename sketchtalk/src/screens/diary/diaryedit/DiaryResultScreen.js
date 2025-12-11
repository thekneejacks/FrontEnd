import {
  Text,
  View,
  Dimensions,
  ImageBackground,
  Image,
  Pressable,
  PermissionsAndroid,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Feather from 'react-native-vector-icons/Feather';
import colors from '../../../constants/colors';
import styled from 'styled-components';
import {DiaryLoadingScreen} from '../component/DiaryLoadingScreen';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CommentText from '../../../components/commenttext';
import ConfirmButton from '../../../components/confirmbutton';
import Modal from 'react-native-modal';
import moment from 'moment';
import AchievementRow from '../../../components/achievementrow';
import CommentTextDownload from '../../../components/commenttextdownload';
import ViewShot from 'react-native-view-shot';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {useMutation} from '@tanstack/react-query';
import axios from 'axios';
import {synthesizeSpeech} from '../api/DiaryTTS';

const {width, height} = Dimensions.get('window');

function getEmoticon(emotion) {
  if (emotion === 'HAPPY') {
    return require('../../../assets/emotions/emotion_happy.png');
  }
  if (emotion === 'AMAZED') {
    return require('../../../assets/emotions/emotion_amazed.png');
  }
  if (emotion === 'SAD') {
    return require('../../../assets/emotions/emotion_sad.png');
  }
  if (emotion === 'ANGRY') {
    return require('../../../assets/emotions/emotion_angry.png');
  }
  if (emotion === 'ANXIETY') {
    return require('../../../assets/emotions/emotion_anxiety.png');
  }
}

function getEmotionDownloadBackground(emotion) {
  if (emotion === 'HAPPY') {
    return require('../../../assets/background/diary_bg_happy.png');
  }
  if (emotion === 'AMAZED') {
    return require('../../../assets/background/diary_bg_amazed.png');
  }
  if (emotion === 'SAD') {
    return require('../../../assets/background/diary_bg_sad.png');
  }
  if (emotion === 'ANGRY') {
    return require('../../../assets/background/diary_bg_angry.png');
  }
  if (emotion === 'ANXIETY') {
    return require('../../../assets/background/diary_bg_anxiety.png');
  }
}

const achievementDummyData = [
  {title: '축구', description: '축구가 언급되는 일기 작성'},
  {title: '야구', description: '야구가 언급되는 일기 작성'},
  {title: '농구', description: '농구가 언급되는 일기 작성'},
];

export default function DiaryResultScreen({route}) {
  const [tutorialModalVisible, setTutorialModalVisible] = useState(false);
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [downloadEventModalVisible, setDownloadEventModalVisible] =
    useState(false);
  //0: not downloading
  //1: downloading
  //2: download complete
  //3: download failed
  const [downloadStatus, setDownloadStatus] = useState(0);
  const [achievementIndex, setAchievementIndex] = useState(0);
  const captureRef = useRef();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  //API 연결

  /*const {isPending, isError, data, error} =
    !isCalendar && confirmArt
      ? useDiaryConfirmArtFetch(diaryId, image_url)
      : useDiaryViewQueryFetch(diaryId);*/
  const {isCalendar, diaryId} = route.params;
  //const {isPending, isError, data, error} = useDiaryViewQueryFetch(diaryId);

  //뒤로가기
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        isCalendar ? TempNavigateToCalendar() : TempNavigateToHome();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, []),
  );

  //일기 보기
  const ls = require('local-storage');
  const useDiaryViewQueryFetch = useMutation({
    mutationFn: diaryId => {
      const token = ls('token');
      return axios.get(`https://sketch-talk.com/diary/${diaryId}`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onError: error => {
      console.warn('diaryView ' + error);
    },
    onSuccess: data => {
      console.log(data.data.data);
      if (data.data.data.achievedResult !== undefined) {
        setAchievementModalVisible(true);
      }
      if (!isCalendar) {
        synthesizeSpeech(data.data.data.comment);
      }
    },
  });

  useEffect(() => {
    useDiaryViewQueryFetch.mutate(diaryId);
  }, []);

  function TempNavigateToHome() {
    navigation.navigate('TabNavigator');
  }
  function TempNavigateToCalendar() {
    navigation.navigate('TabNavigator', {
      screen: 'CalendarStackNavigator',
      params: {screen: 'CalendarMainScreen', params: {...route.params}},
    });
  }
  function TempNavigateToEditScreen() {
    navigation.navigate('DiaryEditScreen', {
      diaryId: useDiaryViewQueryFetch.data.data.data.diaryId,
      date: useDiaryViewQueryFetch.data.data.data.date,
      title: useDiaryViewQueryFetch.data.data.data.title,
      content: useDiaryViewQueryFetch.data.data.data.content,
      emotion: useDiaryViewQueryFetch.data.data.data.emotion,
      image_url: useDiaryViewQueryFetch.data.data.data.imageUrl,
      ...route.params,
    });
  }

  // 다운로드 기능

  const getPhotoUri = async () => {
    const uri = await captureRef.current.capture();
    console.log('👂👂 Image saved to', uri);
    return uri;
  };

  const downloadDiary = async () => {
    setDownloadStatus(1);
    setDownloadEventModalVisible(true);
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'External Storage Write Permission',
        message: 'App needs write permission',
      },
    );
    if (!status === 'granted') {
      setDownloadStatus(3);
      return;
    }

    const uri = await getPhotoUri();
    const result = await CameraRoll.save(uri);
    console.log('🐤result', result);
    setDownloadStatus(2);
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
      {useDiaryViewQueryFetch.isPending && (
        <DiaryLoadingScreen
          width={width}
          //onPress={() => setIsLoading(false)}
          loadingText={'또리가 일기를 불러오는 중...'}
        />
      )}
      {useDiaryViewQueryFetch.isError && (
        <DiaryLoadingScreen
          width={width}
          //onPress={() => setIsLoading(false)}
          loadingText={'에러가 발생했어요!'}
        />
      )}
      {useDiaryViewQueryFetch.isSuccess && (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <DiaryDisplay
            item={useDiaryViewQueryFetch.data.data.data}
            date={useDiaryViewQueryFetch.data.data.data.date}
            emoticon={getEmoticon(
              useDiaryViewQueryFetch.data.data.data.emotion,
            )}
            imageUrl={useDiaryViewQueryFetch.data.data.data.imageUrl}
            editOnPress={() => TempNavigateToEditScreen()}
            downloadOnPress={() => downloadDiary()}
            showTutorial={tutorialModalVisible}
            tutorialOnPress={() => setTutorialModalVisible(false)}
          />
          <CharacterCommentDisplay
            commentText={useDiaryViewQueryFetch.data.data.data.comment}
            onPress={
              isCalendar
                ? () => TempNavigateToCalendar()
                : () => TempNavigateToHome()
            }
            isCalendar={isCalendar}
          />
          {useDiaryViewQueryFetch.data.data.data.achievedResult !==
            undefined && (
            <AchievementModal
              isVisible={achievementModalVisible}
              achievementIndex={achievementIndex}
              onBackdropPress={() => {
                useDiaryViewQueryFetch.data.data.data.achievedResult[
                  achievementIndex + 1
                ] !== undefined
                  ? setAchievementIndex(achievementIndex + 1)
                  : setAchievementModalVisible(false);
              }}
            />
          )}
          <ViewShot
            ref={captureRef}
            options={{
              fileName: moment(useDiaryViewQueryFetch.data.data.data.date)
                .format('YYYY[년] M[월] D[일] [그림일기]')
                .toString(),
              format: 'png',
              quality: 0.9,
            }}
            style={{position: 'absolute', marginTop: 2000, marginRight: 0}}>
            <ImageBackground
              style={{
                flex: 1,
                width: width,
                height: height,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={getEmotionDownloadBackground(
                useDiaryViewQueryFetch.data.data.data.emotion,
              )}
              resizeMode="contain">
              <View
                style={{
                  width: width * 0.8,
                  marginLeft: 25,
                  flex: 1,
                }}>
                <DownloadDiaryDisplay
                  item={useDiaryViewQueryFetch.data.data.data}
                  date={useDiaryViewQueryFetch.data.data.data.date}
                  emoticon={getEmoticon(
                    useDiaryViewQueryFetch.data.data.data.emotion,
                  )}
                  imageUrl={useDiaryViewQueryFetch.data.data.data.imageUrl}
                />
                <DownloadCharacterCommentDisplay
                  commentText={useDiaryViewQueryFetch.data.data.data.comment}
                />
              </View>
            </ImageBackground>
          </ViewShot>
          {downloadEventModalVisible && (
            <DownloadEventModal
              isVisible={downloadEventModalVisible}
              downloadStatus={downloadStatus}
              confirmOnPress={() => {
                setDownloadEventModalVisible(false);
                setDownloadStatus(0);
              }}
            />
          )}
        </View>
      )}
    </ImageBackground>
  );
}

const AchievementModal = props => (
  <Modal
    isVisible={props.isVisible}
    statusBarTranslucent={false}
    backdropOpacity={0.9}
    animationInTiming={600}
    animationOutTiming={1}
    backdropTransitionInTiming={600}
    backdropTransitionOutTiming={1}
    onBackdropPress={props.onBackdropPress}
    style={{alignItems: 'center', justifyContent: 'center'}}>
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
      }}>
      <Text
        style={{
          flex: 1,
          color: colors.creamWhite,

          fontFamily: 'MangoDdobak-B',
          fontSize: 24,
          textAlignVertical: 'center',
        }}>
        도전과제 달성!
      </Text>
      <AchievementRow
        width={width}
        color={colors.creamWhite}
        title={achievementDummyData[props.achievementIndex].title}
        description={achievementDummyData[props.achievementIndex].description}
      />
      <Text
        style={{
          flex: 1,
          color: colors.creamWhite,
          fontFamily: 'MangoDdobak-R',
          fontSize: 16,
          textAlignVertical: 'center',
        }}>
        화면을 눌러 계속
      </Text>
    </View>
  </Modal>
);

const CharacterCommentDisplay = props => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <View
      style={{
        flex: 1.5,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <Image
        style={{
          flex: 1,
          marginLeft: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        source={require('../../../assets/character/comment_bear.png')}
      />
      <CommentText flex={2} text={props.commentText} width={width} />
    </View>

    <ConfirmButton
      color={colors.primary}
      text={props.isCalendar ? '달력으로' : '홈으로'}
      onPress={props.onPress}
    />
  </View>
);

const DownloadCharacterCommentDisplay = props => (
  <View
    style={{
      flex: 1,
      width: width * 0.8,
      marginLeft: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 105,
    }}>
    <View
      style={{
        flex: 1.5,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          height: 130,
          marginBottom: 22,
        }}>
        <Image
          style={{
            flex: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          resizeMode="contain"
          source={require('../../../assets/character/comment_bear.png')}
        />
        <Text
          style={{
            flex: 1,
            fontSize: 14,
            color: colors.redBrown,
            fontFamily: 'MangoDdobak-B',
            includeFontPadding: false,
          }}>
          또리의 말
        </Text>
      </View>
      <CommentTextDownload
        flex={2}
        text={props.commentText}
        width={width * 0.75}
        height={120}
      />
    </View>
  </View>
);

const DiaryDisplay = props => (
  <View
    style={{
      flex: 3,
      alignItems: 'center',
      justifyContent: 'center',
      width: width * 0.9,
    }}>
    <View
      style={{
        height: 500,
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
      <DiaryDisplayHeader
        editOnPress={props.editOnPress}
        downloadOnPress={props.downloadOnPress}
        emoticon={props.emoticon}
        date={props.date}
      />
      <DiaryArtDisplay
        imageUrl={props.imageUrl}
        tutorialOnPress={props.tutorialOnPress}
        showTutorial={props.showTutorial}
      />
      <DiaryTextDisplay item={props.item} />
    </View>
  </View>
);

const DownloadDiaryDisplay = props => (
  <View
    style={{
      flex: 10,
      alignItems: 'center',
      justifyContent: 'center',
      width: width * 0.8,
      marginTop: 50,
    }}>
    <View
      style={{
        height: 500,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: width * 0.8,
          marginBottom: 7,
          marginTop: -7,
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            marginLeft: 10,
            marginTop: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              flex: 1.5,
              fontSize: 15,
              color: colors.redBrown,
              fontFamily: 'MangoDdobak-B',
              includeFontPadding: false,
              marginBottom: -1,
            }}>
            {moment(props.date).format('YYYY[년] M[월] D[일]').toString()}
          </Text>
          <View style={{flex: 1, marginTop: 5, marginRight: 15}}>
            <Image
              style={{
                width: 35,
                height: 35,
              }}
              resizeMode="contain"
              source={props.emoticon}
            />
          </View>
        </View>
      </View>
      <View
        style={{
          flex: 3.5,
          justifyContent: 'center',
          alignItems: 'center',
          width: width * 0.7,
          borderColor: colors.black,
        }}>
        <Image
          style={{width: 270, height: 180}}
          resizeMode="contain"
          source={{uri: props.imageUrl}}
        />
        {props.showTutorial && (
          <ButtonTutorialPopup tutorialOnPress={props.tutorialOnPress} />
        )}
      </View>
      <View
        style={{
          flex: 5,
          justifyContent: 'flex-start',
          alignItems: 'center',
          width: width * 0.7,
          marginTop: 5,
        }}>
        <View style={{position: 'absolute'}}>
          <NotebookLine lineWidth={width * 0.8} lineHeight={30} />
          <NotebookLine lineWidth={width * 0.8} lineHeight={30} />
          <NotebookLine lineWidth={width * 0.8} lineHeight={30} />
          <NotebookLine lineWidth={width * 0.8} lineHeight={30} />
          <NotebookLine lineWidth={width * 0.8} lineHeight={30} />
          <NotebookLine lineWidth={width * 0.8} lineHeight={30} />
          <NotebookLine lineWidth={width * 0.8} lineHeight={30} />
        </View>
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'MangoDdobak-B',
            color: colors.redBrown,
            includeFontPadding: false,
            justifyContent: 'flex-start',
            width: width * 0.8 - 2,
            paddingHorizontal: 10,
            lineHeight: 30,
          }}>
          제목 : {props.item.title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'MangoDdobak-R',
            color: colors.redBrown,
            includeFontPadding: false,
            justifyContent: 'flex-start',
            paddingHorizontal: 10,
            width: width * 0.8 - 2,
            lineHeight: 30,
          }}>
          {props.item.content}
        </Text>
      </View>
    </View>
  </View>
);

const DiaryDisplayHeader = props => (
  <View
    style={{
      flex: 1.2,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: width * 0.9,
    }}>
    <View
      style={{
        flex: 4.2,
        flexDirection: 'row',
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text
        style={{
          flex: 2.5,
          fontSize: 20,
          fontFamily: 'MangoDdobak-B',
          color: colors.redBrown,
          includeFontPadding: false,
          marginBottom: -1,
        }}>
        {moment(props.date).format('YYYY[년] M[월] D[일]').toString()}
      </Text>
      <View style={{flex: 1, marginTop: 5}}>
        <Image
          style={{
            width: 50,
            height: 50,
          }}
          resizeMode="contain"
          source={props.emoticon}
        />
      </View>
    </View>
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Pressable style={{flex: 1}} onPress={props.editOnPress}>
        <SimpleLineIcons name="pencil" size={20} color={colors.black} />
      </Pressable>
      <Pressable style={{flex: 1}} onPress={props.downloadOnPress}>
        <Feather name="download" size={22} color={colors.black} />
      </Pressable>
    </View>
  </View>
);

const DiaryArtDisplay = props => (
  <View
    style={{
      flex: 5,
      justifyContent: 'center',
      alignItems: 'center',
      width: width * 0.9,
      borderColor: colors.black,
      borderTopWidth: 1,
      borderBottomWidth: 1,
    }}>
    <Image
      style={{width: width * 0.9, height: 220}}
      //resizeMode="contain"
      source={{uri: props.imageUrl}}
      //source={{uri: 'https://reactnative.dev/img/tiny_logo.png'}}
    />
    {props.showTutorial && (
      <ButtonTutorialPopup tutorialOnPress={props.tutorialOnPress} />
    )}
  </View>
);

const ButtonTutorialPopup = props => (
  <View
    style={{
      position: 'absolute',
      backgroundColor: colors.creamWhite,
      zIndex: 100,
      elevation: 100,
      width: 240,
      height: 110,
      borderColor: colors.black,
      borderWidth: 1,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 90,
      marginLeft: 75,
    }}>
    <View
      style={{
        width: 230,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
      <SimpleLineIcons name="pencil" size={20} color={colors.black} />
      <Text
        style={{
          fontSize: 16,
          fontFamily: 'MangoDdobak-R',
          color: colors.redBrown,
          includeFontPadding: false,
          marginTop: 0,
        }}>
        을 눌러 일기를 수정하거나
      </Text>
    </View>
    <View
      style={{
        width: 230,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
      <Feather name="download" size={20} color={colors.black} />
      <Text
        style={{
          fontSize: 16,
          fontFamily: 'MangoDdobak-R',
          color: colors.redBrown,
          includeFontPadding: false,
          marginTop: 0,
        }}>
        을 눌러 다운로드할 수 있어!
      </Text>
    </View>
    <ConfirmButton
      color={colors.primary}
      height={35}
      width={71}
      flex={1.3}
      fontSize={16}
      text={'확인'}
      onPress={props.tutorialOnPress}
    />
  </View>
);

const DiaryTextDisplay = props => (
  <View
    style={{
      flex: 5,
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
    </View>
    <Text
      style={{
        fontSize: 14,
        fontFamily: 'MangoDdobak-B',
        color: colors.redBrown,
        includeFontPadding: false,
        justifyContent: 'flex-start',
        width: width * 0.9 - 2,
        paddingHorizontal: 10,
        lineHeight: 30,
      }}>
      제목 : {props.item.title}
    </Text>
    <Text
      style={{
        fontSize: 14,
        fontFamily: 'MangoDdobak-R',
        color: colors.redBrown,
        includeFontPadding: false,
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
        width: width * 0.9 - 2,
        lineHeight: 30,
      }}>
      {props.item.content}
    </Text>
  </View>
);

const DownloadEventModal = props => (
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
            {props.downloadStatus === 1 && '다운로드 중...'}
            {props.downloadStatus === 2 && '일기를 다운로드했어요!'}
            {props.downloadStatus === 3 && '저장장치 권한을 허용해 주세요.'}
          </Text>
          <View style={{flex: 1, flexDirection: 'row'}}>
            {props.downloadStatus === 1 && (
              <ActivityIndicator size="large" color={colors.primary} />
            )}
            {props.downloadStatus !== 1 && (
              <ConfirmButton
                color={colors.primary}
                width={138}
                height={37}
                fontSize={14}
                text={'확인'}
                onPress={props.confirmOnPress}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  </Modal>
);

const NotebookLine = ({
  lineWidth = width * 0.9,
  lineHeight = 30.4,
  ...props
}) => (
  <View
    style={{
      height: lineHeight,
      alignSelf: 'center',
      width: lineWidth - 12,
      borderTopColor: '#0000',
      borderLeftColor: '#0000',
      borderRightColor: '#0000',
      borderBottomColor: colors.gray200,
      borderWidth: 1,
    }}
  />
);
