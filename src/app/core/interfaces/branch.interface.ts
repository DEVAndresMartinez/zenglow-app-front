export interface BranchesInterface {
  branchuuid: string;
  branchname: string;
  branchcity: string;
  branchaddress: string;
  branchphone: string;
  branchstatus: string;
  commerce: {
    commerceuuid: string;
    commercename: string;
  }
}


export interface CreateBranchInterface {
  branchname: string;
  branchcity: string;
  branchaddress: string;
  branchphone: string;
  branchstatus: string;
}
