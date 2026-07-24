import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { RolesInterface } from '../../interfaces/role.interface';
import { Observable } from 'rxjs';

@Service()
export class RoleServices {

    constructor() { }

    private http = inject(HttpClient);
    private URL = BACK_URL;

    getRoles(): Observable<RolesInterface[]> {
      return this.http.get<RolesInterface[]>(`${this.URL}/roles/v1`)
    }

}
