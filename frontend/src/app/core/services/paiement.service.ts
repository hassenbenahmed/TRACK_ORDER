import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paiement, CheckoutResponse } from '../../models/paiement.model';
import { Page } from '../../models/page.model';

@Injectable({ providedIn: 'root' })
export class PaiementService {
  private apiUrl = `${environment.apiUrl}/paiements`;

  constructor(private http: HttpClient) {}

  createCheckout(commandeId: number): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/checkout/${commandeId}`, {});
  }

  getByCommande(commandeId: number): Observable<Paiement> {
    return this.http.get<Paiement>(`${this.apiUrl}/commande/${commandeId}`);
  }

  getAll(page = 0, size = 10): Observable<Page<Paiement>> {
    return this.http.get<Page<Paiement>>(this.apiUrl, { params: { page, size } });
  }

  rembourser(id: number): Observable<Paiement> {
    return this.http.post<Paiement>(`${this.apiUrl}/${id}/rembourser`, {});
  }
}

