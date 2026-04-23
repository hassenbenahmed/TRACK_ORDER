export interface Client {
  id: number;
  nom: string;
  email: string;
  adresse: string;
  telephone: string;
  createdAt: string;
  nombreCommandes: number;
}

export interface ClientRequest {
  nom: string;
  email: string;
  adresse: string;
  telephone: string;
}

