package com.trackorder.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record LigneCommandeRequest(
        @NotNull(message = "L'ID du produit est obligatoire")
        Long produitId,

        @Min(value = 1, message = "La quantité doit être au moins 1")
        int quantite
) {}

