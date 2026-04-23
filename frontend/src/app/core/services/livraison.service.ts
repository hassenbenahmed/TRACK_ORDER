import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Livraison, LivraisonCreateRequest, LivraisonStatut } from '../../models/livraison.model';
import { Page } from '../../models/page.model';

@Injectable({ providedIn: 'root' })
export class LivraisonService {
  private apiUrl = `${environment.apiUrl}/livraisons`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10): Observable<Page<Livraison>> {
    return this.http.get<Page<Livraison>>(this.apiUrl, { params: { page, size } });
  }

  getById(id: number): Observable<Livraison> {
    return this.http.get<Livraison>(`${this.apiUrl}/${id}`);
  }

  create(request: LivraisonCreateRequest): Observable<Livraison> {
    return this.http.post<Livraison>(this.apiUrl, request);
  }

  updateStatut(id: number, statut: LivraisonStatut): Observable<Livraison> {
    return this.http.put<Livraison>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  getToday(): Observable<Livraison[]> {
    return this.http.get<Livraison[]>(`${this.apiUrl}/today`);
  }

  getByStatut(statut: LivraisonStatut): Observable<Livraison[]> {
    return this.http.get<Livraison[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getByTransporteur(transporteurId: number): Observable<Livraison[]> {
    return this.http.get<Livraison[]>(`${this.apiUrl}/transporteur/${transporteurId}`);
  }
}

