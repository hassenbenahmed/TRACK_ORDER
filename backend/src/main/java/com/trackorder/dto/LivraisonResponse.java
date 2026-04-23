package com.trackorder.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record LivraisonResponse(
        Long id,
        LocalDate dateLivraison,
        BigDecimal cout,
        String statut,
        Long commandeId,
        String commandeReference,
        Long transporteurId,
        String transporteurNom,
        String clientNom,
        LocalDateTime createdAt
) {}

