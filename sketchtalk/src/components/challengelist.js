import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import colors from '../constants/colors';

function ChallengeList({
    title,
    subtitle,
    image,
    style,

    completed = false,  // 완료여부
    })  {
    
    const disabled = !completed;

    return(
        <View style = {[
            styles.card,
            disabled ? styles.cardDisabled : styles.cardEnabled,
            style]}>
            {completed && (
                <Image source={require('../assets/challenge/challengeStamp.png')} style={styles.badge} resizeMode="contain" />
            )}

            <View style={styles.left}>
                <Image
                    source={image}
                    resizeMode='contain'
                    style={[styles.icon, disabled && styles.iconDisabled]}
                />
            </View>

            <View style={styles.right}>
                <Text
                    numberOfLines={1}
                    style={[styles.title, disabled&&styles.textDisabled]}
                >{title}</Text>
                <Text
                    numberOfLines={1}
                    style={[styles.subtitle, disabled&&styles.textDisabled]}
                >{subtitle}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingTop: 30,
    elevation: 4,
    marginHorizontal: 16,
    marginBottom: 14,
},
cardEnabled:{
    elavation: 6,
    shadowColor: colors.primary,
    borderRadius: 18,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 6,
},
cardDisabled:{
    elavation: 6,
    shadowColor: colors.gray400,
    borderRadius: 18,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 6,
},
left: {
    width: 84,
    height: 84,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
badge: {
    position: 'absolute',
    top: -25,
    left: -25,
    width: 90,
    height: 90,
    zIndex: 10,
},
icon: {
    width: 100,
    height: 100,
},
iconDisabled: {
    opacity: 0.35,
},
right: {
    flex: 1,
    justifyContent: 'center',
},
title: {
    fontSize: 25,
    fontFamily: 'MangoDdobak-B',
    color: colors.black,
    textAlign: 'center',
},
textDisabled: {
    color: colors.gray300,
},
subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: 'MangoDdobak-R',
    color: colors.black,
    textAlign: 'center',
},
});

export default memo(ChallengeList);