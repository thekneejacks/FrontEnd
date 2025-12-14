import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  Dimensions,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import colors from '../../constants/colors';
import ChallengeTask from '../../components/challengeTask';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useQuery} from '@tanstack/react-query';
import {getAchievementList} from '../../api/challenge';
import {getCategoryImage} from '../../constants/challengeIcon';

const {width, height} = Dimensions.get('window');
const TOP = 0;
const GAP = 20;
const CARD_W = (width - GAP * 3) / 2;

export default function ChallengeMainScreen({navigation}) {
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    data: achievements,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['achievementList', filter],
    queryFn: () => getAchievementList(filter),
  });

  const renderItem = ({item}) => (
    <ChallengeTask
      title={item.categoryName}
      image={getCategoryImage(item.categoryName || detail?.item.categoryName)}
      done={item.completed}
      total={item.total}
      completed={item.isCompleted}
      style={{width: CARD_W, marginTop: GAP}}
      onPress={() =>
        navigation.navigate('ChallengeInfo', {
          categoryId: item.categoryId,
          categoryName: item.categoryName,
        })
      }
    />
  );

  return (
    <ImageBackground
      source={require('../../assets/background/green_bg.png')}
      resizeMode="cover"
      style={{
        flex: 1,
        width: width,
        height: height,
        paddingTop: insets.top,
      }}>
      <Image
        source={require('../../assets/logo.png')}
        style={{
          position: 'absolute',
          top: 10 + insets.top,
          left: 10,
          width: 80,
          height: 80,
        }}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>도전과제</Text>

        <Pressable
          style={styles.headerRight}
          hitSlop={8}
          onPress={() => setMenuOpen(prev => !prev)}>
          <Entypo name="menu" size={30} color={colors.redBrown} />
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
                ]}>
                전체
              </Text>
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
                ]}>
                미달성
              </Text>
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
                ]}>
                달성
              </Text>
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
          <Text style={styles.infoText}>도전과제를 불러오지 못했어요. 다시 시도해 주세요.</Text>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={achievements || []}
          keyExtractor={item => String(item.categoryId)}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.column}
          renderItem={renderItem}
          showsVerticalScrollIndicator={true}
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
  logo: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 80,
    height: 80,
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
    color: colors.redBrown,
    fontFamily: 'MangoDdobak-B',
  },
  headerRight: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: GAP,
    paddingBottom: 24,
  },
  column: {
    columnGap: GAP,
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
    shadowOffset: {width: 0, height: 2},
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
