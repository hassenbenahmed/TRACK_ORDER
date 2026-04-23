package com.trackorder.controller;

import com.trackorder.dto.CommandeCreateRequest;
import com.trackorder.dto.CommandeResponse;
import com.trackorder.entity.enums.CommandeStatut;
import com.trackorder.service.CommandeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/commandes")
@RequiredArgsConstructor
@Tag(name = "Commandes", description = "Gestion des commandes")
public class CommandeController {

    private final CommandeService commandeService;

    @GetMapping
    @Operation(summary = "Lister les commandes (paginé, filtres optionnels)")
    public ResponseEntity<Page<CommandeResponse>> getAllCommandes(
            @RequestParam(required = false) CommandeStatut statut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(commandeService.getAllCommandes(statut, start, end, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir une commande par ID")
    public ResponseEntity<CommandeResponse> getCommandeById(@PathVariable Long id) {
        return ResponseEntity.ok(commandeService.getCommandeById(id));
    }

    @PostMapping
    @Operation(summary = "Créer une nouvelle commande")
    public ResponseEntity<CommandeResponse> createCommande(@Valid @RequestBody CommandeCreateRequest request) {
        return new ResponseEntity<>(commandeService.creerCommande(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/valider")
    @Operation(summary = "Valider une commande")
    public ResponseEntity<CommandeResponse> validerCommande(@PathVariable Long id) {
        return ResponseEntity.ok(commandeService.validerCommande(id));
    }

    @PutMapping("/{id}/annuler")
    @Operation(summary = "Annuler une commande")
    public ResponseEntity<CommandeResponse> annulerCommande(@PathVariable Long id) {
        return ResponseEntity.ok(commandeService.annulerCommande(id));
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "Historique des commandes d'un client")
    public ResponseEntity<Page<CommandeResponse>> getClientCommandes(
            @PathVariable Long clientId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(commandeService.getCommandesByClient(clientId, pageable));
    }

    @GetMapping("/recent")
    @Operation(summary = "Commandes récentes")
    public ResponseEntity<List<CommandeResponse>> getRecentCommandes(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(commandeService.getRecentCommandes(limit));
    }
}

