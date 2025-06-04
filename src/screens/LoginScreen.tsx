import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { apiClient } from '../api/client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../store';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { deliveryStore } = useStore();

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      
      console.log('[LoginScreen] Starting login process...');
      
      // Login
      const token = await apiClient.login(username, password);
      console.log('[LoginScreen] Login successful, got token:', token ? 'Yes' : 'No');
      
      // Load deliveries
      console.log('[LoginScreen] Initializing delivery store...');
      await deliveryStore.initialize();
      console.log('[LoginScreen] Delivery store initialized, deliveries count:', deliveryStore.deliveries.length);
      
      // Add a small delay to ensure store is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Log final state before navigation
      console.log('[LoginScreen] Final deliveries count before navigation:', deliveryStore.deliveries.length);
      
      // Navigate to main screen
      navigation.replace('MainTabs', { screen: 'Deliveries' });
    } catch (err) {
      console.error('[LoginScreen] Login error:', err);
      setError('Неверное имя пользователя или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Вход в систему</Text>
        
        <TextInput
          label="Имя пользователя"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
        />

        <TextInput
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading || !username || !password}
          style={styles.button}
        >
          Войти
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(38, 41, 49, 0.3)',
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
  },
  error: {
    color: '#FF453A',
    marginBottom: 16,
    textAlign: 'center',
  },
}); 