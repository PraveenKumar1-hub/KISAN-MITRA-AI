export interface FarmerUser {
  id: number;
  full_name: string;
  email: string;
  location: string;
  farm_size: string;
  soil_type?: string | null;
  irrigation_type?: string | null;
  primary_crop?: string | null;
  created_at?: string | null;
}
