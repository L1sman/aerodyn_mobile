import { DeliveryStore } from './DeliveryStore';
import { IDeliveryStore } from '../types/store';

class RootStore {
  deliveryStore: IDeliveryStore;

  private static instance: RootStore;

  private constructor() {
    console.log('[Store] Creating store instance');
    this.deliveryStore = new DeliveryStore();
  }

  static getInstance(): RootStore {
    if (!RootStore.instance) {
      RootStore.instance = new RootStore();
    }
    return RootStore.instance;
  }
}

// Export a singleton instance
export const store = RootStore.getInstance();

// Simple hook to access the store
export const useStore = () => {
  return store;
}; 