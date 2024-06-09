import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DiaryScreen from './screens/DiaryScreen';
import DiaryDetailScreen from './screens/DiaryDetailScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import ChatScreen from './screens/ChatScreen';

const Tab = createBottomTabNavigator();
const DiaryStack = createStackNavigator();

function DiaryStackScreen() {
  return (
    <DiaryStack.Navigator>
      <DiaryStack.Screen
        name="Diary"
        component={DiaryScreen}
        options={{ headerShown: false }} // 타이틀을 숨기기 위해 옵션 추가
      />
      <DiaryStack.Screen
        name="DiaryDetail"
        component={DiaryDetailScreen}
        options={{ title: 'Diary Detail' }}
      />
    </DiaryStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === '다이어리') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === '채팅') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === '통계') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="다이어리" component={DiaryStackScreen} />
        <Tab.Screen name="채팅" component={ChatScreen} />
        <Tab.Screen name="통계" component={StatisticsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
