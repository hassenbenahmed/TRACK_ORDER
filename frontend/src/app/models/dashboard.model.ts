export interface DashboardStats {
  commandesAujourdhui: number;
  livraisonsEnCours: number;
  chiffreAffairesMois: number;
  paiementsEnAttente: number;
  commandesParStatut: { [key: string]: number };
  revenusParJour: RevenueByDay[];
  commandesParJour: OrdersByDay[];
}

export interface RevenueByDay {
  date: string;
  montant: number;
}

export interface OrdersByDay {
  date: string;
  count: number;
}

