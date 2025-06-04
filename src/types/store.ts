import { Delivery } from './delivery';
import { CreateDeliveryRequest } from './api';

export type CallbackResults = {
  [key: string]: any;
};

export interface IDeliveryStore {
  deliveries: Delivery[];
  isLoading: boolean;
  error: Error | null;
  initialize(): Promise<void>;
  addDelivery(data: FormData): Promise<void>;
  updateDelivery(updatedDelivery: Delivery): void;
  deleteDelivery(id: string): void;
  setCallbackResult(key: string, result: any): void;
  getCallbackResult(key: string): any;
  clearCallbackResult(key: string): void;
} 