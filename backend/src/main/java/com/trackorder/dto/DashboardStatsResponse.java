package com.trackorder.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record DashboardStatsResponse(
        long commandesAujourdhui,
        long livraisonsEnCours,
        BigDecimal chiffreAffairesMois,
        long paiementsEnAttente,
        Map<String, Long> commandesParStatut,
        List<RevenueByDay> revenusParJour,
        List<OrdersByDay> commandesParJour
) {
    public record RevenueByDay(LocalDate date, BigDecimal montant) {}
    public record OrdersByDay(LocalDate date, long count) {}
}

