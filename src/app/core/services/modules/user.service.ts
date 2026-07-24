import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { Observable } from 'rxjs';
import { CreateUserInterface, ImageResponse, UpdateUserInterface, UsersInterface } from '../../interfaces/user.interface';
import { ChangeStatusResponseInterface } from '../../interfaces/branch.interface';

@Service()
export class UserService {

  constructor() { }

  private http = inject(HttpClient);
  private URL = BACK_URL;

  getUsers(): Observable<UsersInterface[]> {
    return this.http.get<UsersInterface[]>(`${this.URL}/users/v1`)
  }

  create(req: CreateUserInterface): Observable<UsersInterface> {
    return this.http.post<UsersInterface>(`${this.URL}/users/v1`, req);
  }

  update(useruuid: string, req: UpdateUserInterface): Observable<UsersInterface> {
    return this.http.patch<UsersInterface>(`${this.URL}/users/v1/${useruuid}`, req)
  }

  remove(useruuid: string): Observable<ChangeStatusResponseInterface> {
    return this.http.delete<ChangeStatusResponseInterface>(`${this.URL}/users/v1/${useruuid}`);
  }

  assignBranch(useruuid: string, { branchuuid }: { branchuuid: string }): Observable<UsersInterface> {
    return this.http.patch<UsersInterface>(`${this.URL}/users/v1/${useruuid}/branch`, { branchuuid });
  }

  assignRoles(useruuid: string, { roleuuids }: { roleuuids: string[] }): Observable<UsersInterface> {
    return this.http.put<UsersInterface>(`${this.URL}/users/v1/${useruuid}/roles`, { roleuuids });
  }


  uploadImage(useruuid: string, image: File): Observable<ImageResponse> {
    const formData = new FormData();
    formData.append('image', image, image.name);

    return this.http.patch<ImageResponse>(`${this.URL}/users/v1/${useruuid}/image`, formData);
  }

}
