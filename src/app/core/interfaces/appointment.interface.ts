import { SaleBranchInterface } from "./branch.interface";
import { SaleCustomerInterface } from "./customer.interface";
import { SaleDetailServiceInterface } from "./sale.interface";
import { SaleUserInterface } from "./user.interface";

export interface AppointmentDetialResponseInterface {
  appointmentdetailuuid: string;
  service: SaleDetailServiceInterface | null;
  appointmentdetailamount: number;
  appointmentdetailduration: number;
}

export interface AppointmentResponseInterface {
  appointmentuuid: string;
  branch: SaleBranchInterface | null;
  customer: SaleCustomerInterface | null;
  user: SaleUserInterface | null;
  appointmentcustomername: string | null;
  appointmentcustomerphone: string | null;
  appointmentcustomeremail: string | null;
  appointmentdate: string;
  appointmenthour: string;
  appointmentduration: number;
  appointmentstatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  appointmentamount: number;
  appointmentmode: 'at_branch' | 'delivered';
  appointmentcity: string | null;
  appointmentaddress: string | null;
  details: AppointmentDetialResponseInterface[];
  created_at: Date;
  updated_at: Date;
}

export interface ChangeStatusResponseInterface {
  appointmentuuid?: string;
  appointmentdetailuuid?: string;
  code: string;
  message: string;
}

export interface AppointmentDailyInterface {
  appointmenttotal: number;
  appointmentpending: number;
  appointmentconfirmed: number;
  appointmentcompleted: number;
  appointmentcancelled: number;
  me: {
    appointmenttotal: number;
    appointmentpending: number;
    appointmentconfirmed: number;
    appointmentcompleted: number;
    appointmentcancelled: number;
  }
}

export interface CreateAppointmentDetailInterface {
  serviceuuid: string;
  appointmentdetailamount: number;
  appointmentdetailduration?: number;
}

export interface CreateAppointmentInterface {
  branchuuid?: string;
  customeruuid?: string;
  useruuid?: string;
  appointmentcustomername?: string;
  appointmentcustomerphone?: string;
  appointmentcustomeremail?: string;
  appointmentdate: string;
  appointmenthour: string;
  appointmentduration?: number;
  appointmentstatus?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  appointmentmode?: 'at_branch' | 'delivered';
  appointmentcity?: string;
  appointmentaddress?: string
  details?: CreateAppointmentDetailInterface[];
}


export interface UpdateAppointmentInterface {
  branchuuid?: string;
  customeruuid?: string;
  useruuid?: string;
  appointmentcustomername?: string;
  appointmentcustomerphone?: string;
  appointmentcustomeremail?: string;
  appointmentdate?: string;
  appointmenthour?: string;
  appointmentduration?: number;
  appointmentmode?: 'at_branch' | 'delivered';
  appointmentcity?: string;
  appointmentaddress?: string;
}

export enum SaleType {
  COMP = 'COMP',
  ELECT = 'ELECT',
}

export interface UpdateAppointmentStatusInterface {
  appointmentstatus?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
}

export interface FinalizeAppointmentInterface {
  saletype: SaleType;
  saledeliveryfee?: number;
  saletip?: number;
}

export interface ChangeStatusResponseDto {
  appointmentuuid?: string;
  appointmentdetailuuid?: string;
  code: string;
  message: string;
}
