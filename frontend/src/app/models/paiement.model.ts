export type PaiementStatut = 'EN_ATTENTE' | 'REUSSI' | 'ECHOUE' | 'REMBOURSE';
export type PaiementMode = 'CARTE' | 'VIREMENT' | 'STRIPE';

export interface Paiement {
  id: number;
  datePaiement: string;
  montant: number;
  statut: PaiementStatut;
  mode: PaiementMode;
  stripeSessionId: string;
  commandeId: number;
  commandeReference: string;
  createdAt: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

