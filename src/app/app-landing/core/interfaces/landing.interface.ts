export interface LandingFoundInterface {
  commerce: ResponseLandingDto;
  branches: BranchLandingDto[];
  users: UserLandingDto[];
  appointments: AppointmentLandingDto[];
}

export interface ResponseLandingDto {
  commerceuuid: string;
  commercetype: string;
  commercename: string;
  commerceemail: string;
  commercephone: string;
  commerceslug: string;
  commercelogo: string;
}

export interface BranchLandingDto {
  branchuuid: string;
  branchname: string;
  branchcity: string;
  branchaddress: string;
  branchphone: string;
}

export interface UserLandingDto {
  useruuid: string;
  userfirstname: string;
  userlastname: string;
  username: string;
  useremail: string;
  userphone: string;
  userimage: string;
  userstatus: string;
}

export interface AppointmentLandingDto {
  appointmentuuid: string;
  appointmentdate: string;
  appointmenthour: string;
  appointmentduration: number;
  appointmentstatus: string;
}


export interface ServiceLandingDto {
    serviceuuid: string;
    category: unknown;
    servicename: string;
    servicedesc: string;
    serviceduration: number;
    serviceprice: number;
    images: ServiceImageLandingDto[] | [];
}

export interface ServiceImageLandingDto {
    serviceimageuuid: string;
    serviceimageurl: string;
    serviceimageorder: number;
    serviceimageprimary: boolean;
}

export type LandingDocumentType = 'CC' | 'CE' | 'NIT' | 'RUC';

/**
 * Resultado de la búsqueda pública de un cliente por cédula o correo.
 * Provisional: se ajusta cuando exista el endpoint real de búsqueda.
 */
export interface LandingCustomerDto {
  customeruuid: string;
  customerdocumenttype: LandingDocumentType;
  customerdocumentnumber: string;
  customerfirstname: string;
  customerlastname: string;
  customerphone: string;
  customeremail: string;
}

/**
 * Datos para registrar un nuevo cliente del comercio desde la landing
 * pública, cuando la búsqueda no encuentra coincidencia.
 * Provisional: se ajusta cuando exista el endpoint real de creación.
 */
export interface CreateLandingCustomerDto {
  customerdocumenttype: LandingDocumentType;
  customerdocumentnumber: string;
  customerfirstname: string;
  customerlastname: string;
  customerphone: string;
  customeremail: string;
}

export interface CreateAppointmentDetailDto {
  serviceuuid: string;
  appointmentdetailamount: number;
  appointmentdetailduration: number;
}

/** Payload para agendar una cita desde la landing pública. */
export interface CreateAppointmentDto {
  branchuuid: string;
  customeruuid?: string;
  useruuid: string;
  appointmentcustomername: string;
  appointmentcustomerphone: string;
  appointmentcustomeremail: string;
  appointmentdate: string;
  appointmenthour: string;
  appointmentduration: number;
  appointmentstatus: 'pending';
  appointmentmode: 'at_branch';
  appointmentcity: string;
  appointmentaddress: string;
  details: CreateAppointmentDetailDto[];
}
