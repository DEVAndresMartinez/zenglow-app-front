import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { Observable } from 'rxjs';
import { UsersInterface } from '../../interfaces/user.interface';

@Service()
export class UserService {

  constructor() { }

  private http = inject(HttpClient);
  private URL = BACK_URL;

  getUsers(): Observable<UsersInterface[]> {
    return this.http.get<UsersInterface[]>(`${this.URL}/users/v1`)
  }
}
