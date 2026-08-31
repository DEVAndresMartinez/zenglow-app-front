export interface UsersInterface {
  useruuid: string;
  userfirstname: string;
  userlastname: string;
  username: string;
  useremail: string;
  userphone: string;
  userstatus: string;
  userimage?: string;
  userspecialty: string | null;
  commerce: {
    commerceuuid: string;
    commercename: string;
  },
  branch: {
    branchuuid: string;
    branchname: string;
  },
  roles: [
    {
      roleuuid: string;
      rolename: string;
      roleIsOwner: boolean;
    }
  ],
  services: {
    serviceuuid: string;
    servicename: string;
  }[];
}

export interface CreateUserInterface {
  userfirstname: string;
  userlastname: string;
  userphone: string;
  username: string;
  useremail: string;
  branchuuid: string;
  userstatus: string;
  userspecialty?: string;
}

export interface UpdateUserInterface {
  userfirstname: string;
  userlastname: string;
  userphone: string;
  useremail: string;
  userspecialty?: string;
}

export interface ImageResponse {
  userimage: string;
}

export interface SaleUserInterface {
  useruuid: string;
  userfirstname: string;
  userlastname: string;
  username: string;
  useremail: string;
  userphone: string;
  userstatus: string;
}
