import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import DeliveriesScreen from '../screens/DeliveriesScreen';
import MapScreen from '../screens/MapScreen';
import MoreScreen from '../screens/MoreScreen';

import { MainTabParamList } from '../types/navigation';
import { theme } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: '#262931',
          borderTopWidth: 0,
          height: 130,
          alignItems: 'center',
          flexDirection: 'row',
        },
        tabBarItemStyle: {
          height: 130,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          paddingBottom: 40,
        },
        tabBarIconStyle: {
          marginBottom: -50,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Deliveries"
        component={DeliveriesScreen}
        options={{
          tabBarLabel: 'Доставки',
          tabBarIcon: ({ color, size }) => (
            <Icon name="truck-delivery" size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Карта',
          tabBarIcon: ({ color, size }) => (
            <Icon name="map" size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarLabel: 'Еще',
          tabBarIcon: ({ color, size }) => (
            <Icon name="menu" size={26} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 