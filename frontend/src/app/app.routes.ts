import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  {
    path: '',
    loadComponent: () => import('./shared/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'clients', loadComponent: () => import('./features/clients/client-list/client-list.component').then(m => m.ClientListComponent) },
      { path: 'clients/:id', loadComponent: () => import('./features/clients/client-detail/client-detail.component').then(m => m.ClientDetailComponent) },
      { path: 'produits', loadComponent: () => import('./features/produits/produit-list/produit-list.component').then(m => m.ProduitListComponent) },
      { path: 'commandes', loadComponent: () => import('./features/commandes/commande-list/commande-list.component').then(m => m.CommandeListComponent) },
      { path: 'commandes/new', loadComponent: () => import('./features/commandes/commande-create/commande-create.component').then(m => m.CommandeCreateComponent) },
      { path: 'commandes/:id', loadComponent: () => import('./features/commandes/commande-detail/commande-detail.component').then(m => m.CommandeDetailComponent) },
      { path: 'livraisons', loadComponent: () => import('./features/livraisons/livraison-list/livraison-list.component').then(m => m.LivraisonListComponent) },
      { path: 'transporteurs', loadComponent: () => import('./features/transporteurs/transporteur-list/transporteur-list.component').then(m => m.TransporteurListComponent) },
      { path: 'paiements', loadComponent: () => import('./features/paiements/paiement-list/paiement-list.component').then(m => m.PaiementListComponent) },
      { path: 'paiements/success', loadComponent: () => import('./features/paiements/paiement-success/paiement-success.component').then(m => m.PaiementSuccessComponent) },
      { path: 'paiements/cancel', loadComponent: () => import('./features/paiements/paiement-cancel/paiement-cancel.component').then(m => m.PaiementCancelComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

