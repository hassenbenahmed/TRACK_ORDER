package com.trackorder.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LivraisonCreateRequest(
        @NotNull(message = "L'ID de la commande est obligatoire")
        Long commandeId,

        @NotNull(message = "L'ID du transporteur est obligatoire")
        Long transporteurId,

        LocalDate dateLivraison,

        @Positive(message = "Le coût doit être positif")
        BigDecimal cout
) {}

