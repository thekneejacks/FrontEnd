import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import colors from '../constants/colors';

function InputField({
  label,
  style,
  inputStyle,
  keyboardType,
  onChangeText,
  rightButtonText,
  onRightPress, // 우측 버튼
  helperText,
  helperVisible,
  helperStatus, // 중복확인 멘트
  line = 1,
  ...props
}) {
  // 키보드 제한
  const handleChangeText = text => {
    let filtered = text;
    if (
      keyboardType === 'numeric' ||
      keyboardType === 'number-pad' ||
      keyboardType === 'phone-pad'
    ) {
      // 숫자
      filtered = text.replace(/[^0-9]/g, '');
    } else if (keyboardType === 'ascii-capable') {
      //영어 + 숫자만
      filtered = text.replace(/[^0-9a-zA-Z]/g, '');
    }
    onChangeText?.(filtered);
  };

  const hasRightButton = !!rightButtonText;
  const helperColor = {
    default: 'transparent',
    error: colors.gray400,
    success: colors.primary,
  }[helperStatus];

  const isMultiline = line > 1;

  return (
    <View style={style}>
      {label || (helperVisible && helperText) ? (
        <View style={styles.labelRow}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {helperVisible && helperText ? (
            <Text style={[styles.helper, {color: helperColor}]}>
              {helperText}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.container, { height: 63 * line }]}>
        <TextInput
          style={[
            styles.input,
            hasRightButton && {paddingRight: 110},
            isMultiline && {
              textAlignVertical: 'top',
              height: '100%',
            },
            inputStyle,
          ]}
          placeholderTextColor={colors.gray400}
          keyboardType={keyboardType || 'ascii-capable'}
          onChangeText={handleChangeText}
          autoCapitalize="none" // 대문자 방지
          autoCorrect={false} // 자동교정 해지
          multiline={isMultiline}
          numberOfLines={line}
          {...props}
        />

        {hasRightButton && (
          <TouchableOpacity
            style={styles.rightBtn}
            onPress={onRightPress}
            activeOpacity={0.8}>
            <Text style={styles.rightBtnText}>{rightButtonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 15,
    paddingHorizontal: 15,
    justifyContent: 'center',
    backgroundColor: colors.gray100,
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'MangoDdobak-B',
    color: colors.redBrown,
    marginBottom: 5,
  },

  input: {
    fontSize: 16,
    fontFamily: 'MangoDdobak-R',
    color: colors.redBrown,
    padding: 0,
  },
  // btn
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  helper: {
    fontSize: 12,
    fontFamily: 'MangoDdobak-R',
    color: colors.gray300,
  },
  rightBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
    bottom: 10,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 38,
    backgroundColor: colors.primary,
    minWidth: 84,
  },
  rightBtnText: {
    color: colors.white,
    fontFamily: 'MangoDdobak-R',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default InputField;
