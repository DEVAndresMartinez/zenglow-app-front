import { SaleUserInterface } from "./user.interface";

export interface ResponseLicense {
  licenseuuid: string;
  user: SaleUserInterface;
  licensetype: 'medico' | 'birthday' | 'family' | 'personal' | 'other';
  licenseperiod: 'time' | 'day' | 'period';
  licensedate: string | null;
  licensestarttime: string | null;
  licenseendtime: string | null;
  licensestartdate: Date | null;
  licenseenddate: Date | null;
  licensestatus: 'requested' | 'approved' | 'rechazado' | 'expired';
  created_at: Date;
  updated_at: Date;
}

export interface ChangeStatusResponseDto {
  licenseuuid: string;
  code: string;
  message: string;
}

export interface CreateLicenseInterface {
  useruuid: string;
  licensetype: 'medico' | 'birthday' | 'family' | 'personal' | 'other';
  licenseperiod: 'time' | 'day' | 'period';
  licensedate?: string;
  licensestarttime?: string;
  licenseendtime?: string;
  licensestartdate?: string;
  licenseenddate?: string;
}

export interface UpdateLicenseInterface {
  licensetype: 'medico' | 'birthday' | 'family' | 'personal' | 'other';
  licenseperiod: 'time' | 'day' | 'period';
  licensedate?: string;
  licensestarttime?: string;
  licenseendtime?: string;
  licensestartdate?: string;
  licenseenddate?: string;
}

export interface UpdateLicenseStatusInterface {
  licensestatus: 'requested' | 'approved' | 'rechazado' | 'expired';
}
