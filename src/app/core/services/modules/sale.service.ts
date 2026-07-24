import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BACK_URL } from '../../../../../env';
import { CreatePayment, PaymentSaleResponseInterface, SaleDetailRequestInterface, SaleRequestInterface, SaleResponseInterface, UpdateSaleDetailDto, UpdateSaleRequestInterface } from '../../interfaces/sale.interface';
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

  updateSale(saleuuid: string, req: UpdateSaleRequestInterface): Observable<SaleResponseInterface> {
    return this.http.patch<SaleResponseInterface>(`${this.URL}/sales/v1/${saleuuid}`, req);
  }

  addSaleDetail(saleuuid: string, req: SaleDetailRequestInterface): Observable<SaleResponseInterface> {
    return this.http.post<SaleResponseInterface>(`${this.URL}/sales/v1/${saleuuid}/details`, req);
  }

  removeSaleDetail(saleuuid: string, saledetailuuid: string): Observable<SaleResponseInterface> {
    return this.http.delete<SaleResponseInterface>(`${this.URL}/sales/v1/${saleuuid}/details/${saledetailuuid}`);
  }

  updateSaleDetail(saleuuid: string, saledetailuuid: string, req: UpdateSaleDetailDto): Observable<SaleResponseInterface> {
    return this.http.patch<SaleResponseInterface>(`${this.URL}/sales/v1/${saleuuid}/details/${saledetailuuid}`, req);
  }

  addPayment(saleuuid: string, req: CreatePayment): Observable<SaleResponseInterface> {
    return this.http.post<SaleResponseInterface>(`${this.URL}/payments/v1/${saleuuid}`, req);
  }

  getPayments(saleuuid: string): Observable<PaymentSaleResponseInterface[]> {
    return this.http.get<PaymentSaleResponseInterface[]>(`${this.URL}/payments/v1/${saleuuid}`);
  }

}
