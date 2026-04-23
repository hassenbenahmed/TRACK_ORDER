package com.trackorder.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ProduitRequest(
        @NotBlank(message = "Le nom du produit est obligatoire")
        String nom,

        String description,

        @Positive(message = "Le prix doit être positif")
        BigDecimal prix,

        @Min(value = 0, message = "Le stock ne peut pas être négatif")
        int stock,

        String imageUrl
) {}

