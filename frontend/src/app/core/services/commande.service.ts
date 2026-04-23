import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Commande, CommandeCreateRequest, CommandeStatut } from '../../models/commande.model';
import { Page } from '../../models/page.model';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private apiUrl = `${environment.apiUrl}/commandes`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, statut?: CommandeStatut, start?: string, end?: string): Observable<Page<Commande>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (statut) params = params.set('statut', statut);
    if (start) params = params.set('start', start);
    if (end) params = params.set('end', end);
    return this.http.get<Page<Commande>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  create(request: CommandeCreateRequest): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, request);
  }

  valider(id: number): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/${id}/valider`, {});
  }

  annuler(id: number): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/${id}/annuler`, {});
  }

  getByClient(clientId: number, page = 0, size = 10): Observable<Page<Commande>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Commande>>(`${this.apiUrl}/client/${clientId}`, { params });
  }

  getRecent(limit = 5): Observable<Commande[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<Commande[]>(`${this.apiUrl}/recent`, { params });
  }
}

