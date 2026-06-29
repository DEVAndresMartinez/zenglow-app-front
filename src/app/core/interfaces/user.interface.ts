export interface UsersInterface {
  useruuid: string,
  userfirstname: string,
  userlastname: string,
  username: string,
  useremail: string,
  userphone: string,
  userstatus: string,
  commerce: {
    commerceuuid: string,
    commercename: string
  },
  branch: {
    branchuuid: string,
    branchname: string
  }
}
