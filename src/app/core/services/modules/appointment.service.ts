import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACK_URL } from '../../../../../env';
import { AppointmentDailyInterface, AppointmentResponseInterface, ChangeStatusResponseDto, CreateAppointmentDetailInterface, CreateAppointmentInterface, FinalizeAppointmentInterface, UpdateAppointmentInterface, UpdateAppointmentStatusInterface } from '../../interfaces/appointment.interface';
import { SaleResponseInterface } from '../../interfaces/sale.interface';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private http = inject(HttpClient);
  private URL = BACK_URL;

  create(dto: CreateAppointmentInterface): Observable<AppointmentResponseInterface> {
    return this.http.post<AppointmentResponseInterface>(`${this.URL}/appointments/v1`, dto);
  }

  getDaily(useruuid: string): Observable<AppointmentDailyInterface> {
    return this.http.get<AppointmentDailyInterface>(`${this.URL}/appointments/v1/${useruuid}/daily`);
  }

  findAll(): Observable<AppointmentResponseInterface[]> {
    return this.http.get<AppointmentResponseInterface[]>(`${this.URL}/appointments/v1`);
  }

  findAllByBranch(branchuuid: string): Observable<AppointmentResponseInterface[]> {
    return this.http.get<AppointmentResponseInterface[]>(`${this.URL}/appointments/v1/${branchuuid}/branch`);
  }

  findOne(appointmentuuid: string): Observable<AppointmentResponseInterface> {
    return this.http.get<AppointmentResponseInterface>(`${this.URL}/appointments/v1/${appointmentuuid}`);
  }

  update(appointmentuuid: string, dto: UpdateAppointmentInterface): Observable<AppointmentResponseInterface> {
    return this.http.patch<AppointmentResponseInterface>(`${this.URL}/appointments/v1/${appointmentuuid}`, dto);
  }


  addDetail(appointmentuuid: string, dto: CreateAppointmentDetailInterface): Observable<AppointmentResponseInterface> {
    return this.http.post<AppointmentResponseInterface>(`${this.URL}/appointments/v1/${appointmentuuid}/details`, dto);
  }

  removeDetail(appointmentuuid: string, appointmentdetailuuid: string): Observable<AppointmentResponseInterface> {
    return this.http.delete<AppointmentResponseInterface>(`${this.URL}/appointments/v1/${appointmentuuid}/details/${appointmentdetailuuid}`);
  }

  changeStatus(appointmentuuid: string, dto: UpdateAppointmentStatusInterface): Observable<ChangeStatusResponseDto> {
    return this.http.patch<ChangeStatusResponseDto>(`${this.URL}/appointments/v1/${appointmentuuid}/status`, dto);
  }

  finalize(appointmentuuid: string, dto: FinalizeAppointmentInterface): Observable<SaleResponseInterface> {
    return this.http.patch<SaleResponseInterface>(`${this.URL}/appointments/v1/${appointmentuuid}/finalize`, dto);
  }

}
