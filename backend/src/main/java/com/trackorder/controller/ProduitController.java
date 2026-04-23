package com.trackorder.controller;

import com.trackorder.dto.ProduitRequest;
import com.trackorder.dto.ProduitResponse;
import com.trackorder.service.ProduitService;
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
@RequestMapping("/api/produits")
@RequiredArgsConstructor
@Tag(name = "Produits", description = "Gestion des produits")
public class ProduitController {

    private final ProduitService produitService;

    @GetMapping
    @Operation(summary = "Lister tous les produits (paginé, recherche optionnelle)")
    public ResponseEntity<Page<ProduitResponse>> getAllProduits(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(produitService.getAllProduits(search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un produit par ID")
    public ResponseEntity<ProduitResponse> getProduitById(@PathVariable Long id) {
        return ResponseEntity.ok(produitService.getProduitById(id));
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau produit (ADMIN)")
    public ResponseEntity<ProduitResponse> createProduit(@Valid @RequestBody ProduitRequest request) {
        return new ResponseEntity<>(produitService.createProduit(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un produit (ADMIN)")
    public ResponseEntity<ProduitResponse> updateProduit(@PathVariable Long id,
                                                          @Valid @RequestBody ProduitRequest request) {
        return ResponseEntity.ok(produitService.updateProduit(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un produit (ADMIN)")
    public ResponseEntity<Void> deleteProduit(@PathVariable Long id) {
        produitService.deleteProduit(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Produits avec stock bas")
    public ResponseEntity<List<ProduitResponse>> getLowStockProduits() {
        return ResponseEntity.ok(produitService.getLowStockProduits());
    }
}

