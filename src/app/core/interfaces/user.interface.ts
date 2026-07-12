export interface UsersInterface {
  useruuid: string;
  userfirstname: string;
  userlastname: string;
  username: string;
  useremail: string;
  userphone: string;
  userstatus: string;
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
  ]
}

export interface CreateUserInterface {
  userfirstname: string;
  userlastname: string;
  userphone: string;
  username: string;
  useremail: string;
  branchuuid: string;
  userstatus: string;
}

export interface UpdateUserInterface {
  userfirstname: string;
  userlastname: string;
  userphone: string;
  useremail: string;
}
