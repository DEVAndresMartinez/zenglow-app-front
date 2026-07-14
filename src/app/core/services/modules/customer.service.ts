import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { BACK_URL } from '../../../../../env';
import { CreateCustomerInterface, CustomersInterface } from '../../interfaces/customer.interface';

@Service()
export class CustomerService {

  constructor() { }

  private http = inject(HttpClient);
  private URL = BACK_URL;

  getCustomers(): Observable<CustomersInterface[]> {
    return this.http.get<CustomersInterface[]>(`${this.URL}/customers/v1`)
  }

  create(req: CreateCustomerInterface): Observable<CustomersInterface> {
    return this.http.post<CustomersInterface>(`${this.URL}/customers/v1`, req);
  }

  update(customeruuid: string, req: CreateCustomerInterface): Observable<CustomersInterface> {
    return this.http.patch<CustomersInterface>(`${this.URL}/customers/v1/${customeruuid}`, req)
  }
}
