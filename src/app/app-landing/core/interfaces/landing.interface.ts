export interface PublicCommerceDto {
  commerceuuid: string;
  commercetype: string;
  commercename: string;
  commerceslug: string;
  commercephone: string;
  commerceemail: string;
  commercelogo: string | null;
  commercedescriptionshort: string | null;
  commercedescriptionlong: string | null;
  commercebanner: string | null;
  commerceinstagram: string | null;
  commercefacebook: string | null;
  commercewhatsapp: string | null;
  commercewebsite: string | null;
}

export interface PublicBranchDto {
  branchuuid: string;
  branchname: string;
  branchcity: string;
  branchaddress: string;
  branchphone: string;
  branchlat: number | null;
  branchlng: number | null;
}

export interface PublicProfessionalDto {
  useruuid: string;
  userfirstname: string;
  userlastname: string;
  userimage: string | null;
  userspecialty: string | null;
  branchuuid: string | null;
  serviceuuids: string[];
}

export type PublicCustomerDocumentType = 'CC' | 'CE' | 'NIT' | 'RUC';

/** Resultado de GET .../customers/search — datos de contacto ya enmascarados por el backend. */
export interface PublicCustomerMatchDto {
  customeruuid: string;
  customerfirstname: string;
  customerlastname: string;
  customerphonemasked: string | null;
  customeremailmasked: string;
}

/** Respuesta del endpoint agregado GET /landing-commerces/v1/:slug. */
export interface LandingFoundInterface {
  commerce: PublicCommerceDto;
  branches: PublicBranchDto[];
  professionals: PublicProfessionalDto[];
}

export interface ResponseCategoryLandingDto {
  categoryuuid: string;
  categoryname: string;
  categorystatus: string;
}

export interface ServiceImageLandingDto {
  serviceimageuuid: string;
  serviceimageurl: string;
  serviceimageorder: number;
  serviceimageprimary: boolean;
}

export interface ServiceLandingDto {
  serviceuuid: string;
  category: ResponseCategoryLandingDto | null;
  servicename: string;
  servicedesc: string | null;
  serviceduration: number;
  serviceprice: number;
  images: ServiceImageLandingDto[];
}

export interface AvailabilitySlotsDto {
  date: string;
  slots: string[];
}

/** Payload para reservar una cita de invitado desde la landing pública. */
export interface CreatePublicAppointmentDetailDto {
  serviceuuid: string;
}

export interface CreatePublicAppointmentDto {
  branchuuid: string;
  useruuid: string;
  appointmentdate: string;
  appointmenthour: string;
  appointmentmode?: 'at_branch' | 'delivered';
  details: CreatePublicAppointmentDetailDto[];

  // Cliente ya registrado, encontrado vía .../customers/search y confirmado por el usuario. Si
  // viene, los campos appointmentcustomer*/registerascustomer* no aplican (el backend toma
  // nombre/teléfono/correo del Customer encontrado, nunca del body).
  customeruuid?: string;

  // Requeridos solo cuando NO se envía customeruuid (invitado nuevo).
  appointmentcustomername?: string;
  appointmentcustomerphone?: string;
  // Obligatorio para invitados: es la única vía para enviarles el enlace de confirmación.
  appointmentcustomeremail?: string;

  // Registro opcional como cliente del comercio, resuelto en el mismo paso de la reserva
  // (mutuamente excluyente con customeruuid).
  registerascustomer?: boolean;
  customerfirstname?: string;
  customerlastname?: string;
  customerdocumenttype?: PublicCustomerDocumentType;
  customerdocumentnumber?: string;
}

export interface CreatePublicAppointmentResponseDto {
  appointmentuuid: string;
  appointmentconfirmationtoken: string;
  appointmentdate: string;
  appointmenthour: string;
  appointmentstatus: string;
}

/** Respuesta de GET /landing-commerces/v1/appointments/token/:token. */
export interface PublicAppointmentStatusDto {
  appointmentdate: string;
  appointmenthour: string;
  appointmentstatus: string;
  appointmentcustomername: string;
  commerce: {
    commercename: string;
    commercelogo: string | null;
    commercephone: string;
  };
  branch: {
    branchname: string;
    branchaddress: string;
    branchcity: string;
    branchphone: string;
  } | null;
  professional: {
    userfirstname: string;
    userlastname: string;
    userimage: string | null;
  } | null;
  services: {
    servicename: string;
    serviceduration: number | null;
  }[];
}
