import React, { useEffect, useState } from 'react';
import { 
  ImageBackground, 
  Dimensions, 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  StatusBar, 
  Platform,
} from 'react-native';
import colors from '../../constants/colors';
import ConfirmButton from '../../components/confirmbutton';
import Entypo from 'react-native-vector-icons/Entypo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Slider from '@react-native-community/slider';
import { getTtsSetting, updateTtsSetting } from '../../api/setting';

const { width, height } = Dimensions.get('window');
const TOP = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
const GAP = 15;

const VOICE_OPTIONS = [
  { id: "ko-KR-SeoHyeonNeural", label: '서현' },
  { id: "ko-KR-GookMinNeural",  label: '민우' },
  { id: "ko-KR-SunHiNeural",    label: '선하' },
];

export default function TtsSettingScreen({ navigation }) {
  const queryClient = useQueryClient();

  const [voiceType, setVoiceType] = useState("ko-KR-SeoHyeonNeural");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [bgm, setBgm] = useState("CALM"); 

  const { data } = useQuery({
    queryKey: ['ttsSetting'],
    queryFn: getTtsSetting,
    refetchOnWindowFocus: false,
  });

  const SERVER_TO_UI_VOICE = {
    KO_KR_SEOHYEON_NEURAL: 'ko-KR-SeoHyeonNeural',
    KO_KR_GOOKMIN_NEURAL: 'ko-KR-GookMinNeural',
    KO_KR_SUNHI_NEURAL: 'ko-KR-SunHiNeural',
  }

  useEffect(() => {
  if (!data) return;

  const uiVoice = SERVER_TO_UI_VOICE[data.voiceType] || 'ko-KR-SeoHyeonNeural';
  setVoiceType(uiVoice);

  if (data.voiceSpeed != null) {
    const parsed = 
      typeof data.voiceSpeed === 'number'
      ? data.voiceSpeed
      : Number(data.voiceSpeed);

    if (!Number.isNaN(parsed)){
      setVoiceSpeed(Math.min(2.0, Math.max(0.1, parsed)));
    } else {
      setVoiceSpeed(1.0);
    }
    } else {
      setVoiceSpeed(1.0);
    }

    if (data.bgm) {
      setBgm(data.bgm);
    } else {
      setBgm("CALM");
    }
  }, [data]);

  const mutation = useMutation({
  mutationFn: updateTtsSetting,

  onSuccess: (resData) => {
    queryClient.invalidateQueries({ queryKey: ['ttsSetting'] });
    navigation.goBack();
  },

  onError: (error) => {
    console.log('TTS 설정 변경 실패');
  },
});

  const handleSave = () => {
    const safeSpeed = Math.round(Number(voiceSpeed) * 10) / 10;

    const payload = {
      voiceType,
      voiceSpeed: safeSpeed,
      bgm: "CALM",
    }

    if (mutation.isPending) return;

    mutation.mutate(payload);
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

        <Text style={styles.title}>TTS 설정</Text>
      </View>

      <View style={styles.card}>
        <View style={{ height: GAP }} />

        <View style={styles.contentWrap}>
          <View style={[styles.section, styles.voiceSection]}>
            <Text style={styles.sectionTitle}>목소리 선택</Text>

            <View style={styles.voiceRow}>
              {VOICE_OPTIONS.map(option => {
                const selected = voiceType === option.id;
                return (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.voiceButton,
                      selected && styles.voiceButtonSelected,
                    ]}
                    onPress={() => setVoiceType(option.id)}
                    android_ripple={{ color: '#00000014' }}
                  >
                    <Text
                      style={[
                        styles.voiceLabel,
                        selected && styles.voiceLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>읽어주는 속도</Text>

            <View style={styles.sliderRow}>
              <Text style={styles.speedLabel}>0.1배속</Text>
              <Text style={styles.currentSpeedText}>
                {voiceSpeed.toFixed(1)}배속
              </Text>
              <Text style={styles.speedLabel}>2.0배속</Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0.1}
              maximumValue={2.0}
              step={0.1}
              value={Number(voiceSpeed)}
              onValueChange={(val) => {
                const fixed = Math.round(val * 10) / 10;
                setVoiceSpeed(val);
              }}
              tapToSeek
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.gray300}
              thumbTintColor={colors.primary}
            />  
          </View>
        </View>

        <View style={styles.saveBtnWrap}>
          <ConfirmButton
            text="확인"
            color={colors.primary}
            width={width * 0.8}
            marginBottom={10}
            onPress={handleSave}
          />
        </View>
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
  contentWrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 32,
  },
  voiceSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'MangoDdobak-B',
    color: colors.redBrown,
    marginBottom: 12,
  },
  voiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  voiceButton: {
    flex: 1,
    height: 44,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  voiceButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  voiceLabel: {
    fontSize: 16,
    fontFamily: 'MangoDdobak-R',
    color: colors.brown,
  },
  voiceLabelSelected: {
    color: colors.white,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  speedLabel: {
    fontSize: 12,
    fontFamily: 'MangoDdobak-R',
    color: colors.gray500,
  },
  currentSpeedText: {
    fontSize: 14,
    fontFamily: 'MangoDdobak-B',
    color: colors.primary,
  },
  slider: {
    width: '100%',
    height: 50,
  },
  saveBtnWrap: {
    paddingTop: 8,
    marginBottom: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray200,
  },
});