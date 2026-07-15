import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { Observable } from 'rxjs';
import { ChangeStatusResponseInterface, CreateServiceInterface, ServiceImagesInterface, ServiceInterface } from '../../interfaces/service.interface';

@Service()
export class ServiceService {
  constructor() { }

  private http = inject(HttpClient);
  private URL = BACK_URL;

  getServices(): Observable<ServiceInterface[]> {
    return this.http.get<ServiceInterface[]>(`${this.URL}/services/v1`)
  }

  getService(serviceuuid: string): Observable<ServiceInterface> {
    return this.http.get<ServiceInterface>(`${this.URL}/services/v1/${serviceuuid}`)
  }

  create(req: CreateServiceInterface): Observable<ServiceInterface> {
    return this.http.post<ServiceInterface>(`${this.URL}/services/v1`, req);
  }

  update(serviceuuid: string, req: CreateServiceInterface): Observable<ServiceInterface> {
    return this.http.patch<ServiceInterface>(`${this.URL}/services/v1/${serviceuuid}`, req)
  }

  remove(serviceuuid: string): Observable<ChangeStatusResponseInterface> {
    return this.http.delete<ChangeStatusResponseInterface>(`${this.URL}/services/v1/${serviceuuid}/remove`);
  }

  changeStatus(serviceuuid: string): Observable<ChangeStatusResponseInterface> {
    return this.http.patch<ChangeStatusResponseInterface>(`${this.URL}/services/v1/${serviceuuid}/status`, {});
  }

  uploadImages(serviceuuid: string, images: File[], primaryindex: number): Observable<ServiceImagesInterface[]> {
    const formData = new FormData();
    images.forEach(image => formData.append('images', image, image.name));
    formData.append('primaryindex', String(primaryindex));

    return this.http.post<ServiceImagesInterface[]>(`${this.URL}/services/v1/${serviceuuid}/images`, formData); // Maximo 5 images, 1 primary
  }

}
