export interface CreateCommerceInterface {
  commercetype: string;
  commercename: string;
  commerceslug: string;
  commerceemail: string;
  commercephone: string;
  commercedocumenttype: string;
  commercedocumentnumber: string;
  commercedigitverification: string;
  commercelogo?: string;
  commercestatus: 'active' | 'inactive' | 'pending' | 'banned' | 'deleted';
  branch: CreateBranch;
  user: CreateUser;
}


export interface CreateBranch {
  branchname: string;
  branchcity: string;
  branchaddress: string;
  branchphone: string;
  branchstatus: 'active' | 'inactive' | 'maintenance' | 'deleted';
}

export interface CreateUser {
  userfirstname: string;
  userlastname: string;
  userphone: string;
  username: string;
  useremail: string;
  userpassword: string;
  userstatus: 'active' | 'inactive' | 'blocked' | 'pending' | 'deleted';
}

export interface CommerceResponseInterface {
  commerce: {
    commerceuuid: string;
    commercetype: string;
    commercename: string;
    commerceslug: string;
    commerceemail: string;
    commercephone: string;
    commercedocumenttype: string;
    commercedocumentnumber: string;
    commercedigitverification: string;
    commercelogo: string;
    commercestatus: string;
  },
  branch: {
    branchuuid: string
    branchname: string
    branchcity: string
    branchaddress: string
    branchphone: string
    branchstatus: string
  },
  role: {
    roleuuid: string;
    rolename: string;
    roledesc: string;
  },
  user: {
    useruuid: string
    userfirstname: string
    userlastname: string
    username: string
    useremail: string
    userphone: string
    userstatus: string
  },
}


export interface OneStepInterface {
  commercetype: string;
  commercename: string;
  commerceslug: string;
  commerceemail: string;
  commercephone: string;
  commercedocumenttype: string;
  commercedocumentnumber: string;
  commercedigitverification: string;
  commercestatus: 'active' | 'inactive' | 'pending' | 'banned' | 'deleted';
}

export interface TwoStepInterface {
  branchname: string;
  branchcity: string;
  branchaddress: string;
  branchphone: string;
  branchstatus: 'active' | 'inactive' | 'maintenance' | 'deleted';
}

export interface ThreeStepInterface {
  userfirstname: string;
  userlastname: string;
  userphone: string;
  username: string;
  useremail: string;
  userpassword: string;
  branchuuid: string;
  userstatus: 'active' | 'inactive' | 'blocked' | 'pending' | 'deleted';
}


export interface CommerceMeResponse {
  commerce: {
    commerceuuid: string;
    commercetype: string;
    commercename: string;
    commerceslug: string;
    commerceemail: string;
    commercephone: string;
    commercedocumenttype: string;
    commercedocumentnumber: string;
    commercedigitverification: string;
    commercelogo: string;
    commercestatus: string;
  },
  user: {
    useruuid: string,
    userfirstname: string,
    userlastname: string,
    username: string,
    useremail: string,
    userphone: string,
    mustchangepassword: boolean,
    userlastlogin: Date
    roles: {
      roleuuid: string;
      rolename: string;
      roleIsOwner: boolean;
    }[];
  },
  branches: DetailDto;
  roles: DetailDto;
  users: DetailDto;
}

export interface DetailDto {
  total: number;
  active: number;
  inactive: number;
}


export interface LogoResponse {
  commercelogo: string;
}
