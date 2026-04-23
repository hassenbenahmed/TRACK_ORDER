package com.trackorder.controller;

import com.trackorder.dto.LivraisonCreateRequest;
import com.trackorder.dto.LivraisonResponse;
import com.trackorder.dto.LivraisonUpdateStatutRequest;
import com.trackorder.entity.enums.LivraisonStatut;
import com.trackorder.service.LivraisonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/livraisons")
@RequiredArgsConstructor
@Tag(name = "Livraisons", description = "Gestion des livraisons")
public class LivraisonController {

    private final LivraisonService livraisonService;

    @GetMapping
    @Operation(summary = "Lister toutes les livraisons")
    public ResponseEntity<Page<LivraisonResponse>> getAllLivraisons(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(livraisonService.getAllLivraisons(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir une livraison par ID")
    public ResponseEntity<LivraisonResponse> getLivraisonById(@PathVariable Long id) {
        return ResponseEntity.ok(livraisonService.getLivraisonById(id));
    }

    @PostMapping
    @Operation(summary = "Créer une livraison")
    public ResponseEntity<LivraisonResponse> createLivraison(@Valid @RequestBody LivraisonCreateRequest request) {
        return new ResponseEntity<>(livraisonService.creerLivraison(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/statut")
    @Operation(summary = "Mettre à jour le statut d'une livraison")
    public ResponseEntity<LivraisonResponse> updateStatut(@PathVariable Long id,
                                                           @Valid @RequestBody LivraisonUpdateStatutRequest request) {
        return ResponseEntity.ok(livraisonService.updateStatut(id, request.statut()));
    }

    @GetMapping("/today")
    @Operation(summary = "Livraisons du jour")
    public ResponseEntity<List<LivraisonResponse>> getLivraisonsDuJour() {
        return ResponseEntity.ok(livraisonService.getLivraisonsDuJour());
    }

    @GetMapping("/statut/{statut}")
    @Operation(summary = "Livraisons par statut")
    public ResponseEntity<List<LivraisonResponse>> getLivraisonsByStatut(@PathVariable LivraisonStatut statut) {
        return ResponseEntity.ok(livraisonService.getLivraisonsByStatut(statut));
    }

    @GetMapping("/transporteur/{transporteurId}")
    @Operation(summary = "Livraisons par transporteur")
    public ResponseEntity<List<LivraisonResponse>> getLivraisonsByTransporteur(@PathVariable Long transporteurId) {
        return ResponseEntity.ok(livraisonService.getLivraisonsByTransporteur(transporteurId));
    }
}

