package com.trackorder.dto;

import java.time.LocalDateTime;

public record ClientResponse(
        Long id,
        String nom,
        String email,
        String adresse,
        String telephone,
        LocalDateTime createdAt,
        int nombreCommandes
) {}

