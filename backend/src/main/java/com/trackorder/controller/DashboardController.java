package com.trackorder.controller;

import com.trackorder.dto.DashboardStatsResponse;
import com.trackorder.entity.enums.LivraisonStatut;
import com.trackorder.entity.enums.PaiementStatut;
import com.trackorder.service.CommandeService;
import com.trackorder.service.LivraisonService;
import com.trackorder.service.PaiementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Statistiques du tableau de bord")
public class DashboardController {

    private final CommandeService commandeService;
    private final LivraisonService livraisonService;
    private final PaiementService paiementService;

    @GetMapping("/stats")
    @Operation(summary = "Obtenir les statistiques du dashboard")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        DashboardStatsResponse baseStats = commandeService.getStats();

        long livraisonsEnCours = livraisonService.countByStatut(LivraisonStatut.EN_TRANSIT)
                + livraisonService.countByStatut(LivraisonStatut.PREPAREE);
        long paiementsEnAttente = paiementService.countByStatut(PaiementStatut.EN_ATTENTE);

        DashboardStatsResponse fullStats = new DashboardStatsResponse(
                baseStats.commandesAujourdhui(),
                livraisonsEnCours,
                baseStats.chiffreAffairesMois(),
                paiementsEnAttente,
                baseStats.commandesParStatut(),
                baseStats.revenusParJour(),
                baseStats.commandesParJour()
        );

        return ResponseEntity.ok(fullStats);
    }
}

