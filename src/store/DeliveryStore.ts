import { makeAutoObservable, runInAction, configure } from 'mobx';
import { Delivery, FileInfo } from '../types/delivery';
import { CallbackResults, IDeliveryStore } from '../types/store';
import { apiClient } from '../api/client';
import { APIDelivery, PopulatedDelivery, CreateDeliveryRequest, TransportModel, PackageType, Service, DeliveryStatus, CargoType, Location } from '../types/api';
import { CollectorName } from '../components/CollectorNameSelector';

// Configure MobX
configure({
  enforceActions: 'never',
});

interface CallbackResult {
  [key: string]: any;
}

export class DeliveryStore implements IDeliveryStore {
  deliveries: Delivery[] = [];
  private callbackResults: CallbackResult = {};
  private draft: Partial<Delivery> | null = null;
  isLoading: boolean = false;
  error: Error | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async initialize() {
    this.isLoading = true;
    
    try {
      const isAuthenticated = await apiClient.isAuthenticated();
      
      if (isAuthenticated) {
        await this.loadDeliveries();
      }
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
        this.isLoading = false;
      });
    }
  }

  private getFileNameFromUrl = (url: string): string => {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    if (!fileName) return '';
    return decodeURIComponent(fileName);
  };

  private getFileTypeFromUrl = (url: string): string => {
    const parts = url.split('.');
    const extension = parts[parts.length - 1];
    if (!extension) return 'application/octet-stream';
    
    switch (extension.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  };

  private parseTimeStringToMinutes = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 60 + minutes + (seconds ? Math.round(seconds / 60) : 0);
  };

  private mapAPIToDelivery = async (apiDelivery: PopulatedDelivery): Promise<Delivery> => {
    try {
      console.log('Mapping API delivery:', apiDelivery);

      const logFile: FileInfo | undefined = apiDelivery.logfile ? {
        name: this.getFileNameFromUrl(apiDelivery.logfile),
        uri: apiDelivery.logfile,
        type: this.getFileTypeFromUrl(apiDelivery.logfile)
      } : undefined;

      const mediaFile: FileInfo | undefined = apiDelivery.media_file ? {
        name: this.getFileNameFromUrl(apiDelivery.media_file),
        uri: apiDelivery.media_file,
        type: this.getFileTypeFromUrl(apiDelivery.media_file)
      } : undefined;

      // Safely handle potentially undefined values
      const id = apiDelivery.id?.toString() || '';
      const vehicleModel = apiDelivery.transport_model_details?.name || '';
      const vehicleNumber = apiDelivery.transport_number || '';
      const packageType = apiDelivery.package_type_details?.name || '';
      const services = apiDelivery.services_details || [];
      const status = apiDelivery.status_details?.name || '';
      const fromLocation = apiDelivery.location?.location_from || '';
      const toLocation = apiDelivery.location?.location_to || '';
      const distance = apiDelivery.location ? Number(apiDelivery.location.distance_km) || 0 : 0;
      const departureTime = new Date(apiDelivery.departure_time || new Date());
      const deliveryTime = new Date(apiDelivery.delivery_time || new Date());
      const duration = apiDelivery.travel_time ? this.parseTimeStringToMinutes(apiDelivery.travel_time) : 0;
      const isProcessed = Boolean(apiDelivery.is_processed);

      return {
        id,
        vehicleModel,
        vehicleNumber,
        packageType,
        services,
        status,
        fromLocation,
        toLocation,
        distance,
        departureTime,
        deliveryTime,
        duration,
        collectorName: {
          firstName: apiDelivery.collector_name || '',
          surname: apiDelivery.collector_surname || '',
          lastName: apiDelivery.collector_lastname || ''
        },
        collectorNameDisplay: apiDelivery.collector_surname && apiDelivery.collector_name && apiDelivery.collector_lastname ? 
          `${apiDelivery.collector_surname} ${apiDelivery.collector_name} ${apiDelivery.collector_lastname}` : '',
        collectorComment: apiDelivery.description || '',
        technicalState: apiDelivery.technical_condition || 'Исправно',
        logFile,
        mediaFile,
        isProcessed
      };
    } catch (error) {
      console.error('Error mapping API delivery:', error);
      throw error;
    }
  };

  async loadDeliveries() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await apiClient.getDeliveries();
      runInAction(() => {
        this.deliveries = response.data;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
        this.isLoading = false;
      });
      throw error;
    }
  }

  async addDelivery(data: FormData) {
    try {
      this.isLoading = true;
      this.error = null;

      await apiClient.createDelivery(data);
      
      // Reload all deliveries to get the latest data
      await this.loadDeliveries();
      
    } catch (error) {
      runInAction(() => {
        console.error('Failed to add delivery:', error);
        this.error = new Error('Failed to add delivery');
        this.isLoading = false;
      });
      throw error;
    }
  }

  async updateDelivery(updatedDelivery: Delivery) {
    try {
      this.isLoading = true;
      this.error = null;

      // First, get the IDs for the selected items
      const [transportModelResponse, packageTypeResponse, statusResponse] = await Promise.all([
        apiClient.getTransportModels(),
        apiClient.getPackageTypes(),
        apiClient.getDeliveryStatuses()
      ]);

      const transportModelId = transportModelResponse.data.find(m => m.name === updatedDelivery.vehicleModel)?.id;
      const packageTypeId = packageTypeResponse.data.find(p => p.name === updatedDelivery.packageType)?.id;
      const statusId = statusResponse.data.find(s => s.name === updatedDelivery.status)?.id;

      if (!transportModelId || !packageTypeId || !statusId) {
        throw new Error('Failed to find required IDs for transport model, package type, or status');
      }

      // Calculate travel time in HH:mm:ss format
      const travelTimeHours = Math.floor(updatedDelivery.duration / 60);
      const travelTimeMinutes = updatedDelivery.duration % 60;
      const travelTime = `${String(travelTimeHours).padStart(2, '0')}:${String(travelTimeMinutes).padStart(2, '0')}:00`;

      // Create patch data
      const patchData: Partial<CreateDeliveryRequest> = {
        transport_model_id: transportModelId,
        transport_number: updatedDelivery.vehicleNumber,
        package_type_id: packageTypeId,
        services_ids: updatedDelivery.services.map(s => s.id),
        status_id: statusId,
        technical_condition: updatedDelivery.technicalState,
        location: {
          location_from: updatedDelivery.fromLocation,
          location_to: updatedDelivery.toLocation,
          distance_km: updatedDelivery.distance.toString()
        },
        departure_time: updatedDelivery.departureTime.toISOString(),
        delivery_time: updatedDelivery.deliveryTime.toISOString(),
        travel_time: travelTime,
        description: updatedDelivery.collectorComment || '',
        collector_name: updatedDelivery.collectorName.firstName,
        collector_surname: updatedDelivery.collectorName.surname,
        collector_lastname: updatedDelivery.collectorName.lastName,
        is_processed: updatedDelivery.isProcessed
      };

      await apiClient.patchDelivery(parseInt(updatedDelivery.id), patchData);
      
      // Reload all deliveries to get the latest data
      await this.loadDeliveries();
      
    } catch (error) {
      runInAction(() => {
        console.error('Failed to update delivery:', error);
        this.error = new Error('Failed to update delivery');
        this.isLoading = false;
      });
      throw error;
    }
  }

  async deleteDelivery(id: string) {
    try {
      this.isLoading = true;
      this.error = null;

      await apiClient.deleteDelivery(parseInt(id));
      
      // Reload all deliveries to get the latest data
      await this.loadDeliveries();
      
    } catch (error) {
      runInAction(() => {
        console.error('Failed to delete delivery:', error);
        this.error = new Error('Failed to delete delivery');
        this.isLoading = false;
      });
      throw error;
    }
  }

  setCallbackResult(key: string, result: any) {
    console.log('[DeliveryStore] Setting callback result:', key, result);
    runInAction(() => {
      this.callbackResults[key] = result;
    });
  }

  getCallbackResult(key: string) {
    return this.callbackResults[key];
  }

  clearCallbackResult(key: string) {
    delete this.callbackResults[key];
  }

  setDraft(draft: Partial<Delivery>) {
    console.log('Setting draft:', draft);
    this.draft = draft;
  }

  getDraft(): Partial<Delivery> | null {
    return this.draft;
  }

  clearDraft() {
    this.draft = null;
  }

  async processDelivery(deliveryId: string, updatedFields?: Partial<Delivery>) {
    try {
      const patchData: any = {
        status: 'processed'
      };

      if (updatedFields) {
        if (updatedFields.fromLocation || updatedFields.toLocation || updatedFields.distance !== undefined) {
          patchData.location = {
            location_from: updatedFields.fromLocation || '',
            location_to: updatedFields.toLocation || '',
            distance_km: updatedFields.distance?.toString() || '0'
          };
        }
        if (updatedFields.departureTime) patchData.departure_time = updatedFields.departureTime.toISOString();
        if (updatedFields.deliveryTime) patchData.delivery_time = updatedFields.deliveryTime.toISOString();
        if (updatedFields.duration !== undefined) {
          const hours = Math.floor(updatedFields.duration / 60);
          const minutes = updatedFields.duration % 60;
          patchData.travel_time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        }
        if (updatedFields.collectorComment !== undefined) patchData.description = updatedFields.collectorComment;
        if (updatedFields.collectorName) {
          patchData.collector_name = updatedFields.collectorName.firstName;
          patchData.collector_surname = updatedFields.collectorName.surname;
          patchData.collector_lastname = updatedFields.collectorName.lastName;
        }
        if (updatedFields.technicalState) patchData.technical_condition = updatedFields.technicalState;
      }

      await apiClient.patchDelivery(parseInt(deliveryId), patchData);
      await this.loadDeliveries();
      
    } catch (error) {
      runInAction(() => {
        this.error = new Error('Failed to process delivery');
        this.isLoading = false;
      });
      throw error;
    }
  }

  async unprocessDelivery(deliveryId: string) {
    try {
      this.isLoading = true;
      this.error = null;

      await apiClient.patchDelivery(parseInt(deliveryId), {
        is_processed: false
      });
      
      // Reload all deliveries to get the latest data
      await this.loadDeliveries();
      
    } catch (error) {
      runInAction(() => {
        console.error('Failed to unprocess delivery:', error);
        this.error = new Error('Failed to unprocess delivery');
        this.isLoading = false;
      });
      throw error;
    }
  }
} 