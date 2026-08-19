import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { Observable } from 'rxjs';
import { CloneScheduleInterface, CreateScheduleInterface, ResponseSchedule, UpdateScheduleInterface } from '../../interfaces/schedule.interface';
import { ChangeStatusResponseInterface } from '../../interfaces/branch.interface';

@Service()
export class ScheduleService {

  constructor() { }

  private http = inject(HttpClient);
  private URL = BACK_URL;

  getAllSchedulesByUser(useruuid: string): Observable<ResponseSchedule[]> {
    return this.http.get<ResponseSchedule[]>(`${this.URL}/schedules/v1/${useruuid}`);
  }

  getActiveSchedulesByUser(useruuid: string): Observable<ResponseSchedule[]> {
    return this.http.get<ResponseSchedule[]>(`${this.URL}/schedules/v1/${useruuid}/active`);
  }

  getAllSchedulesByDay(useruuid: string): Observable<ResponseSchedule[]> {
    return this.http.get<ResponseSchedule[]>(`${this.URL}/schedules/v1/${useruuid}/day`);
  }

  create(req: CreateScheduleInterface): Observable<ResponseSchedule> {
    return this.http.post<ResponseSchedule>(`${this.URL}/schedules/v1`, req)
  }

  update(useruuid: string, scheduleuuid: string, req: UpdateScheduleInterface): Observable<ResponseSchedule> {
    return this.http.patch<ResponseSchedule>(`${this.URL}/schedules/v1/${useruuid}/${scheduleuuid}`, req);
  }

  changeStatus(scheduleuuid: string): Observable<ChangeStatusResponseInterface> {
    return this.http.patch<ChangeStatusResponseInterface>(`${this.URL}/schedules/v1/${scheduleuuid}`, {})
  }

  clone(req: CloneScheduleInterface): Observable<ResponseSchedule> {
    return this.http.post<ResponseSchedule>(`${this.URL}/schedules/v1/clone`, { req })
  }

}
