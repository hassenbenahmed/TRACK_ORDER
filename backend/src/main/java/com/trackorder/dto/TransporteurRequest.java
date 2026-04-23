package com.trackorder.dto;

import jakarta.validation.constraints.NotBlank;

public record TransporteurRequest(
        @NotBlank(message = "Le nom est obligatoire")
        String nom,

        @NotBlank(message = "Le téléphone est obligatoire")
        String telephone,

        String vehicule,
        boolean actif
) {}

