import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { Observable, retry } from 'rxjs';
import { BranchesInterface, ChangeStatusResponseInterface, CreateBranchInterface } from '../../interfaces/branch.interface';

@Service()
export class BranchService {

  constructor() { }

  private http = inject(HttpClient);
  private URL = BACK_URL;

  getBranches(): Observable<BranchesInterface[]> {
    return this.http.get<BranchesInterface[]>(`${this.URL}/branches/v1`)
  }

  create(req: CreateBranchInterface): Observable<BranchesInterface> {
    return this.http.post<BranchesInterface>(`${this.URL}/branches/v1`, req);
  }

  update(branchuuid: string, req: CreateBranchInterface): Observable<BranchesInterface> {
    return this.http.patch<BranchesInterface>(`${this.URL}/branches/v1/${branchuuid}`, req)
  }

  remove(branchuuid: string): Observable<ChangeStatusResponseInterface> {
    return this.http.delete<ChangeStatusResponseInterface>(`${this.URL}/branches/v1/${branchuuid}/remove`);
  }

}
