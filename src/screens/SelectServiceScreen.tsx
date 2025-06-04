import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../store';
import { apiClient } from '../api/client';
import { Service, ServiceCategory } from '../types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectService'>;
type RouteProps = RouteProp<RootStackParamList, 'SelectService'>;

interface GroupedServices {
  categories: { [key: string]: Service[] };
  standalone: Service[];
}

const SelectServiceScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { deliveryStore } = useStore();
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedServices, setGroupedServices] = useState<GroupedServices>({
    categories: {},
    standalone: []
  });
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  useEffect(() => {
    loadServices();
    // Load selected services from IDs if provided
    if (route.params?.selectedServices) {
      setSelectedServices(route.params.selectedServices);
    }
  }, [route.params?.selectedServices]);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [servicesResponse, categoriesResponse] = await Promise.all([
        apiClient.getServices(),
        apiClient.getServiceCategories()
      ]);

      // Group services by category
      const grouped: GroupedServices = {
        categories: {},
        standalone: []
      };

      servicesResponse.data.forEach(service => {
        if (service.category) {
          const categoryId = service.category.id.toString();
          if (!grouped.categories[categoryId]) {
            grouped.categories[categoryId] = [];
          }
          grouped.categories[categoryId].push(service);
        } else {
          grouped.standalone.push(service);
        }
      });

      setGroupedServices(grouped);
      setCategories(categoriesResponse.data);
    } catch (err) {
      console.error('Failed to load services:', err);
      setError('Не удалось загрузить услуги');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryPress = (categoryId: number) => {
    const categoryServices = groupedServices.categories[categoryId.toString()] || [];
    navigation.navigate('ServiceList', {
      categoryId: categoryId.toString(),
      onSaveKey: route.params?.onSaveKey || '',
      selectedServices,
      categoryServices
    });
  };

  const handleStandaloneServicePress = (service: Service) => {
    let newSelectedServices: Service[];
    if (selectedServices.some(s => s.id === service.id)) {
      newSelectedServices = selectedServices.filter(s => s.id !== service.id);
    } else {
      newSelectedServices = [...selectedServices, service];
    }
    
    setSelectedServices(newSelectedServices);
    if (route.params?.onSaveKey) {
      deliveryStore.setCallbackResult(route.params.onSaveKey, newSelectedServices);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const servicesResult = deliveryStore.getCallbackResult(route.params?.onSaveKey || '');
      if (servicesResult) {
        setSelectedServices(servicesResult);
      }
    });

    return unsubscribe;
  }, [navigation, route.params?.onSaveKey, deliveryStore]);

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
        <TouchableOpacity style={styles.retryButton} onPress={loadServices}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Услуга</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.grid}>
          {categories.map((category) => {
            const categoryServices = groupedServices.categories[category.id.toString()] || [];
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: '#313243' }]}
                onPress={() => handleCategoryPress(category.id)}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.servicesCount}>{categoryServices.length} позиций</Text>
                </View>
                <View style={styles.categoryBottomLine} />
              </TouchableOpacity>
            );
          })}

          {groupedServices.standalone.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                { backgroundColor: '#262931' },
                selectedServices.some(s => s.id === service.id) && styles.selectedCard
              ]}
              onPress={() => handleStandaloneServicePress(service)}
            >
              <View style={styles.cardContent}>
                <Text style={[
                  styles.serviceTitle,
                  selectedServices.some(s => s.id === service.id) && styles.selectedText
                ]}>
                  {service.name}
                </Text>
                <View style={styles.addButton}>
                  <Text style={[
                    styles.addButtonText,
                    selectedServices.some(s => s.id === service.id) && styles.selectedButtonText
                  ]}>
                    {selectedServices.some(s => s.id === service.id) ? 'Выбрано' : 'Добавить'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 60,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  grid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    height: 100,
    borderWidth: 1,
    borderColor: '#666666',
    position: 'relative',
    overflow: 'hidden',
  },
  serviceCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    height: 120,
    backgroundColor: '#262931',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  servicesCount: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  selectedCard: {
    backgroundColor: '#ABC7FF33',
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedText: {
    color: '#ABC7FF',
  },
  addButton: {
    backgroundColor: '#3E4759',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 13,
    color: '#DAE2F9',
  },
  selectedButtonText: {
    color: '#ABC7FF',
  },
  categoryBottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#A8A8FF',
  },
});

export default SelectServiceScreen; 