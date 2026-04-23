package com.trackorder.controller;

import com.trackorder.dto.CheckoutResponse;
import com.trackorder.dto.PaiementResponse;
import com.trackorder.service.PaiementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Paiements", description = "Gestion des paiements et intégration Stripe")
public class PaiementController {

    private final PaiementService paiementService;

    @PostMapping("/api/paiements/checkout/{commandeId}")
    @Operation(summary = "Créer une session de paiement Stripe")
    public ResponseEntity<CheckoutResponse> createCheckout(@PathVariable Long commandeId) {
        return ResponseEntity.ok(paiementService.createCheckoutSession(commandeId));
    }

    @PostMapping("/api/stripe/webhook")
    @Operation(summary = "Webhook Stripe")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
                                                 @RequestHeader("Stripe-Signature") String sigHeader) {
        paiementService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/api/paiements/commande/{commandeId}")
    @Operation(summary = "Obtenir le paiement d'une commande")
    public ResponseEntity<PaiementResponse> getPaiementByCommande(@PathVariable Long commandeId) {
        return ResponseEntity.ok(paiementService.getPaiementByCommande(commandeId));
    }

    @GetMapping("/api/paiements")
    @Operation(summary = "Lister tous les paiements")
    public ResponseEntity<Page<PaiementResponse>> getAllPaiements(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(paiementService.getAllPaiements(pageable));
    }

    @PostMapping("/api/paiements/{id}/rembourser")
    @Operation(summary = "Rembourser un paiement")
    public ResponseEntity<PaiementResponse> rembourser(@PathVariable Long id) {
        return ResponseEntity.ok(paiementService.rembourser(id));
    }
}

