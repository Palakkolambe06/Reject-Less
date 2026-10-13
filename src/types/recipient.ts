import { MaterialCategory, PackagingType, ContaminationLevel } from './batch';

export interface Recipient {
  id: string;
  name: string;
  facilityType: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: {
    address: string;
    city: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    maxServiceRadiusKm?: number;
  };
  acceptedMaterials: MaterialCategory[];
  minQuantityKg: number;
  maxQuantityKg: number;
  requiredPackaging: PackagingType[];
  acceptableContaminationLevels: ContaminationLevel[];
  requiresDry: boolean;
  specialInstructions: string;
  isActive: boolean;
  isDemoData: boolean; // Must be prominently shown
}
