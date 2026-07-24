import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { Observable } from 'rxjs';

export interface PaymentMethodsDto {
  methodname: string;
  methodslug: string;
  methodicon: string;
  methodstatus: string;
  methodorder: number;
}

@Service()
export class AirtableService {

  paymentMethods = signal<PaymentMethodsDto[]>([]);

  private http = inject(HttpClient);
  private URL = BACK_URL;

  getPaymentMethods(): Observable<PaymentMethodsDto[]> {
    return this.http.get<PaymentMethodsDto[]>(`${this.URL}/payments/v1/methods`);
  }

}
