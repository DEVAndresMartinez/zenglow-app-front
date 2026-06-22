import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { BACK_URL } from '../../../../../../env';
import { CommerceResponseInterface, CreateCommerceInterface, OneStepInterface, ThreeStepInterface, TwoStepInterface } from '../../../interfaces/commerce.interface';
import { Observable } from 'rxjs';

@Service()
export class CommerceService {

  constructor() {}

  private http = inject(HttpClient);
  private URL = BACK_URL;

  commerceData = signal<OneStepInterface | null>(null);
  branchData = signal<TwoStepInterface | null>(null);
  userData = signal<ThreeStepInterface | null>(null);

  stepOneValid = signal<boolean>(false);
  stepTwoValid = signal<boolean>(false);
  stepThreeValid = signal<boolean>(false);

  triggerValidation = signal<number>(0);

  createCommerce(req: CreateCommerceInterface): Observable<CommerceResponseInterface> {
    return this.http.post<CommerceResponseInterface>(`${this.URL}/commerces/v1/setup`, req);
  }


}
