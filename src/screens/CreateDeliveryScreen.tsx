import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Button, useTheme, Text, Divider, Switch } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { MainTabParamList, RootStackParamList } from '../types/navigation';
import { VehicleModel, PackageType, FileInfo } from '../types/delivery';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MediaFileSelector from '../components/MediaFileSelector';
import * as DocumentPicker from 'expo-document-picker';
import TechnicalStateSelector, { TechnicalState } from '../components/TechnicalStateSelector';
import TechnicalStateIndicator from '../components/TechnicalStateIndicator';
import DeliveryStatusSelector, { DeliveryStatus, DEFAULT_STATUS } from '../components/DeliveryStatusSelector';
import { StatusBadge } from '../components/DeliveryCard';
import CollectorNameSelector, { CollectorName, formatCollectorNameDisplay } from '../components/CollectorNameSelector';
import CommentSelector, { formatCommentPreview } from '../components/CommentSelector';
import { apiClient } from '../api/client';
import { ApiResponse, Service } from '../types/api';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

const SectionTitle: React.FC<{ title: string }> = ({ title }) => {
  return (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionDivider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 100,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    paddingTop: 16,
  },
  sectionTitleContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  fieldContainer: {
    backgroundColor: 'transparent',
    paddingLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 15,
  },
  button: {
    paddingHorizontal: 16,
    height: 'auto',
    marginLeft: -16,
    justifyContent: 'center',
  },
  buttonContent: {
    height: 'auto',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  buttonValue: {
    fontSize: 15,
    color: '#CCCCCC',
    marginRight: 8,
    textAlign: 'right',
    flex: 1,
  },
  subTextsContainer: {
    marginTop: 4,
    marginLeft: 52,
    marginRight: 16,
  },
  subText: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    height: 100,
  },
  createButton: {
    marginBottom: 0,
  },
  bottomPadding: {
    height: 100,
  },
  timeContainer: {
    flex: 1,
    marginLeft: 12,
    width: '100%',
    paddingRight: 48,
    position: 'relative',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    width: '100%',
  },
  timeSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    width: '100%',
    paddingLeft: 0,
    minHeight: 20,
  },
  timeMainLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    width: 100,
  },
  timeMainValue: {
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'right',
    minWidth: 120,
    marginRight: 24,
  },
  timeLabel: {
    fontSize: 13,
    color: '#666666',
    width: 100,
  },
  timeValue: {
    fontSize: 13,
    color: '#CCCCCC',
    textAlign: 'right',
    minWidth: 120,
    marginRight: 24,
  },
  spacer: {
    flex: 1,
    minWidth: 32,
  },
  chevron: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -12,
  },
  fieldContentContainer: {
    flex: 1,
    marginLeft: 12,
    width: '100%',
    paddingRight: 40,
    position: 'relative',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 24,
  },
  fieldLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    width: 150,
    flexShrink: 1,
  },
  fieldValue: {
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'right',
    minWidth: 120,
    marginRight: 24,
  },
  textInput: {
    flex: 1,
    color: '#CCCCCC',
    fontSize: 15,
    textAlign: 'right',
    paddingVertical: 0,
    minWidth: 120,
    marginRight: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 13,
    color: '#666666',
  },
  switchLabelActive: {
    color: '#FFFFFF',
  },
});

