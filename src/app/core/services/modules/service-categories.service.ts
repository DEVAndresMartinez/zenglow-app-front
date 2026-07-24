import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { BACK_URL } from '../../../../../env';
import { CategoryInterface, ChangeStatusResponseDto, CreateCategoryInterface } from '../../interfaces/service-category.interface';

@Service()
export class ServiceCategoriesService {

  constructor() { }

  private http = inject(HttpClient);
  private URL = BACK_URL;

  getCategories(): Observable<CategoryInterface[]> {
    return this.http.get<CategoryInterface[]>(`${this.URL}/categories/v1`)
  }

  create(req: CreateCategoryInterface): Observable<CategoryInterface> {
    return this.http.post<CategoryInterface>(`${this.URL}/categories/v1`, req);
  }

  update(categoryuuid: string, req: CreateCategoryInterface): Observable<CategoryInterface> {
    return this.http.patch<CategoryInterface>(`${this.URL}/categories/v1/${categoryuuid}`, req)
  }

  remove(categoryuuid: string): Observable<ChangeStatusResponseDto> {
    return this.http.delete<ChangeStatusResponseDto>(`${this.URL}/categories/v1/${categoryuuid}/remove`);
  }

  changeStatus(categoryuuid: string): Observable<ChangeStatusResponseDto> {
    return this.http.patch<ChangeStatusResponseDto>(`${this.URL}/categories/v1/${categoryuuid}/status`, {});
  }

}
