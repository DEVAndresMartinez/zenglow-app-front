import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { CommerceMeResponse, CommerceResponseInterface, CreateCommerceInterface, LogoResponse, OneStepInterface, ThreeStepInterface, TwoStepInterface } from '../../interfaces/commerce.interface';
import { Observable } from 'rxjs';

@Service()
export class CommerceService {

  constructor() { }

  private http = inject(HttpClient);
  private URL = BACK_URL;

  me = signal<CommerceMeResponse | null>(null);

  commerceData = signal<OneStepInterface | null>(null);
  commerceLogo = signal<string | null>(null);
  branchData = signal<TwoStepInterface | null>(null);
  userData = signal<ThreeStepInterface | null>(null);

  stepOneValid = signal<boolean>(false);
  stepTwoValid = signal<boolean>(false);
  stepThreeValid = signal<boolean>(false);
  triggerValidation = signal<number>(0);

  createCommerce(req: CreateCommerceInterface): Observable<CommerceResponseInterface> {
    return this.http.post<CommerceResponseInterface>(`${this.URL}/commerces/v1/setup`, req);
  }

  getMeCommerce(): Observable<CommerceMeResponse> {
    return this.http.get<CommerceMeResponse>(`${this.URL}/commerces/v1/me`);
  }

  loadMe(): void {
    this.getMeCommerce().subscribe({
      next: (data) => this.me.set(data),
      error: () => this.me.set(null)
    });
  }

  uploadLogo(logo: File): Observable<LogoResponse> {
    const formData = new FormData();
    formData.append('logo', logo, logo.name);

    return this.http.patch<LogoResponse>(`${this.URL}/commerces/v1/logo`, formData);
  }

}
