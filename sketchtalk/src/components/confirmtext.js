import { View, Text } from 'react-native';
import React from 'react';
import colors from '../constants/colors';

const ConfirmText = props => (
  <View
    style={{
      flex: props.flex,
      alignItems: 'flex-start',
      width: props.width * 0.9,
      marginVertical: props.marginVertical,
      paddingRight: 65,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
    }}>
    <View
      style={{
        backgroundColor: colors.creamWhite,
        paddingVertical: 7,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderBottomRightRadius: 18,
        elevation: 1,
      }}>
      <Text
        style={{
          fontSize: 16,
          fontFamily: 'MangoDdobak-R',
          textAlign: 'left',
          lineHeight: 25,
          paddingHorizontal: 10,
          marginBottom: 2,
          color: colors.redBrown,
        }}>
        {props.text}
      </Text>
    </View>
  </View>
);

export default ConfirmText;
