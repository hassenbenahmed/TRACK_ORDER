import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Transporteur, TransporteurRequest } from '../../models/transporteur.model';
import { Page } from '../../models/page.model';

@Injectable({ providedIn: 'root' })
export class TransporteurService {
  private apiUrl = `${environment.apiUrl}/transporteurs`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, search?: string): Observable<Page<Transporteur>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<Page<Transporteur>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Transporteur> {
    return this.http.get<Transporteur>(`${this.apiUrl}/${id}`);
  }

  getActifs(): Observable<Transporteur[]> {
    return this.http.get<Transporteur[]>(`${this.apiUrl}/actifs`);
  }

  create(request: TransporteurRequest): Observable<Transporteur> {
    return this.http.post<Transporteur>(this.apiUrl, request);
  }

  update(id: number, request: TransporteurRequest): Observable<Transporteur> {
    return this.http.put<Transporteur>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

