package com.trackorder.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaiementResponse(
        Long id,
        LocalDateTime datePaiement,
        BigDecimal montant,
        String statut,
        String mode,
        String stripeSessionId,
        Long commandeId,
        String commandeReference,
        LocalDateTime createdAt
) {}

