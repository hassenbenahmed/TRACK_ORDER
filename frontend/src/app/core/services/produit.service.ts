import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produit, ProduitRequest } from '../../models/produit.model';
import { Page } from '../../models/page.model';

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, search?: string): Observable<Page<Produit>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<Page<Produit>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  create(request: ProduitRequest): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, request);
  }

  update(id: number, request: ProduitRequest): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getLowStock(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/low-stock`);
  }
}

