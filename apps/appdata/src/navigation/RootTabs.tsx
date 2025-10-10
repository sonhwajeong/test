import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/HomeScreen';
import { CartScreen } from '../screens/CartScreen';
import { StoresScreen } from '../screens/StoresScreen';
import { MyPageScreen } from '../screens/MyPageScreen';

const Tab = createBottomTabNavigator();

const TabIcon: React.FC<{ focused: boolean; name: string }> = ({ focused, name }) => {
  const getIcon = (tabName: string) => {
    switch (tabName) {
      case 'Home':
        return '🏠';
      case 'Cart':
        return '🛒';
      case 'Stores':
        return '🗺️';
      case 'MyPage':
        return '👤';
      default:
        return '📱';
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20 }}>{getIcon(name)}</Text>
      <Text
        style={{
          fontSize: 10,
          color: focused ? '#007bff' : '#666',
          marginTop: 2,
          textAlign: 'center'
        }}
      >
        {name === 'Home' ? '홈' : name === 'Cart' ? '장바구니' : name === 'Stores' ? '매장찾기' : '마이페이지'}
      </Text>
    </View>
  );
};

export const RootTabs: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} name={route.name} />
        ),
        tabBarLabel: () => null,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Stores"
        component={StoresScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};