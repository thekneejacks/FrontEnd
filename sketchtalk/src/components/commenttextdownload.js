import {View, Text} from 'react-native';
import React from 'react';
import colors from '../constants/colors';
import {StyleSheet} from 'react-native';

const CommentTextDownload = ({height = 120, ...props}) => (
  <View
    style={{
      flex: props.flex,
      alignItems: 'flex-start',
      width: props.width * 0.8,
      marginVertical: props.marginVertical,
      paddingRight: 5,
      paddingLeft: 15,
    }}>
    <View
      style={{
        backgroundColor: '#FFF7D7',
        paddingVertical: 7,
        borderTopRightRadius: 18,
        borderBottomRightRadius: 18,
        borderBottomLeftRadius: 18,
        borderColor: colors.creamWhite,

        borderColor: colors.gray400,
        borderWidth: StyleSheet.hairlineWidth,
        height: height,
      }}>
      {/*<View style={{position: 'absolute', marginLeft: 5, marginTop: 7}}>
        <NotebookLine {...props} />
        <NotebookLine {...props} />
        <NotebookLine {...props} />
        <NotebookLine {...props} />
        <NotebookLine {...props} />
        <NotebookLine {...props} />
      </View>*/}

      <Text
        style={{
          fontSize: 12,
          textAlign: 'left',
          fontFamily: 'MangoDdobak-R',
          includeFontPadding: false,
          paddingHorizontal: 10,
          marginBottom: 3,
          color: colors.redBrown,
          lineHeight: 23,
        }}>
        {props.text}
      </Text>
    </View>
  </View>
);

const NotebookLine = props => (
  <View
    style={{
      height: 27,
      width: props.width * 0.6 - 2,
      borderTopColor: '#0000',
      borderLeftColor: '#0000',
      borderRightColor: '#0000',
      borderBottomColor: colors.gray200,
      borderWidth: 1,
    }}
  />
);

export default CommentTextDownload;
