export interface Transporteur {
  id: number;
  nom: string;
  telephone: string;
  note: number;
  vehicule: string;
  actif: boolean;
  nombreLivraisons: number;
  createdAt: string;
}

export interface TransporteurRequest {
  nom: string;
  telephone: string;
  vehicule: string;
  actif: boolean;
}

