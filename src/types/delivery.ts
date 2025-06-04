import { DeliveryStatus } from '../components/DeliveryStatusSelector';
import { CollectorName } from '../components/CollectorNameSelector';
import { Service } from './api';

export type VehicleModel = string | null;

export type ServiceType = string;

export type PackageType = string;

export type TechnicalState = string;

export interface FileInfo {
  name: string;
  uri: string;
  type: string;
}

export interface Delivery {
  id: string;
  vehicleModel: VehicleModel;
  vehicleNumber: string;
  departureTime: Date;
  deliveryTime: Date;
  duration: number;
  distance: number;
  services: Service[];
  packageType: PackageType;
  status: string;
  fromLocation: string;
  toLocation: string;
  collectorName: CollectorName;
  collectorNameDisplay: string;
  collectorComment?: string;
  technicalState: TechnicalState;
  logFile?: FileInfo;
  mediaFile?: FileInfo;
  isProcessed: boolean;
}

export interface IDelivery {
  id: string;
  duration: number;
  distance: number;
  packageType: PackageType;
  status: string;
  technicalState?: string;
  fromLocation: string;
  toLocation: string;
  deliveryTime: Date;
  departureTime: Date;
  services: number[];
}

export interface IDeliveryStore {
  deliveries: Delivery[];
  addDelivery: (formData: FormData) => Promise<void>;
  updateDelivery: (delivery: Delivery) => void;
  deleteDelivery: (id: string) => void;
  processDelivery: (id: string, updatedFields?: Partial<Delivery>) => Promise<void>;
  unprocessDelivery: (id: string) => Promise<void>;
  setCallbackResult: (key: string, result: any) => void;
  getCallbackResult: (key: string) => any;
  clearCallbackResult: (key: string) => void;
  setDraft: (draft: Partial<Delivery>) => void;
  getDraft: () => Partial<Delivery> | null;
  clearDraft: () => void;
}

export interface ServiceCategory {
  id: string;
  title: string;
  services: ServiceType[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'to_client',
    title: 'До клиента',
    services: ['Услуга 1', 'Услуга 2', 'Услуга 3', 'Услуга 4', 'Услуга 5', 'Услуга 6', 'Услуга 7', 'Услуга 8']
  },
  {
    id: 'warehouse',
    title: 'Перемещение между складами',
    services: ['Услуга 1', 'Услуга 2', 'Услуга 3', 'Услуга 4', 'Услуга 5', 'Услуга 6', 'Услуга 7', 'Услуга 8']
  },
  {
    id: 'individual',
    title: 'Физ.лицо',
    services: ['Услуга 1', 'Услуга 2', 'Услуга 3', 'Услуга 4', 'Услуга 5', 'Услуга 6', 'Услуга 7', 'Услуга 8']
  },
  {
    id: 'legal',
    title: 'Юр.лицо',
    services: ['Услуга 1', 'Услуга 2', 'Услуга 3', 'Услуга 4', 'Услуга 5', 'Услуга 6', 'Услуга 7', 'Услуга 8']
  },
  {
    id: 'documents',
    title: 'Документы',
    services: ['Услуга 1', 'Услуга 2', 'Услуга 3', 'Услуга 4', 'Услуга 5', 'Услуга 6', 'Услуга 7', 'Услуга 8']
  },
  {
    id: 'medical',
    title: 'Мед.товары',
    services: ['Услуга 1', 'Услуга 2', 'Услуга 3', 'Услуга 4', 'Услуга 5', 'Услуга 6', 'Услуга 7', 'Услуга 8']
  },
  {
    id: 'special',
    title: 'Особые товары',
    services: ['Услуга 1', 'Услуга 2', 'Услуга 3', 'Услуга 4', 'Услуга 5', 'Услуга 6', 'Услуга 7', 'Услуга 8']
  },
  {
    id: 'other',
    title: 'Другое',
    services: ['Услуга 1', 'Услуга 2', 'Услуга 3', 'Услуга 4', 'Услуга 5', 'Услуга 6', 'Услуга 7', 'Услуга 8']
  }
];

// Individual services not in categories
export const STANDALONE_SERVICES: ServiceType[] = [
  'Температурный режим',
  'Хрупкий груз'
]; 