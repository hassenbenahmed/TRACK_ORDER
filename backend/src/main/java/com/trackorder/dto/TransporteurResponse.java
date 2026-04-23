package com.trackorder.dto;

import java.time.LocalDateTime;

public record TransporteurResponse(
        Long id,
        String nom,
        String telephone,
        Double note,
        String vehicule,
        boolean actif,
        int nombreLivraisons,
        LocalDateTime createdAt
) {}

