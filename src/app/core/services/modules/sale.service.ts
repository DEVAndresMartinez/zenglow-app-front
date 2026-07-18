import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { SaleDetailRequestInterface, SaleRequestInterface, SaleResponseInterface } from '../../interfaces/sale.interface';
import { Observable } from 'rxjs';

@Service()
export class SaleService {

  constructor() { }

  private http = inject(HttpClient);
  private URL = BACK_URL;

  getSales(): Observable<SaleResponseInterface[]> {
    return this.http.get<SaleResponseInterface[]>(`${this.URL}/sales/v1`);
  }

  getSale(saleuuid: string): Observable<SaleResponseInterface> {
    return this.http.get<SaleResponseInterface>(`${this.URL}/sales/v1/${saleuuid}`);
  }

  createSale(req: SaleRequestInterface): Observable<SaleResponseInterface> {
    return this.http.post<SaleResponseInterface>(`${this.URL}/sales/v1`, req);
  }

  addSaleDetail(saleuuid: string, req: SaleDetailRequestInterface): Observable<SaleResponseInterface> {
    return this.http.post<SaleResponseInterface>(`${this.URL}/sales/v1/${saleuuid}/details`, req);
  }

}
