import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { List, useTheme, Text } from 'react-native-paper';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { apiClient } from '../api/client';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MoreScreenContent: React.FC = () => {
  console.log('[MoreScreen] Rendering MoreScreen');
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      // Navigate to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Доп. информация</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Profile"
            left={props => <List.Icon {...props} icon="account" />}
            onPress={() => {}}
          />
          <List.Item
            title="Settings"
            left={props => <List.Icon {...props} icon="cog" />}
            onPress={() => {}}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Support</List.Subheader>
          <List.Item
            title="Help Center"
            left={props => <List.Icon {...props} icon="help-circle" />}
            onPress={() => {}}
          />
          <List.Item
            title="Contact Us"
            left={props => <List.Icon {...props} icon="email" />}
            onPress={() => {}}
          />
          <List.Item
            title="About"
            left={props => <List.Icon {...props} icon="information" />}
            onPress={() => {}}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Legal</List.Subheader>
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            onPress={() => {}}
          />
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document" />}
            onPress={() => {}}
          />
        </List.Section>

        <List.Section>
          <List.Item
            title="Выйти"
            titleStyle={{ color: theme.colors.error }}
            left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
            onPress={handleLogout}
          />
        </List.Section>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
});

const MoreScreen: React.FC = () => {
  return (
    <ErrorBoundary>
      <MoreScreenContent />
    </ErrorBoundary>
  );
};

export default MoreScreen; 