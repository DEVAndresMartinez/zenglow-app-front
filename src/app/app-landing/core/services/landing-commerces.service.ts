import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { Observable } from 'rxjs';
import {
  CreateAppointmentDto,
  CreateLandingCustomerDto,
  LandingCustomerDto,
  LandingFoundInterface,
  ServiceLandingDto,
} from '../interfaces/landing.interface';

@Service()
export class LandingCommercesService {

  constructor() { }

  private http = inject(HttpClient);
  private URL = BACK_URL;

  getCommerceBySlug(slug: string): Observable<LandingFoundInterface> {
    return this.http.get<LandingFoundInterface>(`${this.URL}/landing-commerces/v1/${slug}`);
  }

  getServicesByCommerce(commerceuuid: string): Observable<ServiceLandingDto[]> {
    return this.http.get<ServiceLandingDto[]>(`${this.URL}/landing-commerces/v1/${commerceuuid}/services`);
  }

  /**
   * TODO: ruta provisional. Ajustar cuando exista el endpoint público real
   * de búsqueda de clientes por cédula o correo (debe responder 404/null
   * cuando no hay coincidencia, nunca listar clientes).
   */
  searchCustomer(commerceuuid: string, query: string): Observable<LandingCustomerDto> {
    return this.http.get<LandingCustomerDto>(`${this.URL}/landing-commerces/v1/${commerceuuid}/customers/search`, {
      params: { query },
    });
  }

  /**
   * TODO: ruta provisional. Ajustar cuando exista el endpoint público real
   * de registro de clientes desde la landing.
   */
  createCustomer(commerceuuid: string, dto: CreateLandingCustomerDto): Observable<LandingCustomerDto> {
    return this.http.post<LandingCustomerDto>(`${this.URL}/landing-commerces/v1/${commerceuuid}/customers`, dto);
  }

  /**
   * TODO: ruta provisional. Ajustar cuando exista el endpoint público real
   * de creación de citas desde la landing.
   */
  createAppointment(commerceuuid: string, dto: CreateAppointmentDto): Observable<unknown> {
    return this.http.post<unknown>(`${this.URL}/landing-commerces/v1/${commerceuuid}/appointments`, dto);
  }

}
