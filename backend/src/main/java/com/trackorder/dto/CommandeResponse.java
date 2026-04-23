package com.trackorder.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CommandeResponse(
        Long id,
        String reference,
        LocalDateTime dateCommande,
        String statut,
        BigDecimal montantTotal,
        Long clientId,
        String clientNom,
        List<LigneCommandeResponse> lignes,
        LivraisonResponse livraison,
        PaiementResponse paiement
) {}

