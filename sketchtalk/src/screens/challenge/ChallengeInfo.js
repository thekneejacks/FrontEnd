import React, { useState } from 'react';
import {View, Text, ImageBackground, Dimensions, StyleSheet, FlatList, Pressable, Platform, StatusBar} from 'react-native';
import colors from '../../constants/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import ChallengeList from '../../components/challengelist';
import { getCategoryImage } from '../../constants/challengeIcon';
import { useQuery } from '@tanstack/react-query';
import { getAchievementDetail } from '../../api/challenge';

const { width, height } = Dimensions.get('window');
const TOP = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

export default function ChallengeInfo({navigation, route}) {
    const { categoryId, categoryName } = route.params || {};

    const safeCategoryId = categoryId ?? 1;

  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);

    const {
        data: detail,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['achievementDetail', safeCategoryId, filter],
        queryFn: () => getAchievementDetail(safeCategoryId, filter),
    });

    const renderItem = ({item}) => (
        <ChallengeList
            title={item.subName}
            subtitle={`'${item.subName}' 언급되는 일기 생성`}
            image={getCategoryImage(item.subName || detail?.item.subName)}
            completed={item.completed}
        />
    );

    const subCategories = detail?.subCategories || [];

    return (
      <ImageBackground
        source={require('../../assets/background/green_bg.png')}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.header}>
            <Pressable style={styles.headerLeft} hitSlop={8} onPress={() => navigation.goBack()}>
                <Entypo name="chevron-thin-left" size={30} color={colors.redBrown} />
            </Pressable>
            
            <Text style={styles.headerTitle}>도전과제</Text>
        
            <Pressable style={styles.headerRight} hitSlop={8} onPress={() => setMenuOpen(prev => !prev)}>
                <Entypo name="menu" size={30} color={colors.redBrown}/>
            </Pressable>
            {menuOpen && (
              <View style={styles.filterMenu}>
                <Pressable
                  style={styles.filterOption}
                  onPress={() => {
                    setFilter('all');
                    setMenuOpen(false);
                  }}>
                  <Text
                    style={[
                      styles.filterOptionText,
                      filter === 'all' && styles.filterOptionTextSelected,
                    ]}>전체</Text>
                </Pressable>
    
                <Pressable
                  style={styles.filterOption}
                  onPress={() => {
                    setFilter('incomplete');
                    setMenuOpen(false);
                  }}>
                  <Text
                    style={[
                      styles.filterOptionText,
                      filter === 'incomplete' && styles.filterOptionTextSelected,
                    ]}>미달성</Text>
                </Pressable>
    
                <Pressable
                  style={styles.filterOption}
                  onPress={() => {
                    setFilter('completed');
                    setMenuOpen(false);
                  }}>
                  <Text
                    style={[
                      styles.filterOptionText,
                      filter === 'completed' && styles.filterOptionTextSelected,
                    ]}>달성</Text>
                </Pressable>
              </View>
            )}            
        </View>

        {isLoading && (
            <View>
              
            </View>
        )}

        {isError && !isLoading && (
            <View>
                <Text style={styles.infoText}>도전과제를 불러오지 못했어요.</Text>
            </View>
        )}

        {!isLoading && !isError && (
            <FlatList
                data={subCategories}
                keyExtractor={(it) => String(it.subId)}
                renderItem={renderItem}
                contentContainerStyle={{paddingBottom : 24, paddingTop : 25}}
                showsVerticalScrollIndicator = {false}
            />
        )}
      </ImageBackground>
    );
}

const styles = StyleSheet.create({
background: {
  flex: 1,
  width: width,
  height: height,
},
header: {
    marginTop: TOP + 35,
    height: 44,
    paddingHorizontal: 16,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
},
headerTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'MangoDdobak-B',
    color: colors.redBrown,
},
headerRight: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
},
headerLeft: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
},
filterMenu: {
    position: 'absolute',
    right: 16,
    top: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
},
filterOption: {
    paddingVertical: 6,
},
filterOptionText: {
    fontSize: 20,
    color: colors.redBrown,
    fontFamily: 'MangoDdobak-R',    
},
filterOptionTextSelected: {
    fontFamily: 'MangoDdobak-B',
    color: colors.redBrown,
    fontSize: 22,
},
infoText:{
    fontSize: 20,
    fontFamily: 'MangoDdobak-R',
    color: colors.redBrown,
},
});