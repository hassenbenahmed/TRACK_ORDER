export type LivraisonStatut = 'PREPAREE' | 'EN_TRANSIT' | 'LIVREE' | 'ECHOUEE';

export interface Livraison {
  id: number;
  dateLivraison: string;
  cout: number;
  statut: LivraisonStatut;
  commandeId: number;
  commandeReference: string;
  transporteurId: number;
  transporteurNom: string;
  clientNom: string;
  createdAt: string;
}

export interface LivraisonCreateRequest {
  commandeId: number;
  transporteurId: number;
  dateLivraison: string;
  cout: number;
}

