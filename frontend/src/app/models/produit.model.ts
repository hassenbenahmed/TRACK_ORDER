export interface Produit {
  id: number;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  imageUrl: string;
  stockBas: boolean;
  createdAt: string;
}

export interface ProduitRequest {
  nom: string;
  description: string;
  prix: number;
  stock: number;
  imageUrl: string;
}

