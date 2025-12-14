import React, {useEffect, useRef, useCallback, useMemo} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  BackHandler,
  Platform,
  StyleSheet,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import colors from '../constants/colors';

export default function Popup({
  visible,
  message,
  primary,
  secondary,
  onClose,
  dismissible = true,
}) {
  const showTwoButtons = !!secondary;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  // Android 백버튼 처리
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (dismissible) onClose?.();
      return true;
    });
    return () => sub.remove();
  }, [visible, dismissible, onClose]);

  // 등장/퇴장 애니메이션
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {toValue: 1, duration: 150, useNativeDriver: true}),
        Animated.spring(scale, {toValue: 1, friction: 8, tension: 90, useNativeDriver: true}),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {toValue: 0, duration: 120, useNativeDriver: true, easing: Easing.out(Easing.quad)}),
        Animated.timing(scale, {toValue: 0.95, duration: 120, useNativeDriver: true}),
      ]).start();
    }
  }, [visible]);

  // 버튼 공통
  const Button = useCallback(({text, onPress, variant = 'primary'}) => {
    const bg = {
      primary: colors.primary,
      danger: '#E05656',
      gray: colors.gray300 ?? '#D9D9D9',
    }[variant];
    const txt = variant === 'gray' ? colors.gray700 ?? '#555' : colors.white;

    return (
      <Pressable
        onPress={onPress}
        style={({pressed}) => [
          styles.btn,
          {backgroundColor: bg, opacity: pressed ? 0.8 : 1},
        ]}
      >
        <Text style={[styles.btnText, {color: txt}]}>{text || '확인'}</Text>
      </Pressable>
    );
  }, []);

  const onBackdropPress = useCallback(() => {
    if (dismissible) onClose?.();
  }, [dismissible, onClose]);

  const content = useMemo(() => (
    <Animated.View style={[styles.card, {transform: [{scale}]}]}>

      <Pressable onPress={onClose} style={styles.closeBtn}>
        <Entypo name="cross" size={24} color={colors.redBrown ?? '#777'} />
      </Pressable>

      {typeof message === 'string'
        ? <Text style={styles.message}>{message}</Text>
        : <View style={{marginTop: 8}}>{message}</View>}

      {showTwoButtons ? (
        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Button
              text={secondary?.text || '취소'}
              onPress={secondary?.onPress || onClose}
              variant={secondary?.variant || 'gray'}
            />
          </View>
          <View style={{width: 12}}/>
          <View style={{flex: 1}}>
            <Button
              text={primary?.text || '확인'}
              onPress={primary?.onPress}
              variant={primary?.variant || 'primary'}
            />
          </View>
        </View>
      ) : (
        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Button
              text={primary?.text || '확인'}
              onPress={primary?.onPress || onClose}
              variant={primary?.variant || 'primary'}
            />
          </View>
        </View>
      )}
    </Animated.View>
  ), [Button, message, onClose, primary, secondary, showTwoButtons, scale]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent={Platform.OS === 'android'}
      onRequestClose={() => { if (dismissible) onClose?.(); }}
    >
      <Animated.View style={[styles.backdrop, {opacity}]}>
        <Pressable style={{flex: 1}} onPress={onBackdropPress}/>
      </Animated.View>

      <View style={styles.center}>{content}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 35,
    paddingHorizontal: 30,
    alignItems: 'center',
    elevation: 12,
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.redBrown,
    fontFamily: 'MangoDdobak-B',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    height: 42,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
    fontFamily: 'MangoDdobak-R',
    color: colors.white,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
  },
});
