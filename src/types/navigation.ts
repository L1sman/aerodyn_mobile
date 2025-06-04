import { NavigatorScreenParams } from '@react-navigation/native';
import { Delivery, VehicleModel, ServiceType, PackageType } from './delivery';
import { Service } from './api';

export type MainTabParamList = {
  Deliveries: undefined;
  Map: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  CreateDelivery: undefined;
  EditDelivery: { deliveryId: string };
  SelectVehicle: { selectedModel?: string; selectedNumber?: string; onSaveKey: string };
  SelectService: { selectedServices?: Service[]; onSaveKey: string };
  ServiceList: { 
    categoryId: string; 
    selectedServices?: Service[]; 
    onSaveKey: string;
    categoryServices: Service[];
  };
  SelectPackage: { selectedPackage?: string; onSaveKey: string };
  Address: { 
    fromLocation?: string;
    toLocation?: string;
    distance?: number;
    onSaveKey: string;
  };
  SelectTime: {
    onSaveKey: string;
    departureDate?: Date;
    departureTime?: string;
    deliveryDate?: Date;
    deliveryTime?: string;
    transitTimeMinutes?: number | null;
    hasManualTransitTime?: boolean;
  };
}; 