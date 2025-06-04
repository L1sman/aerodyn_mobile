import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { LoginScreen } from '../screens/LoginScreen';
import { MainTabs } from './MainTabs';
import CreateDeliveryScreen from '../screens/CreateDeliveryScreen';
import EditDeliveryScreen from '../screens/EditDeliveryScreen';
import SelectVehicleScreen from '../screens/SelectVehicleScreen';
import SelectServiceScreen from '../screens/SelectServiceScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import SelectPackageScreen from '../screens/SelectPackageScreen';
import AddressScreen from '../screens/AddressScreen';
import SelectTimeScreen from '../screens/SelectTimeScreen';
import { apiClient } from '../api/client';
import { theme } from '../theme';
import { LoadingView } from '../components/LoadingView';
import { store } from '../store';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootStack = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await apiClient.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        // Initialize store if authenticated
        await store.deliveryStore.initialize();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.onSurface,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
          headerBackTitle: undefined,
          headerBackTitleVisible: false,
        }}
        initialRouteName={isAuthenticated ? 'MainTabs' : 'Login'}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ 
            headerShown: false,
            headerBackTitle: undefined,
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="CreateDelivery"
          component={CreateDeliveryScreen}
          options={{
            title: 'Новая доставка',
            headerTransparent: true,
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerBackVisible: true,
            headerBackButtonMenuEnabled: false,
            headerBackTitle: undefined,
            headerBackTitleVisible: false,
            headerTitleStyle: {
              color: '#FFFFFF',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="EditDelivery"
          component={EditDeliveryScreen}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="SelectVehicle"
          component={SelectVehicleScreen}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="SelectService"
          component={SelectServiceScreen}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="ServiceList"
          component={ServiceListScreen}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="SelectPackage"
          component={SelectPackageScreen}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="Address"
          component={AddressScreen}
          options={{ title: 'Адреса и координаты' }}
        />
        <Stack.Screen
          name="SelectTime"
          component={SelectTimeScreen}
          options={{
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 