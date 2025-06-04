// API Response Types
export interface TransportModel {
  id: number;
  name: string;
}

export interface PackageType {
  id: number;
  name: string;
}

export interface ServiceCategory {
  id: number;
  title: string;
}

export interface Service {
  id: number;
  name: string;
  category: ServiceCategory | null;
}

export interface DeliveryStatus {
  id: number;
  name: string;
}

export interface CargoType {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  location_from: string;
  location_to: string;
  distance_km: string;
}

export interface TechnicalCondition {
  id: number;
  value: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Collector {
  id: number;
  name: string;
  surname: string;
  lastname: string;
}

export interface DeliveryLocation {
  id: number;
  location_from: string;
  location_to: string;
  distance_km: string;
}

export interface APIDelivery {
  id: number;
  transport_model_details: TransportModel;
  transport_number: string | null;
  package_type_details: PackageType;
  services_details: Service[];
  status_details: DeliveryStatus;
  cargo_type_details: CargoType | null;
  technical_condition: string;
  location: DeliveryLocation | null;
  departure_time: string;
  delivery_time: string;
  travel_time: string | null;
  description: string | null;
  media_file: string | null;
  logfile: string | null;
  created_at: string;
  created_by: User | null;
  updated_at: string;
  updated_by: User | null;
  collector_name: string | null;
  collector_surname: string | null;
  collector_lastname: string | null;
  is_processed: boolean;
}

// API Request Types
export interface CreateLocationRequest {
  location_from: string;
  location_to: string;
  distance_km: string;
}

export interface CreateDeliveryRequest {
  transport_model_id: number;
  transport_number: string;
  package_type_id: number;
  services_ids: number[];
  status_id: number;
  technical_condition: string;
  location: {
    location_from: string;
    location_to: string;
    distance_km: string;
  };
  departure_time: string;
  delivery_time: string;
  travel_time: string;
  description: string;
  media_file: string;
  logfile: string;
  collector_name: string;
  collector_surname: string;
  collector_lastname: string;
  is_processed: boolean;
}

// API Response Types with Populated Relations
export interface PopulatedDelivery extends Omit<APIDelivery, 'transport_model' | 'package_type' | 'services' | 'status' | 'cargo_type'> {
  transport_model_details: TransportModel;
  package_type_details: PackageType;
  services_details: Service[];
  status_details: DeliveryStatus;
  cargo_type_details: CargoType | null;
  location: DeliveryLocation | null;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
} 