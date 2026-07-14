export interface CustomersInterface {
  customeruuid: string;
  customerdocumenttype: 'CC' | 'CE' | 'NIT' | 'RUC';
  customerdocumentnumber: string;
  customerdigitverification: string;
  customerfirstname: string;
  customerlastname: string;
  customerphone: string;
  customeremail: string;
  customerstatus: 'active' | 'inactive' | 'blocked' | 'deleted';
  customercity: string;
  customerbirthdate: string;
}

export interface CreateCustomerInterface {
  customerdocumenttype: string;
  customerdocumentnumber: string;
  customerdigitverification: string;
  customerfirstname: string;
  customerlastname: string;
  customerphone: string;
  customeremail: string;
  customercity: string;
  customerbirthdate: string;
  customerstatus: 'active' | 'inactive' | 'blocked' | 'deleted';
}