const CreateDeliveryScreen: React.FC = observer(() => {
  const { deliveryStore } = useStore();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedServiceNames, setSelectedServiceNames] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [fromLocation, setFromLocation] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('');
  const [mediaFile, setMediaFile] = useState<FileInfo | null>(null);
  const [departureTime, setDepartureTime] = useState<Date>(new Date());
  const [deliveryTime, setDeliveryTime] = useState<Date>(new Date());
  const [transitTimeMinutes, setTransitTimeMinutes] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [collectorName, setCollectorName] = useState<CollectorName>({ firstName: '', surname: '', lastName: '' });
  const [collectorComment, setCollectorComment] = useState('');
  const [technicalState, setTechnicalState] = useState<TechnicalState>('Исправно');
  const [logFile, setLogFile] = useState<FileInfo | null>(null);
  const [isMediaSelectorVisible, setIsMediaSelectorVisible] = useState(false);
  const [isLogSelectorVisible, setIsLogSelectorVisible] = useState(false);
  const [isTechnicalStateSelectorVisible, setIsTechnicalStateSelectorVisible] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(DEFAULT_STATUS);
  const [isDeliveryStatusSelectorVisible, setIsDeliveryStatusSelectorVisible] = useState(false);
  const [isCollectorNameSelectorVisible, setIsCollectorNameSelectorVisible] = useState(false);
  const [isCommentSelectorVisible, setIsCommentSelectorVisible] = useState(false);

  const handleTimeSelect = useCallback((
    departureDate: Date, 
    departureTime: string, 
    deliveryDate: Date, 
    deliveryTime: string,
    transitTimeMinutes?: number | null,
    hasManualTransitTime?: boolean
  ) => {
    const newDepartureTime = new Date(departureDate);
    const [depHours, depMinutes] = departureTime.match(/\d{2}/g)?.map(Number) || [0, 0];
    newDepartureTime.setHours(depHours, depMinutes);
    setDepartureTime(newDepartureTime);

    const newDeliveryTime = new Date(deliveryDate);
    const [delHours, delMinutes] = deliveryTime.match(/\d{2}/g)?.map(Number) || [0, 0];
    newDeliveryTime.setHours(delHours, delMinutes);
    setDeliveryTime(newDeliveryTime);

    // Store the transit time if it was manually set
    if (hasManualTransitTime && transitTimeMinutes !== null && transitTimeMinutes !== undefined) {
      setTransitTimeMinutes(transitTimeMinutes);
    }
  }, []);

  const handleVehicleSelect = useCallback((model: VehicleModel, number: string) => {
    setSelectedModel(model);
    setVehicleNumber(number);
  }, []);

  const handleServicesSelect = useCallback((services: Service[]) => {
    setSelectedServices(services);
    setSelectedServiceNames(services.map(service => service.name));
  }, []);

  const handlePackageSelect = useCallback((packageType: PackageType) => {
    setSelectedPackage(packageType);
  }, []);

  const handleLocationSelect = useCallback((fromLoc: string, toLoc: string, dist: number) => {
    console.log('Location selected:', { fromLoc, toLoc, dist });
    setFromLocation(fromLoc);
    setToLocation(toLoc);
    setDistance(dist);
  }, []);

  const handleSelectMediaFile = async () => {
    try {
      console.log('Selecting media file...');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      console.log('Document picker result:', result);
      
      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      console.log('Selected file:', file);
      
      const newFile: FileInfo = {
        name: file.name,
        uri: file.uri,
        type: file.mimeType || 'application/octet-stream',
      };
      setMediaFile(newFile);
      setIsMediaSelectorVisible(false);
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const handleSelectLogFile = async () => {
    try {
      console.log('Selecting log file...');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      console.log('Document picker result:', result);
      
      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      console.log('Selected file:', file);
      
      const newFile: FileInfo = {
        name: file.name,
        uri: file.uri,
        type: file.mimeType || 'application/octet-stream',
      };
      setLogFile(newFile);
      setIsLogSelectorVisible(false);
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const vehicleResult = deliveryStore.getCallbackResult('vehicle-select');
      if (vehicleResult) {
        setSelectedModel(vehicleResult.model);
        setVehicleNumber(vehicleResult.number);
        deliveryStore.clearCallbackResult('vehicle-select');
      }

      const servicesResult = deliveryStore.getCallbackResult('services-select');
      if (servicesResult) {
        handleServicesSelect(servicesResult);
        deliveryStore.clearCallbackResult('services-select');
      }

      const packageResult = deliveryStore.getCallbackResult('package-select');
      if (packageResult) {
        setSelectedPackage(packageResult);
        deliveryStore.clearCallbackResult('package-select');
      }

      const locationResult = deliveryStore.getCallbackResult('location-select');
      if (locationResult) {
        console.log('Handling location result:', locationResult);
        setFromLocation(locationResult.fromLocation);
        setToLocation(locationResult.toLocation);
        setDistance(locationResult.distance);
        deliveryStore.clearCallbackResult('location-select');
      }

      const timeResult = deliveryStore.getCallbackResult('time-select');
      if (timeResult) {
        handleTimeSelect(
          timeResult.departureDate,
          timeResult.departureTime,
          timeResult.deliveryDate,
          timeResult.deliveryTime,
          timeResult.transitTimeMinutes,
          timeResult.hasManualTransitTime
        );
        deliveryStore.clearCallbackResult('time-select');
      }
    });

    return unsubscribe;
  }, [navigation, deliveryStore, handleTimeSelect, handleServicesSelect]);

  const handleCreate = async () => {
    if (!selectedModel || !selectedPackage || !fromLocation || !toLocation) {
      console.log('Missing required fields:', {
        selectedModel,
        selectedPackage,
        fromLocation,
        toLocation
      });
      return;
    }

    // Validate delivery time is after departure time
    if (deliveryTime <= departureTime) {
      console.error('Delivery time must be after departure time');
      // You might want to show this error to the user through some UI feedback
      return;
    }

    try {
      // First, get the IDs for the selected items
      const [transportModelResponse, packageTypeResponse, statusResponse] = await Promise.all([
        apiClient.getTransportModels(),
        apiClient.getPackageTypes(),
        apiClient.getDeliveryStatuses()
      ]);

      const transportModelId = transportModelResponse.data.find(m => m.name === selectedModel)?.id;
      const packageTypeId = packageTypeResponse.data.find(p => p.name === selectedPackage)?.id;
      const statusId = statusResponse.data.find(s => s.name === deliveryStatus)?.id;

      if (!transportModelId || !packageTypeId || !statusId) {
        throw new Error('Failed to find required IDs');
      }

      // Format travel time as HH:mm:ss
      const minutes = transitTimeMinutes || Math.round((deliveryTime.getTime() - departureTime.getTime()) / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const travelTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;

      // Create FormData instance
      const formData = new FormData();

      // Add basic fields
      formData.append('transport_model_id', transportModelId.toString());
      formData.append('transport_number', vehicleNumber);
      formData.append('package_type_id', packageTypeId.toString());
      
      // Add services_ids as separate fields
      selectedServices.forEach(service => {
        formData.append('services_ids', service.id.toString());
      });
      
      formData.append('status_id', statusId.toString());
      formData.append('technical_condition', technicalState);

      // Add location fields separately
      formData.append('location.location_from', fromLocation);
      formData.append('location.location_to', toLocation);
      formData.append('location.distance_km', distance?.toString() || "0");

      // Add time-related fields
      formData.append('departure_time', departureTime.toISOString());
      formData.append('delivery_time', deliveryTime.toISOString());
      formData.append('travel_time', travelTime);
      formData.append('description', collectorComment || "");

      // Add collector information
      formData.append('collector_name', collectorName.firstName);
      formData.append('collector_surname', collectorName.surname);
      formData.append('collector_lastname', collectorName.lastName);

      // Add is_processed field
      formData.append('is_processed', 'false');

      // Add files if present
      if (mediaFile) {
        formData.append('media_file', {
          uri: mediaFile.uri,
          type: mediaFile.type,
          name: mediaFile.name
        } as any);
      }

      if (logFile) {
        formData.append('logfile', {
          uri: logFile.uri,
          type: logFile.type,
          name: logFile.name
        } as any);
      }

      console.log('Creating delivery with formData:', formData);
      await deliveryStore.addDelivery(formData);
      navigation.navigate('MainTabs', { screen: 'Deliveries' });
    } catch (error) {
      console.error('Failed to create delivery:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <SectionTitle title="КУРЬЕР" />
          
          <View style={styles.fieldContainer}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('SelectVehicle', {
                selectedModel: selectedModel!,
                selectedNumber: vehicleNumber,
                onSaveKey: 'vehicle-select'
              })}
              contentStyle={styles.buttonContent}
              style={styles.button}
              icon={({ size }) => (
                <Icon name="truck-delivery" size={24} color="#666666" />
              )}
            >
              <View style={styles.fieldContentContainer}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel} numberOfLines={1}>Модель и номер</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.fieldValue}>
                    {selectedModel && vehicleNumber ? `${selectedModel}, №${vehicleNumber}` : 'Не выбрано'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#666666" style={styles.chevron} />
              </View>
            </Button>
            <View style={styles.divider} />
          </View>

          <View style={styles.fieldContainer}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('SelectTime', {
                onSaveKey: 'time-select',
                departureDate: departureTime,
                departureTime: departureTime.getHours().toString().padStart(2, '0') + 
                             departureTime.getMinutes().toString().padStart(2, '0'),
                deliveryDate: deliveryTime,
                deliveryTime: deliveryTime.getHours().toString().padStart(2, '0') + 
                            deliveryTime.getMinutes().toString().padStart(2, '0')
              })}
              contentStyle={styles.buttonContent}
              style={styles.button}
              icon={({ size }) => (
                <Icon name="clock-outline" size={24} color="#666666" />
              )}
            >
              <View style={styles.fieldContentContainer}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel} numberOfLines={1}>Время в пути</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.fieldValue}>
                    {transitTimeMinutes !== null && transitTimeMinutes !== undefined ? 
                      `${Math.floor(transitTimeMinutes / 60)}ч ${transitTimeMinutes % 60}м` : 
                      `${Math.floor((deliveryTime.getTime() - departureTime.getTime()) / (1000 * 60 * 60))}ч ${Math.floor(((deliveryTime.getTime() - departureTime.getTime()) / (1000 * 60)) % 60)}м`}
                  </Text>
                </View>
                <View style={styles.timeSubRow}>
                  <Text style={styles.timeLabel}>Отправка</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.timeValue}>
                    {departureTime.toLocaleDateString('ru-RU')} в {
                      departureTime.getHours().toString().padStart(2, '0')}:{
                      departureTime.getMinutes().toString().padStart(2, '0')}
                  </Text>
                </View>
                <View style={styles.timeSubRow}>
                  <Text style={styles.timeLabel}>Доставка</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.timeValue}>
                    {deliveryTime.toLocaleDateString('ru-RU')} в {
                      deliveryTime.getHours().toString().padStart(2, '0')}:{
                      deliveryTime.getMinutes().toString().padStart(2, '0')}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#666666" style={styles.chevron} />
              </View>
            </Button>
            <View style={styles.divider} />
          </View>

          <View style={styles.fieldContainer}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Address', {
                onSaveKey: 'location-select',
                fromLocation: fromLocation || undefined,
                toLocation: toLocation || undefined,
                distance: distance || undefined
              })}
              contentStyle={styles.buttonContent}
              style={styles.button}
              icon={({ size }) => (
                <Icon name="map-marker-distance" size={24} color="#666666" />
              )}
            >
              <View style={styles.fieldContentContainer}>
                <View style={[styles.fieldRow, { marginBottom: 2 }]}>
                  <Text style={styles.fieldLabel} numberOfLines={1}>Дистанция</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.fieldValue}>
                    {distance ? `${distance} км` : 'Не выбрано'}
                  </Text>
                </View>
                <View style={[styles.timeSubRow, { marginBottom: 2 }]}>
                  <Text style={styles.timeLabel}>Откуда</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.timeValue}>{fromLocation || 'Не указано'}</Text>
                </View>
                <View style={styles.timeSubRow}>
                  <Text style={styles.timeLabel}>Куда</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.timeValue}>{toLocation || 'Не указано'}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#666666" style={styles.chevron} />
              </View>
            </Button>
            <View style={styles.divider} />
          </View>

          <View style={styles.fieldContainer}>
            <Button
              mode="text"
              onPress={() => {
                console.log('Opening media selector');
                setIsMediaSelectorVisible(true);
              }}
              contentStyle={styles.buttonContent}
              style={styles.button}
              icon={({ size }) => (
                <Icon name="file-download" size={24} color="#666666" />
              )}
            >
              <View style={styles.fieldContentContainer}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Медиафайл</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.fieldValue}>
                    {mediaFile ? mediaFile.name : 'Выбрать файл'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#666666" style={styles.chevron} />
              </View>
            </Button>
            <View style={styles.divider} />
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="СТАТУС" />

          <View style={styles.fieldContainer}>
            <Button
              mode="text"
              onPress={() => setIsTechnicalStateSelectorVisible(true)}
              contentStyle={styles.buttonContent}
              style={styles.button}
              icon={({ size }) => (
                <Icon name="cog" size={24} color="#666666" />
              )}
            >
              <View style={styles.fieldContentContainer}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Тех. исправность</Text>
                  <View style={styles.spacer} />
                  <StatusBadge status={technicalState} type="technical" />
                </View>
                <Icon name="chevron-right" size={24} color="#666666" style={styles.chevron} />
              </View>
            </Button>
            <View style={styles.divider} />
          </View>

          <View style={styles.fieldContainer}>
            <Button
              mode="text"
              onPress={() => {
                console.log('Opening log file selector');
                setIsLogSelectorVisible(true);
              }}
              contentStyle={styles.buttonContent}
              style={styles.button}
              icon={({ size }) => (
                <Icon name="file-download" size={24} color="#666666" />
              )}
            >
              <View style={styles.fieldContentContainer}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Файл логирования</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.fieldValue}>
                    {logFile ? logFile.name : 'Выбрать файл'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#666666" style={styles.chevron} />
              </View>
            </Button>
            <View style={styles.divider} />
          </View>

          <View style={styles.fieldContainer}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('SelectService', {
                selectedServices,
                onSaveKey: 'services-select'
              })}
              contentStyle={styles.buttonContent}
              style={styles.button}
              icon={({ size }) => (
                <Icon name="account-outline" size={24} color="#666666" />
              )}
            >
              <View style={styles.fieldContentContainer}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel} numberOfLines={1}>Услуга</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.fieldValue}>
                    {selectedServiceNames.length > 0 
                      ? selectedServiceNames.length > 1 
                        ? `${selectedServiceNames[0]}, ...` 
                        : selectedServiceNames[0]
                      : 'Не выбрано'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#666666" style={styles.chevron} />
              </View>
            </Button>
            <View style={styles.divider} />
          </View>

          <View style={styles.fieldContainer}>
            <Button
              mode="text"
              onPress={() => setIsDeliveryStatusSelectorVisible(true)}
              contentStyle={styles.buttonContent}
              style={styles.button}
              icon={({ size }) => (
                <Icon name="clock-check-outline" size={24} color="#666666" />
              )}
            >
              <View style={styles.fieldContentContainer}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel} numberOfLines={1}>Статус заказа</Text>
                  <View style={styles.spacer} />
                  <StatusBadge status={deliveryStatus} type="status" />
                </View>
                <Icon name="chevron-right" size={24} color="#666666" style={styles.chevron} />
              </View>
            </Button>
            <View style={styles.divider} />
          </View>

          <View style={styles.fieldContainer}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('SelectPackage', {
                selectedPackage: selectedPackage!,
                onSaveKey: 'package-select'
              })}
              contentStyle={styles.buttonContent}
              style={styles.button}
              icon={({ size }) => (
                <Icon name="package-variant" size={24} color="#666666" />
              )}
            >
              <View style={styles.fieldContentContainer}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel} numberOfLines={1}>Упаковка</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.fieldValue}>
                    {selectedPackage || 'Не выбрано'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#666666" style={styles.chevron} />
              </View>
            </Button>
            <View style={styles.divider} />
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="СБОРЩИК" />
          
          <View style={styles.fieldContainer}>
            <Button
              mode="text"
              onPress={() => setIsCollectorNameSelectorVisible(true)}
              contentStyle={styles.buttonContent}
              style={styles.button}
              icon={({ size }) => (
                <Icon name="account" size={24} color="#666666" />
              )}
            >
              <View style={styles.fieldContentContainer}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>ФИО</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.fieldValue}>
                    {formatCollectorNameDisplay(collectorName) || 'Не выбрано'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#666666" style={styles.chevron} />
              </View>
            </Button>
            <View style={styles.divider} />
          </View>

          <View style={styles.fieldContainer}>
            <Button
              mode="text"
              onPress={() => setIsCommentSelectorVisible(true)}
              contentStyle={styles.buttonContent}
              style={styles.button}
              icon={({ size }) => (
                <Icon name="comment-text-outline" size={24} color="#666666" />
              )}
            >
              <View style={styles.fieldContentContainer}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Комментарий</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.fieldValue}>
                    {formatCommentPreview(collectorComment) || 'Не выбрано'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#666666" style={styles.chevron} />
              </View>
            </Button>
            <View style={styles.divider} />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={[styles.buttonWrapper, { backgroundColor: theme.colors.background }]}>
        <Button
          mode="contained"
          onPress={handleCreate}
          disabled={!selectedModel || !selectedPackage || !fromLocation || !toLocation}
          style={styles.createButton}
        >
          Создать
        </Button>
      </View>

      <MediaFileSelector
        isVisible={isMediaSelectorVisible}
        onClose={() => {
          console.log('Closing media selector');
          setIsMediaSelectorVisible(false);
        }}
        onSelectFile={handleSelectMediaFile}
      />

      <MediaFileSelector
        isVisible={isLogSelectorVisible}
        onClose={() => {
          console.log('Closing log selector');
          setIsLogSelectorVisible(false);
        }}
        onSelectFile={handleSelectLogFile}
      />

      <TechnicalStateSelector
        isVisible={isTechnicalStateSelectorVisible}
        onClose={() => setIsTechnicalStateSelectorVisible(false)}
        onSelect={setTechnicalState}
        currentState={technicalState}
      />

      <DeliveryStatusSelector
        isVisible={isDeliveryStatusSelectorVisible}
        onClose={() => setIsDeliveryStatusSelectorVisible(false)}
        onSelect={setDeliveryStatus}
        currentStatus={deliveryStatus}
      />

      <CollectorNameSelector
        isVisible={isCollectorNameSelectorVisible}
        onClose={() => setIsCollectorNameSelectorVisible(false)}
        onSave={setCollectorName}
        currentName={collectorName}
      />

      <CommentSelector
        isVisible={isCommentSelectorVisible}
        onClose={() => setIsCommentSelectorVisible(false)}
        onSave={setCollectorComment}
        currentComment={collectorComment}
      />
    </View>
  );
});

export default CreateDeliveryScreen; 