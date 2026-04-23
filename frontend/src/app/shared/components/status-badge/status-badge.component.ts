import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [ngClass]="badgeClass">{{ label }}</span>`,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }
    .badge-en-attente { background: #FEF9C3; color: #A16207; }
    .badge-validee, .badge-preparee { background: #DBEAFE; color: #1D4ED8; }
    .badge-en-cours, .badge-en-transit { background: #FFF7ED; color: #C2410C; }
    .badge-livree, .badge-reussi { background: #DCFCE7; color: #15803D; }
    .badge-annulee, .badge-echouee, .badge-echoue { background: #FEE2E2; color: #DC2626; }
    .badge-rembourse { background: #F3E8FF; color: #7C3AED; }
    .badge-carte { background: #E0E7FF; color: #4338CA; }
    .badge-virement { background: #CCFBF1; color: #0F766E; }
    .badge-stripe { background: #EDE9FE; color: #6D28D9; }
  `]
})
export class StatusBadgeComponent {
  @Input() statut = '';
  @Input() type: 'commande' | 'livraison' | 'paiement' | 'mode' = 'commande';

  get badgeClass(): string {
    return 'badge-' + this.statut.toLowerCase().replace(/_/g, '-');
  }

  get label(): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente', 'VALIDEE': 'Validée', 'EN_COURS': 'En cours',
      'LIVREE': 'Livrée', 'ANNULEE': 'Annulée', 'PREPAREE': 'Préparée',
      'EN_TRANSIT': 'En transit', 'ECHOUEE': 'Échouée', 'REUSSI': 'Réussi',
      'ECHOUE': 'Échoué', 'REMBOURSE': 'Remboursé', 'CARTE': 'Carte',
      'VIREMENT': 'Virement', 'STRIPE': 'Stripe'
    };
    return labels[this.statut] || this.statut;
  }
}

