import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { Text, useTheme, Searchbar } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PackageType } from '../types/delivery';
import { apiClient } from '../api/client';
import { PackageType as APIPackageType } from '../types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectPackage'>;
type RouteProps = RouteProp<RootStackParamList, 'SelectPackage'>;

const SelectPackageScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { deliveryStore } = useStore();

  const [selectedPackage, setSelectedPackage] = useState<PackageType | undefined>(
    route.params?.selectedPackage
  );
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [packageTypes, setPackageTypes] = useState<APIPackageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPackageTypes();
  }, []);

  const loadPackageTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getPackageTypes();
      setPackageTypes(response.data);
    } catch (err) {
      console.error('Failed to load package types:', err);
      setError('Failed to load package types');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSearch = useCallback(() => {
    setIsSearchVisible(prev => !prev);
    if (!isSearchVisible) {
      setSearchQuery('');
    }
  }, [isSearchVisible]);

  const handleSelect = (packageType: PackageType) => {
    setSelectedPackage(packageType);
    if (route.params?.onSaveKey) {
      deliveryStore.setCallbackResult(route.params.onSaveKey, packageType);
      navigation.goBack();
    }
  };

  const handleScreenPress = useCallback(() => {
    if (isSearchVisible) {
      toggleSearch();
    }
  }, [isSearchVisible, toggleSearch]);

  const filteredPackages = packageTypes.filter(pkg => 
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPackageTypes}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleScreenPress}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          {!isSearchVisible && (
            <Text style={styles.title}>Упаковка</Text>
          )}
          {isSearchVisible ? (
            <View style={styles.searchBarContainer}>
              <Searchbar
                placeholder="Поиск упаковки"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                inputStyle={styles.searchInput}
                iconColor="#FFFFFF"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                onTouchStart={(e) => e.stopPropagation()}
              />
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={toggleSearch}
            >
              <Icon name="magnify" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView>
          <View style={styles.grid}>
            {filteredPackages.map((pkg) => (
              <View key={pkg.id} style={styles.packageCard}>
                <Text style={styles.packageTitle}>{pkg.name}</Text>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    selectedPackage === pkg.name && styles.addedButton
                  ]}
                  onPress={() => handleSelect(pkg.name)}
                >
                  <Text style={styles.buttonText}>
                    {selectedPackage === pkg.name ? 'Добавлено' : 'Добавить'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
    marginLeft: -8,
  },
  searchButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  searchBarContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: -8,
  },
  searchBar: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 10,
    elevation: 0,
  },
  searchInput: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  packageCard: {
    width: '48%', // Almost half width with gap
    backgroundColor: 'transparent',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#666666',
    padding: 15,
    marginBottom: 16,
  },
  packageTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3E4759',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addedButton: {
    backgroundColor: '#666666',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SelectPackageScreen; 