import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isDevice } from 'expo-device';
import {
  TransportModel,
  PackageType,
  ServiceCategory,
  Service,
  DeliveryStatus,
  CargoType,
  Location,
  APIDelivery,
  CreateLocationRequest,
  CreateDeliveryRequest,
  PopulatedDelivery,
  TechnicalCondition
} from '../types/api';

// Use 10.0.2.2 for Android emulator, real IP for physical devices and Expo Go
const BASE_URL = Platform.OS === 'android' && !isDevice
  ? 'http://10.0.2.2:8000'        // Android Emulator
  : 'http://192.168.50.6:8000';   // Physical device or Expo Go
// const BASE_URL = 'http://10.0.2.2:8000';

console.log('Platform:', Platform.OS);
console.log('Is physical device:', isDevice);
console.log('Using BASE_URL:', BASE_URL);

const AUTH_TOKEN_KEY = '@auth_token';

// Create axios instance with detailed error handling
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      return Promise.reject(error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiClient = {
  // Auth
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/api/token/', { 
        username, 
        password 
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const { access, refresh } = response.data;
      
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, access);
      await AsyncStorage.setItem('@refresh_token', refresh);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      return access;
    } catch (error: any) {
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },

  // Transport Models
  getTransportModels: () => api.get<TransportModel[]>('/api/transport-models/'),
  getTransportModel: (id: number) => api.get<TransportModel>(`/api/transport-models/${id}/`),

  // Package Types
  getPackageTypes: () => api.get<PackageType[]>('/api/package-types/'),
  getPackageType: (id: number) => api.get<PackageType>(`/api/package-types/${id}/`),

  // Service Categories
  getServiceCategories: () => api.get<ServiceCategory[]>('/api/service-categories/'),
  getServiceCategory: (id: number) => api.get<ServiceCategory>(`/api/service-categories/${id}/`),

  // Services
  getServices: () => api.get<Service[]>('/api/services/'),
  getService: (id: number) => api.get<Service>(`/api/services/${id}/`),

  // Delivery Statuses
  getDeliveryStatuses: () => api.get<DeliveryStatus[]>('/api/delivery-statuses/'),
  getDeliveryStatus: (id: number) => api.get<DeliveryStatus>(`/api/delivery-statuses/${id}/`),

  // Technical Conditions
  getTechnicalConditions: () => api.get<TechnicalCondition[]>('/api/deliveries/technical_conditions/'),

  // Cargo Types
  getCargoTypes: () => api.get<CargoType[]>('/api/cargo-types/'),
  getCargoType: (id: number) => api.get<CargoType>(`/api/cargo-types/${id}/`),

  // Locations
  getLocations: () => api.get<Location[]>('/api/locations/'),
  getLocation: (id: number) => api.get<Location>(`/api/locations/${id}/`),
  createLocation: (data: CreateLocationRequest) => api.post<Location>('/api/locations/', data),

  // Deliveries
  getDeliveries: async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      const response = await api.get('/api/deliveries/');
      return response;
    } catch (error: any) {
      throw error;
    }
  },
  getDelivery: (id: number) => api.get<PopulatedDelivery>(`/api/deliveries/${id}/`),
  createDelivery: (data: FormData) => api.post<PopulatedDelivery>('/api/deliveries/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateDelivery: (id: number, data: FormData) => api.put<PopulatedDelivery>(`/api/deliveries/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  patchDelivery: (id: number, data: Partial<CreateDeliveryRequest>) => api.patch<PopulatedDelivery>(`/api/deliveries/${id}/`, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  }),
  deleteDelivery: (id: number) => api.delete(`/api/deliveries/${id}/`),
};

export default api; 