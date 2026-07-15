import { CategoryInterface } from "./service-category.interface";

export interface ServiceInterface {
  serviceuuid: string;
  category: CategoryInterface | null;
  servicename: string;
  servicedesc: string;
  serviceduration: number;
  serviceprice: number;
  servicestatus: string;
  images: ServiceImagesInterface[] | [];
}

export interface ServiceImagesInterface {
  serviceimageuuid: string;
  serviceimageurl: string;
  serviceimageorder: number;
  serviceimageprimary: boolean;
}

export interface ChangeStatusResponseInterface {
  serviceuuid: string;
  code: string;
  message: string;
}

export interface CreateServiceInterface {
  categoryuuid: string;
  servicename: string; // max length 80, required
  servicedesc: string;
  serviceduration: number;
  serviceprice: number; // required, 2 decimal places
  servicestatus?: 'active' | 'inactive' | 'soon' | 'deleted';
}

