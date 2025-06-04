import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { useTheme, TextInput } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VehicleModel } from '../types/delivery';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiClient } from '../api/client';
import { TransportModel } from '../types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectVehicle'>;
type RouteProps = RouteProp<RootStackParamList, 'SelectVehicle'>;

const SelectVehicleScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { deliveryStore } = useStore();

  const [model, setModel] = useState<string | undefined>(route.params?.selectedModel);
  const [vehicleNumber, setVehicleNumber] = useState(route.params?.selectedNumber || '');
  const [transportModels, setTransportModels] = useState<TransportModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransportModels();
  }, []);

  const loadTransportModels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getTransportModels();
      setTransportModels(response.data);
    } catch (err) {
      console.error('Failed to load transport models:', err);
      setError('Не удалось загрузить модели транспорта');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if any changes were made
  const hasChanges = useCallback(() => {
    const initialModel = route.params?.selectedModel;
    const initialNumber = route.params?.selectedNumber || '';

    return model !== initialModel || vehicleNumber !== initialNumber;
  }, [model, vehicleNumber, route.params?.selectedModel, route.params?.selectedNumber]);

  const handleSave = () => {
    if (model && vehicleNumber && route.params?.onSaveKey) {
      deliveryStore.setCallbackResult(route.params.onSaveKey, {
        model,
        number: vehicleNumber,
      });
      navigation.goBack();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTransportModels}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <View style={styles.modelSection}>
          <Text style={styles.sectionTitle}>МОДЕЛЬ</Text>
          <View style={styles.divider} />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.chipScrollContainer}
            contentContainerStyle={styles.chipContainer}
          >
            {transportModels.map((transportModel) => (
              <TouchableOpacity
                key={transportModel.id}
                style={[
                  styles.chip,
                  model === transportModel.name && styles.chipSelected
                ]}
                onPress={() => setModel(transportModel.name)}
              >
                <Text style={[
                  styles.chipText,
                  model === transportModel.name && styles.chipTextSelected
                ]}>
                  {transportModel.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.numberSection}>
          <TextInput
            mode="outlined"
            label="Номер"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            style={styles.numberInput}
            theme={{
              colors: {
                primary: '#FFFFFF',
                text: '#FFFFFF',
                placeholder: '#FFFFFF',
                background: '#1C1C1E',
              },
            }}
            outlineColor="#FFFFFF"
            activeOutlineColor="#FFFFFF"
            textColor="#FFFFFF"
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.saveButton,
            (!model || !vehicleNumber || !hasChanges()) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!model || !vehicleNumber || !hasChanges()}
        >
          <Text style={[
            styles.saveButtonText,
            (!model || !vehicleNumber || !hasChanges()) && styles.saveButtonTextDisabled
          ]}>
            Сохранить
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: '#1C1C1E' }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Модель и номер</Text>
        </View>
        
        {renderContent()}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
    marginLeft: -8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
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
  modelSection: {
    marginBottom: 32,
  },
  numberSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
    marginBottom: 12,
  },
  chipScrollContainer: {
    marginHorizontal: -16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  chipTextSelected: {
    color: '#000000',
  },
  numberInput: {
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#0A84FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    opacity: 0.5,
  },
});

export default SelectVehicleScreen; 