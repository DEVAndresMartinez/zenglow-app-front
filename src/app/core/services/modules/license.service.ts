import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { ChangeStatusResponseDto, CreateLicenseInterface, ResponseLicense, UpdateLicenseInterface, UpdateLicenseStatusInterface } from '../../interfaces/license.interface';
import { Observable } from 'rxjs';

@Service()
export class LicenseService {

  constructor() { }

  private http = inject(HttpClient);
  private URL = BACK_URL;

  create(req: CreateLicenseInterface): Observable<ResponseLicense> {
    return this.http.post<ResponseLicense>(`${this.URL}/license/v1`, req);
  }

  findAllByUser(useruuid: string): Observable<ResponseLicense[]> {
    return this.http.get<ResponseLicense[]>(`${this.URL}/license/v1/user/${useruuid}`);
  }

  findOne(licenseuuid: string): Observable<ResponseLicense> {
    return this.http.get<ResponseLicense>(`${this.URL}/license/v1/${licenseuuid}`);
  }

  update(licenseuuid: string, req: UpdateLicenseInterface): Observable<ResponseLicense> {
    return this.http.patch<ResponseLicense>(`${this.URL}/license/v1/${licenseuuid}`, req);
  }

  updateStatus(licenseuuid: string, req: UpdateLicenseStatusInterface): Observable<ChangeStatusResponseDto> {
    return this.http.patch<ChangeStatusResponseDto>(`${this.URL}/license/v1/${licenseuuid}/status`, req);
  }
}
