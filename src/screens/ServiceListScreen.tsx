import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../store';
import { Service } from '../types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ServiceList'>;
type RouteProps = RouteProp<RootStackParamList, 'ServiceList'>;

const ServiceListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { deliveryStore } = useStore();
  const [selectedServices, setSelectedServices] = useState<Service[]>(
    route.params.selectedServices || []
  );

  const categoryServices = route.params.categoryServices || [];
  const categoryTitle = categoryServices[0]?.category?.title || 'Услуги';

  const handleServicePress = (service: Service) => {
    let newSelectedServices: Service[];
    if (selectedServices.some(s => s.id === service.id)) {
      newSelectedServices = selectedServices.filter(s => s.id !== service.id);
    } else {
      newSelectedServices = [...selectedServices, service];
    }
    
    setSelectedServices(newSelectedServices);
    if (route.params.onSaveKey) {
      deliveryStore.setCallbackResult(route.params.onSaveKey, newSelectedServices);
      navigation.setParams({ 
        ...route.params,
        selectedServices: newSelectedServices 
      });
    }
  };

  // Add back button handler to save selections
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (route.params.onSaveKey) {
        deliveryStore.setCallbackResult(route.params.onSaveKey, selectedServices);
      }
    });

    return unsubscribe;
  }, [navigation, selectedServices, route.params.onSaveKey, deliveryStore]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <Text 
          style={styles.headerTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {categoryTitle}
        </Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.grid}>
          {categoryServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                { backgroundColor: '#262931' },
                selectedServices.some(s => s.id === service.id) && styles.selectedCard
              ]}
              onPress={() => handleServicePress(service)}
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
    flex: 1,
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
});

export default ServiceListScreen; 