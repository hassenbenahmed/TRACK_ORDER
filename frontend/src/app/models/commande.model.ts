export type CommandeStatut = 'EN_ATTENTE' | 'VALIDEE' | 'EN_COURS' | 'LIVREE' | 'ANNULEE';

export interface LigneCommande {
  id: number;
  produitId: number;
  produitNom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface LigneCommandeRequest {
  produitId: number;
  quantite: number;
}

export interface Commande {
  id: number;
  reference: string;
  dateCommande: string;
  statut: CommandeStatut;
  montantTotal: number;
  clientId: number;
  clientNom: string;
  lignes: LigneCommande[];
  livraison: any;
  paiement: any;
}

export interface CommandeCreateRequest {
  clientId: number;
  lignes: LigneCommandeRequest[];
}

