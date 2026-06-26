import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { Observable } from 'rxjs';
import { BranchesInterface } from '../../interfaces/branch.interface';

@Service()
export class BranchService {

  constructor() { }

  private http = inject(HttpClient);
  private URL = BACK_URL;

  getBranches(): Observable<BranchesInterface[]> {
    return this.http.get<BranchesInterface[]>(`${this.URL}/branches/v1`)
  }

}
