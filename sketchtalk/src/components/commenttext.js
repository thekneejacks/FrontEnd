import {View, Text, ScrollView} from 'react-native';
import React from 'react';
import colors from '../constants/colors';

const CommentText = ({height = 100, ...props}) => (
  <View
    style={{
      flex: props.flex,
      alignItems: 'flex-start',
      width: props.width * 0.9,
      marginVertical: props.marginVertical,
      paddingRight: 15,
    }}>
    <ScrollView
      fadingEdgeLength={100}
      style={{
        backgroundColor: '#FFF7D7',
        paddingVertical: 7,
        borderTopRightRadius: 18,
        borderBottomRightRadius: 18,
        borderBottomLeftRadius: 18,
        borderColor: colors.black,
        borderWidth: 1,
        width: props.width * 0.63,
        height: height,
      }}>
      {/*<View style={{position: 'absolute', marginLeft: 5, marginTop: 7}}>
        <NotebookLine {...props} />
        <NotebookLine {...props} />
        <NotebookLine {...props} />
      </View>*/}
      <Text
        style={{
          fontSize: 14,
          textAlign: 'left',
          fontFamily: 'MangoDdobak-R',
          includeFontPadding: false,
          paddingHorizontal: 10,
          paddingBottom: 15,
          color: colors.redBrown,
          lineHeight: 25,
        }}>
        {props.text}
      </Text>
    </ScrollView>
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

export default CommentText;
