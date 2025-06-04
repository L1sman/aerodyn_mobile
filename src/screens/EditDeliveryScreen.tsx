import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Button, useTheme, Text, Switch } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { VehicleModel, ServiceType, PackageType, FileInfo } from '../types/delivery';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditDelivery'>;
type RouteProps = RouteProp<RootStackParamList, 'EditDelivery'>;

interface LocationObject {
  address: string;
  [key: string]: any;
}

const getLocationString = (location: string | LocationObject | undefined | null): string => {
  if (!location) return '';
  if (typeof location === 'string') return location;
  if (typeof location === 'object' && 'address' in location) return location.address;
  return '';
};

// Helper functions for comparing values
const areDatesEqual = (date1: Date, date2: Date) => date1.getTime() === date2.getTime();
const areArraysEqual = (arr1: any[], arr2: any[]) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
};
const areFilesEqual = (file1: FileInfo | null, file2: FileInfo | null | undefined) => {
  if (!file1 && !file2) return true;
  if (!file1 || !file2) return false;
  return file1.name === file2.name && file1.uri === file2.uri && file1.type === file2.type;
};
const areCollectorNamesEqual = (name1: CollectorName, name2: CollectorName) => {
  return name1.surname === name2.surname &&
         name1.firstName === name2.firstName &&
         name1.lastName === name2.lastName;
};

