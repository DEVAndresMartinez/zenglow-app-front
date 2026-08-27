import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { Observable } from 'rxjs';
import {
  AvailabilitySlotsDto,
  CreatePublicAppointmentDto,
  CreatePublicAppointmentResponseDto,
  LandingFoundInterface,
  PublicAppointmentStatusDto,
  PublicProfessionalDto,
  ServiceLandingDto,
} from '../interfaces/landing.interface';

@Injectable({ providedIn: 'root' })
export class LandingCommercesService {
  private http = inject(HttpClient);
  private URL = BACK_URL;

  getCommerceBySlug(slug: string): Observable<LandingFoundInterface> {
    return this.http.get<LandingFoundInterface>(`${this.URL}/landing-commerces/v1/${slug}`);
  }

  getServicesByCommerce(commerceuuid: string, useruuid?: string): Observable<ServiceLandingDto[]> {
    return this.http.get<ServiceLandingDto[]>(`${this.URL}/landing-commerces/v1/${commerceuuid}/services`, {
      params: useruuid ? { useruuid } : {},
    });
  }

  getProfessionalsByCommerce(commerceuuid: string, serviceuuid?: string): Observable<PublicProfessionalDto[]> {
    return this.http.get<PublicProfessionalDto[]>(`${this.URL}/landing-commerces/v1/${commerceuuid}/professionals`, {
      params: serviceuuid ? { serviceuuid } : {},
    });
  }

  getAvailability(commerceuuid: string, useruuid: string, date: string, durationminutes: number): Observable<AvailabilitySlotsDto> {
    return this.http.get<AvailabilitySlotsDto>(`${this.URL}/landing-commerces/v1/${commerceuuid}/availability`, {
      params: { useruuid, date, durationminutes },
    });
  }

  createAppointment(commerceuuid: string, dto: CreatePublicAppointmentDto): Observable<CreatePublicAppointmentResponseDto> {
    return this.http.post<CreatePublicAppointmentResponseDto>(`${this.URL}/landing-commerces/v1/${commerceuuid}/appointments`, dto);
  }

  getAppointmentByToken(token: string): Observable<PublicAppointmentStatusDto> {
    return this.http.get<PublicAppointmentStatusDto>(`${this.URL}/landing-commerces/v1/appointments/token/${token}`);
  }
}
