import { SaleBranchInterface } from "./branch.interface";
import { SaleCustomerInterface } from "./customer.interface";
import { CategoryInterface } from "./service-category.interface";
import { SaleUserInterface } from "./user.interface";


export interface ResponseSaleDetailInterface {
  saledetailuuid: string;
  service: SaleDetailServiceInterface | null;
  saledetailamount: number;
  saledetailquantity: number;
  saledetailtotal: number;
  saledetailcourtesy: boolean;
}

export interface SaleDetailServiceInterface {
  serviceuuid: string;
  category: CategoryInterface | null;
  servicename: string;
  serviceduration: number;
}

export interface SaleResponseInterface {
  saleuuid: string;
  branch: SaleBranchInterface | null;
  customer: SaleCustomerInterface | null;
  user: SaleUserInterface | null;
  salesequence: string;
  saletype: 'COMP' | 'ELECT';
  salesubtotal: number;
  saledeliveryfee: number;
  saletip: number;
  saletotalamount: number;
  salestatus: 'pending' | 'paid-partial' | 'paid' | 'cancelled' | 'refunded';
  details: ResponseSaleDetailInterface[] | null;
  created_at: Date;
}

export interface ChangeStatusResponseInterface {
  saleuuid?: string;
  saledetailuuid?: string;
  code: string;
  message: string;
}

export interface SaleRequestInterface {
  branchuuid?: string | null;
  customeruuid?: string | null;
  useruuid?: string | null;
  saledeliveryfee?: number;
  saletip?: number;
  salestatus?: 'pending' | 'paid-partial' | 'paid' | 'cancelled' | 'refunded';
  saletype: 'COMP' | 'ELECT';
}

export interface SaleDetailRequestInterface {
  serviceuuid: string;
  saledetailamount: number;
  saledetailquantity: number;
  saledetailcourtesy: boolean;
}
