package com.trackorder.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProduitResponse(
        Long id,
        String nom,
        String description,
        BigDecimal prix,
        int stock,
        String imageUrl,
        boolean stockBas,
        LocalDateTime createdAt
) {}

