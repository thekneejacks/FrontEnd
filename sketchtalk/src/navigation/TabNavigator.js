import React, {useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import colors from '../constants/colors';
import HomeScreen from '../screens/home_screen';
import CalendarStackNavigator from './CalendarStackNavigator.js';
import MypageStackNavigator from './MypageStackNavigator.js';
import ChallengeStackNavigator from './ChallengeStackNavigator.js';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Feather from 'react-native-vector-icons/Feather';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {View, Text} from 'react-native';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 69 + insets.bottom,
        },
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <CustomIcon
              focused={focused}
              Icontype={SimpleLineIcons}
              iconName={'pencil'}
              labelName={'홈 화면'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CalendarStackNavigator"
        component={CalendarStackNavigator}
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <CustomIcon
              focused={focused}
              Icontype={Feather}
              iconName="calendar"
              labelName="달력"
            />
          ),
        }}
      />
      <Tab.Screen
        name="ChallengeStackNavigator"
        component={ChallengeStackNavigator}
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <CustomIcon
              focused={focused}
              Icontype={SimpleLineIcons}
              iconName="star"
              labelName="도전과제"
            />
          ),
        }}
      />
      <Tab.Screen
        name="MypageStackNavigator"
        component={MypageStackNavigator}
        options={({route}) => {
          const rn = getFocusedRouteNameFromRoute(route) ?? 'MypageMainScreen';
          const hideOn = [
            'FAQ',
            'AppInfo',
            'ProfileEdit',
            'AlarmSetting',
            'TtsSetting',
            'Question',
          ];
          const hide = hideOn.includes(rn);
          return {
            tabBarStyle: hide
              ? {display: 'none'}
              : {height: 69, paddingBottom: 69 + insets.bottom},
            tabBarShowLabel: false,
            headerShown: false,
            tabBarIcon: ({focused}) => (
              <CustomIcon
                focused={focused}
                Icontype={Feather}
                iconName="user"
                labelName="마이페이지"
              />
            ),
          };
        }}
      />
    </Tab.Navigator>
  );
}

const CustomIcon = props => (
  <View
    style={{
      width: 60,
      height: 40,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      top: props.focused ? 17.5 : 13,
    }}>
    <View
      style={{
        width: props.focused ? 38 : 30,
        height: props.focused ? 38 : 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 13,
        backgroundColor: props.focused ? colors.primary : '#ffffff00',
        bottom: props.focused ? 2 : 0,
      }}>
      <props.Icontype
        name={props.iconName}
        size={16}
        color={props.focused ? colors.white : colors.gray400}
      />
    </View>
    <Text
      style={{
        fontFamily: 'MangoDdobak-R',
        fontSize: 10,
        color: props.focused ? colors.primary : colors.gray400,
      }}>
      {props.labelName}
    </Text>
  </View>
);

export default TabNavigator;
