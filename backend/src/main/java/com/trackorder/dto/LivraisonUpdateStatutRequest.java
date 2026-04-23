package com.trackorder.dto;

import com.trackorder.entity.enums.LivraisonStatut;
import jakarta.validation.constraints.NotNull;

public record LivraisonUpdateStatutRequest(
        @NotNull(message = "Le statut est obligatoire")
        LivraisonStatut statut
) {}

