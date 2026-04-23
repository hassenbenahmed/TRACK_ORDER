package com.trackorder.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClientRequest(
        @NotBlank(message = "Le nom est obligatoire")
        String nom,

        @Email(message = "Format d'email invalide")
        String email,

        @NotBlank(message = "L'adresse est obligatoire")
        String adresse,

        String telephone
) {}