const EditDeliveryScreen: React.FC = observer(() => {
  const { deliveryStore } = useStore();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  
  // Get delivery from store each time to ensure we have latest data
  const delivery = deliveryStore.deliveries.find(d => d.id === route.params?.deliveryId);

  if (!delivery) {
    return null;
  }

  // Keep original delivery values in a ref to prevent unnecessary re-renders
  const originalDelivery = useRef(delivery);

  // Initialize state from delivery
  const [vehicleNumber, setVehicleNumber] = useState(delivery.vehicleNumber);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(delivery.vehicleModel);
  const [selectedServices, setSelectedServices] = useState<Service[]>(delivery.services);
  const [selectedServiceNames, setSelectedServiceNames] = useState<string[]>(delivery.services.map(s => s.name));
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(delivery.packageType);
  const [fromLocation, setFromLocation] = useState<string>(getLocationString(delivery.fromLocation));
  const [toLocation, setToLocation] = useState<string>(getLocationString(delivery.toLocation));
  const [departureTime, setDepartureTime] = useState<Date>(new Date(delivery.departureTime));
  const [deliveryTime, setDeliveryTime] = useState<Date>(new Date(delivery.deliveryTime));
  const [transitTimeMinutes, setTransitTimeMinutes] = useState<number>(delivery.duration);
  const [distance, setDistance] = useState<number>(delivery.distance);
  const [collectorName, setCollectorName] = useState<CollectorName>(delivery.collectorName);
  const [collectorComment, setCollectorComment] = useState(delivery.collectorComment || '');
  const [technicalState, setTechnicalState] = useState<TechnicalState>(delivery.technicalState);
  const [logFile, setLogFile] = useState<FileInfo | null>(delivery.logFile ? {...delivery.logFile} : null);
  const [mediaFile, setMediaFile] = useState<FileInfo | null>(delivery.mediaFile ? {...delivery.mediaFile} : null);
  const [isMediaSelectorVisible, setIsMediaSelectorVisible] = useState(false);
  const [isLogSelectorVisible, setIsLogSelectorVisible] = useState(false);
  const [isTechnicalStateSelectorVisible, setIsTechnicalStateSelectorVisible] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(delivery.status as DeliveryStatus);
  const [isDeliveryStatusSelectorVisible, setIsDeliveryStatusSelectorVisible] = useState(false);
  const [isCollectorNameSelectorVisible, setIsCollectorNameSelectorVisible] = useState(false);
  const [isCommentSelectorVisible, setIsCommentSelectorVisible] = useState(false);
  const [isProcessed, setIsProcessed] = useState(delivery.isProcessed);

  // Update original delivery ref when delivery changes
  useEffect(() => {
    originalDelivery.current = delivery;
  }, [delivery]);

  // Update local state when delivery changes
  useEffect(() => {
    if (delivery) {
      setVehicleNumber(delivery.vehicleNumber);
      setSelectedModel(delivery.vehicleModel);
      setSelectedServices(delivery.services);
      setSelectedServiceNames(delivery.services.map(s => s.name));
      setSelectedPackage(delivery.packageType);
      setFromLocation(getLocationString(delivery.fromLocation));
      setToLocation(getLocationString(delivery.toLocation));
      setDepartureTime(new Date(delivery.departureTime));
      setDeliveryTime(new Date(delivery.deliveryTime));
      setTransitTimeMinutes(delivery.duration);
      setDistance(delivery.distance);
      setCollectorName(delivery.collectorName);
      setCollectorComment(delivery.collectorComment || '');
      setTechnicalState(delivery.technicalState);
      setLogFile(delivery.logFile ? {...delivery.logFile} : null);
      setMediaFile(delivery.mediaFile ? {...delivery.mediaFile} : null);
      setDeliveryStatus(delivery.status as DeliveryStatus);
      setIsProcessed(delivery.isProcessed);
    }
  }, [delivery]);

  const handleTimeSelect = useCallback((
    departureDate: Date, 
    departureTime: string, 
    deliveryDate: Date, 
    deliveryTime: string,
    transitTimeMinutes?: number | null,
    hasManualTransitTime?: boolean
  ) => {
    if (!delivery) return;

    const newDepartureTime = new Date(departureDate);
    const [depHours, depMinutes] = departureTime.match(/\d{2}/g)?.map(Number) || [0, 0];
    newDepartureTime.setHours(depHours, depMinutes);

    const newDeliveryTime = new Date(deliveryDate);
    const [delHours, delMinutes] = deliveryTime.match(/\d{2}/g)?.map(Number) || [0, 0];
    newDeliveryTime.setHours(delHours, delMinutes);

    const duration = hasManualTransitTime && transitTimeMinutes ? 
      transitTimeMinutes : 
      Math.round((newDeliveryTime.getTime() - newDepartureTime.getTime()) / (1000 * 60));

    const updatedDelivery = {
      ...delivery,
      departureTime: newDepartureTime,
      deliveryTime: newDeliveryTime,
      duration
    };

    console.log('Updating delivery with new times:', {
      departureTime: newDepartureTime,
      deliveryTime: newDeliveryTime,
      duration
    });

    deliveryStore.updateDelivery(updatedDelivery);
  }, [delivery, deliveryStore]);

  const handleVehicleSelect = useCallback((model: VehicleModel, number: string) => {
    if (!delivery) return;
    const updatedDelivery = {
      ...delivery,
      vehicleModel: model,
      vehicleNumber: number
    };
    deliveryStore.updateDelivery(updatedDelivery);
  }, [delivery, deliveryStore]);

  const handleServicesSelect = useCallback((services: Service[]) => {
    setSelectedServices(services);
    setSelectedServiceNames(services.map(service => service.name));
  }, []);

  const handlePackageSelect = useCallback((packageType: PackageType) => {
    if (!delivery) return;
    const updatedDelivery = {
      ...delivery,
      packageType
    };
    deliveryStore.updateDelivery(updatedDelivery);
  }, [delivery, deliveryStore]);

  const handleLocationSelect = useCallback((fromLoc: string, toLoc: string, dist: number) => {
    if (!delivery) return;
    const updatedDelivery = {
      ...delivery,
      fromLocation: fromLoc,
      toLocation: toLoc,
      distance: dist
    };
    deliveryStore.updateDelivery(updatedDelivery);
    setFromLocation(fromLoc);
    setToLocation(toLoc);
    setDistance(dist);
  }, [delivery, deliveryStore]);

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

      // Update both local state and delivery store
      setMediaFile(newFile);
      setIsMediaSelectorVisible(false);

      if (delivery) {
        const updatedDelivery = {
          ...delivery,
          mediaFile: newFile,
        };
        deliveryStore.updateDelivery(updatedDelivery);
      }
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
        handleVehicleSelect(vehicleResult.model, vehicleResult.number);
        deliveryStore.clearCallbackResult('vehicle-select');
      }

      const servicesResult = deliveryStore.getCallbackResult('services-select');
      if (servicesResult) {
        handleServicesSelect(servicesResult);
        deliveryStore.clearCallbackResult('services-select');
      }

      const packageResult = deliveryStore.getCallbackResult('package-select');
      if (packageResult) {
        handlePackageSelect(packageResult);
        deliveryStore.clearCallbackResult('package-select');
      }

      const locationResult = deliveryStore.getCallbackResult('location-select');
      if (locationResult) {
        handleLocationSelect(
          locationResult.fromLocation,
          locationResult.toLocation,
          locationResult.distance
        );
        deliveryStore.clearCallbackResult('location-select');
      }

      const timeResult = deliveryStore.getCallbackResult('time-select');
      if (timeResult) {
        console.log('Received time result:', timeResult);
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
  }, [
    navigation,
    deliveryStore,
    handleVehicleSelect,
    handleServicesSelect,
    handlePackageSelect,
    handleLocationSelect,
    handleTimeSelect
  ]);

  const handleProcess = () => {
    if (!delivery) return;

    const updatedDelivery = {
      ...delivery,
      vehicleModel: selectedModel,
      vehicleNumber,
      departureTime,
      deliveryTime,
      duration: transitTimeMinutes,
      distance,
      services: selectedServices,
      packageType: selectedPackage || '',
      fromLocation,
      toLocation,
      collectorName,
      collectorNameDisplay: formatCollectorNameDisplay(collectorName),
      collectorComment,
      technicalState,
      status: deliveryStatus,
      logFile: logFile || undefined,
      mediaFile: mediaFile || undefined,
      isProcessed: true,
    };

    deliveryStore.updateDelivery(updatedDelivery);
    setIsProcessed(true);
  };

  const handleUnprocess = () => {
    if (!delivery) return;

    const updatedDelivery = {
      ...delivery,
      vehicleModel: selectedModel,
      vehicleNumber,
      departureTime,
      deliveryTime,
      duration: transitTimeMinutes,
      distance,
      services: selectedServices,
      packageType: selectedPackage || '',
      fromLocation,
      toLocation,
      collectorName,
      collectorNameDisplay: formatCollectorNameDisplay(collectorName),
      collectorComment,
      technicalState,
      status: deliveryStatus,
      logFile: logFile || undefined,
      mediaFile: mediaFile || undefined,
      isProcessed: false,
    };

    deliveryStore.updateDelivery(updatedDelivery);
    setIsProcessed(false);
  };

  const handleSave = () => {
    if (!delivery) return;

    const updatedDelivery = {
      ...delivery,
      collectorName,
      collectorNameDisplay: formatCollectorNameDisplay(collectorName),
      collectorComment,
      technicalState,
      status: deliveryStatus,
      logFile: logFile || undefined,
      mediaFile: mediaFile || undefined,
    };

    deliveryStore.updateDelivery(updatedDelivery);
    navigation.goBack();
  };

  const handleDelete = () => {
    deliveryStore.deleteDelivery(delivery.id);
    navigation.goBack();
  };

  const renderSectionTitle = (title: string) => (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionDivider} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>№{delivery.vehicleNumber}</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section} pointerEvents={isProcessed ? 'none' : 'auto'}>
          {renderSectionTitle("КУРЬЕР")}
          
          <View style={styles.fieldContainer}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('SelectVehicle', {
                selectedModel: selectedModel || undefined,
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
                            deliveryTime.getMinutes().toString().padStart(2, '0'),
                transitTimeMinutes: transitTimeMinutes,
                hasManualTransitTime: transitTimeMinutes !== null
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
                fromLocation: fromLocation,
                toLocation: toLocation,
                distance: distance
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
                  <Text style={styles.fieldValue}>{distance ? `${distance} км` : 'Не выбрано'}</Text>
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

        <View style={styles.section} pointerEvents={isProcessed ? 'none' : 'auto'}>
          {renderSectionTitle("СТАТУС")}
          
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
                  <Text style={styles.fieldLabel} numberOfLines={1}>Статус доставки</Text>
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
                selectedPackage: selectedPackage || undefined,
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

        <View style={styles.section} pointerEvents={isProcessed ? 'none' : 'auto'}>
          {renderSectionTitle("СБОРЩИК")}
          
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

      <View style={[styles.buttonContainer, { backgroundColor: theme.colors.background }]}>
        {isProcessed ? (
          <Button
            mode="contained"
            onPress={handleUnprocess}
            style={[styles.actionButton, styles.unprocessButton]}
            labelStyle={styles.unprocessButtonText}
          >
            Распровести
          </Button>
        ) : (
          <>
            <Button
              mode="contained"
              onPress={handleDelete}
              style={[styles.actionButton, styles.deleteButton]}
              labelStyle={styles.deleteButtonText}
            >
              Удалить
            </Button>

            <Button
              mode="contained"
              onPress={handleProcess}
              style={[
                styles.actionButton,
                styles.processButton,
              ]}
              labelStyle={styles.processButtonText}
            >
              Провести
            </Button>
          </>
        )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 120, // Increased to match header total height (80 + 20 padding)
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120, // Increased total height
    flexDirection: 'row',
    alignItems: 'flex-end', // Align items to bottom of header
    paddingHorizontal: 16,
    paddingBottom: 16, // Bottom padding for content
    paddingTop: 20, // Added top padding for status bar
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
  section: {
    paddingTop: 16,
    marginBottom: 24,
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
  timeSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    width: '100%',
    paddingLeft: 0,
    minHeight: 20,
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
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    paddingBottom: 32, // Increased padding at bottom
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    height: 100, // Increased height
  },
  actionButton: {
    flex: 1,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#ABC7FF',
  },
  deleteButton: {
    backgroundColor: '#FFDAD6',
  },
  saveButtonText: {
    color: '#002F66',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#410002',
    fontSize: 16,
    fontWeight: '600',
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
  bottomPadding: {
    height: 100, // Match the height of buttonContainer
  },
  disabledButton: {
    backgroundColor: '#ABC7FF80', // Adding transparency to show disabled state
  },
  disabledButtonText: {
    color: '#002F6680', // Adding transparency to show disabled state
  },
  processedBadgeContainer: {
    marginLeft: 12,
    alignSelf: 'center',
  },
  processButton: {
    backgroundColor: '#ABC7FF',
  },
  processButtonText: {
    color: '#002F66',
    fontSize: 16,
    fontWeight: '600',
  },
  unprocessButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8E9099',
  },
  unprocessButtonText: {
    color: '#ABC7FF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditDeliveryScreen; 